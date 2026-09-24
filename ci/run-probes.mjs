/**
 * Runs the finding probes in ci/findings.probes.mjs against running servers
 * and writes PROBES_REPORT.{json,md} beside RUN_REPORT in autorecorder/videos.
 *
 *   still-broken    the finding reproduces as published
 *   possibly-fixed  the error is absent AND the page rendered/connected
 *   probe-error     anything else (app down, timeout, unexpected error)
 *
 * Always exits 0 and never edits FINDINGS.md: a human confirms a fix.
 *
 *   node ci/run-probes.mjs [--base=http://127.0.0.1:3030] [--only=22,3]
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { FRONTEND_URL, FRONTEND_DIR, BACKEND_DIR, RECORDER_DIR, VIDEOS_DIR } from './lib/config.mjs';
import { PROBES } from './findings.probes.mjs';

const FRONTEND_PKGS = ['@copilotkit/react-core', '@copilotkit/runtime', '@ag-ui/langgraph'];
const PY_PKGS = ['copilotkit', 'deepagents'];

function npmVersion(name) {
  try {
    const p = path.join(FRONTEND_DIR, 'node_modules', ...name.split('/'), 'package.json');
    return JSON.parse(fs.readFileSync(p, 'utf8')).version;
  } catch {
    return 'not installed';
  }
}

/** Reads *.dist-info from the backend venv (Windows or POSIX layout). */
function pyVersions() {
  const out = Object.fromEntries(PY_PKGS.map((n) => [n, 'not installed']));
  const venv = path.join(BACKEND_DIR, '.venv');
  const dirs = [path.join(venv, 'Lib', 'site-packages')];
  try {
    for (const d of fs.readdirSync(path.join(venv, 'lib'))) dirs.push(path.join(venv, 'lib', d, 'site-packages'));
  } catch {}
  for (const dir of dirs) {
    let entries = [];
    try { entries = fs.readdirSync(dir); } catch { continue; }
    for (const e of entries) {
      const m = /^(.+?)-([^-]+)\.dist-info$/.exec(e);
      if (m && PY_PKGS.includes(m[1].toLowerCase().replace(/_/g, '-'))) out[m[1].toLowerCase()] = m[2];
    }
  }
  return out;
}

export function collectVersions() {
  return {
    ...Object.fromEntries(FRONTEND_PKGS.map((n) => [n, npmVersion(n)])),
    ...Object.fromEntries(Object.entries(pyVersions()).map(([k, v]) => [`${k} (PyPI)`, v])),
  };
}

function loadPlaywright() {
  const req = createRequire(path.join(RECORDER_DIR, 'package.json'));
  return req('playwright');
}

async function reachable(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

function headline(r, versions) {
  if (r.status !== 'possibly-fixed') return null;
  return `#${r.finding} possibly fixed — ${r.fixedWhen} (@copilotkit/react-core ${versions['@copilotkit/react-core']})`;
}

export function probesMarkdown(result) {
  if (!result) return '_Finding probes did not run._\n';
  const lines = [];
  for (const r of result.results) {
    const h = headline(r, result.versions);
    if (h) lines.push(`> **🚨 ${h}** — verify by hand, then update FINDINGS.md.`, '');
  }
  lines.push('| Finding | Page | Status | Evidence |', '|---|---|---|---|');
  for (const r of result.results) {
    const icon = { 'still-broken': '🔴', 'possibly-fixed': '🟢', 'probe-error': '⚠️' }[r.status];
    lines.push(`| #${r.finding} | ${r.page} | ${icon} ${r.status} | ${String(r.evidence).replace(/\|/g, '\|').replace(/\n/g, ' ')} |`);
  }
  lines.push('', '**Versions:** ' + Object.entries(result.versions).map(([k, v]) => `\`${k}\` ${v}`).join(', '), '');
  return lines.join('\n');
}

export async function runProbes({ base = FRONTEND_URL, only } = {}) {
  const versions = collectVersions();
  const selected = Object.entries(PROBES).filter(([k]) => !only || only.includes(k));
  const results = [];
  let browser;
  const baseUp = await reachable(base);

  for (const [finding, probe] of selected) {
    const url = new URL(probe.route, base).href;
    const r = { finding, id: probe.id, page: probe.page, route: probe.route, fixedWhen: probe.fixedWhen };
    const started = Date.now();
    try {
      if (!baseUp) throw new Error(`frontend not reachable at ${base}`);
      browser ??= await loadPlaywright().chromium.launch({ headless: true });
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      const consoleErrors = [];
      page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
      try {
        const out = await probe.run(page, { url, consoleErrors });
        if (out.broken) r.status = 'still-broken';
        else if (out.rendered === true) r.status = 'possibly-fixed';
        else { r.status = 'probe-error'; out.evidence = `not broken but page not confirmed rendered: ${out.evidence}`; }
        r.evidence = out.evidence;
      } finally {
        await ctx.close().catch(() => {});
      }
    } catch (err) {
      r.status = 'probe-error';
      r.evidence = String(err?.message || err).split('\n')[0];
    }
    r.durationSec = Math.round((Date.now() - started) / 100) / 10;
    results.push(r);
  }
  await browser?.close().catch(() => {});

  const result = { timestamp: new Date().toISOString(), base, versions, results };
  result.headlines = results.map((r) => headline(r, versions)).filter(Boolean);

  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  fs.writeFileSync(path.join(VIDEOS_DIR, 'PROBES_REPORT.json'), JSON.stringify(result, null, 2));
  const md = '## 🧪 Finding probes\n\n' + probesMarkdown(result);
  fs.writeFileSync(path.join(VIDEOS_DIR, 'PROBES_REPORT.md'), md);
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split('=').slice(1).join('=');
  try {
    const result = await runProbes({ base: arg('base') || FRONTEND_URL, only: arg('only')?.split(',') });
    for (const r of result.results) console.log(`#${r.finding} ${r.status}: ${r.evidence}`);
    for (const h of result.headlines) console.log(`\n🚨 ${h}`);
    console.log(`\nVersions: ${JSON.stringify(result.versions)}`);
    console.log(`Report: ${path.join(VIDEOS_DIR, 'PROBES_REPORT.md')}`);
    if (process.env.GITHUB_STEP_SUMMARY) {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '\n' + fs.readFileSync(path.join(VIDEOS_DIR, 'PROBES_REPORT.md'), 'utf8'));
    }
  } catch (err) {
    console.warn(`⚠️  Finding probes failed to run: ${err?.message || err}`);
  }
  process.exit(0);
}
