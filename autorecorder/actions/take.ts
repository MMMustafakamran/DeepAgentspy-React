import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Page } from 'playwright';
import { SELECTORS } from '../config/selectors.config';
import { generateIdeHtml } from '../core/ide/generator';
import { humanClick, humanGlide, setGlobalCursorPos, sleep } from '../core/overlays/cursor';
import { between, beat, jitter, pause } from '../core/overlays/human';
import { closeNotepad, openNotepad, typeInNotepad } from '../core/overlays/notepad';
import { clickTaskbarApp, ensureOverlays, waitForHydration } from '../core/overlays/taskbar';
import { type ActionContext } from '../core/types';

/**
 * A scripted take: the demo script's on-screen steps, in its order, done the
 * way a tester would do them.
 *
 * A demo script alternates between four places -- the doc page, the editor, the
 * app, and a Notepad the tester writes in -- and the engine's fixed intro
 * (doc skim -> every IDE tab -> demo) cannot interleave them. A page that sets
 * `ownsTake: true` hands the whole take to its handler, which describes it as
 * a list of steps and passes it here.
 *
 *   doc      open (or stay on) a doc URL, scroll to a snippet, drag-select it
 *   ide      switch to the editor, open files, drag-select line ranges
 *   browser  switch back to the browser and do anything with the page
 *   note     open Notepad from the taskbar, type one line of dialogue, minimise
 *
 * Nothing here is framework-specific, and nothing is drawn that a person could
 * not have produced: the taskbar, the editor window and Notepad are the same
 * simulated desktop the engine uses, and the app is the real app. No captions.
 *
 * Portable as a file: it depends on core/ only through exports every copy has
 * (generateIdeHtml, the cursor/taskbar/notepad overlays, SELECTORS).
 */

export interface DocSelection {
  /** Text the selection starts at, e.g. `<CopilotKit`. */
  from: string;
  /** Text the selection ends after. Defaults to the end of `from`'s line. */
  to?: string;
  /** Only look in a code block that also contains this (disambiguates repeats). */
  within?: string;
  /** Look at the selection this long before moving on. */
  dwellMs?: number;
}

export interface IdeRange {
  /** Repo-relative file. Several ranges in one file share one editor tab. */
  file: string;
  from: number;
  to: number;
  /**
   * Text that must appear in the range. Checked against the file before the
   * take films it, so drifted line numbers are reported instead of filmed.
   */
  expect?: string;
  dwellMs?: number;
}

export type TakeStep =
  | { kind: 'doc'; url: string; select: DocSelection[] }
  | { kind: 'ide'; ranges: IdeRange[] }
  | { kind: 'browser'; label: string; run: (page: Page) => Promise<void> }
  | { kind: 'note'; text: string; fileName?: string; dwellMs?: number };

export interface TakeEnv {
  page: Page;
  /** Repo root, for reading IDE files. */
  rootDir: string;
  /** The app's origin. The editor is served from it so editor <-> app hops are same-origin. */
  origin: string;
  ctx: ActionContext;
  /** Default Notepad tab name. */
  noteFile?: string;
}

type App = 'chrome' | 'vscode' | 'none';

/** Runs the steps in order. Throws only on what makes the rest meaningless. */
export async function runTake(steps: TakeStep[], env: TakeEnv): Promise<void> {
  let app: App = 'none';
  let ideCount = 0;

  const switchTo = async (next: 'chrome' | 'vscode'): Promise<void> => {
    if (app !== 'none' && app !== next) await clickTaskbarApp(env.page, next);
    app = next;
  };

  for (const [i, step] of steps.entries()) {
    const tag = `   [take ${i + 1}/${steps.length}]`;
    switch (step.kind) {
      case 'doc':
        console.log(`${tag} doc: ${step.select.map((s) => s.from).join(' | ')}`);
        await switchTo('chrome');
        await docStep(env, step.url, step.select);
        break;
      case 'ide':
        console.log(`${tag} ide: ${step.ranges.map((r) => `${r.file}:${r.from}-${r.to}`).join(', ')}`);
        await switchTo('vscode');
        await ideStep(env, step.ranges, ++ideCount);
        break;
      case 'browser':
        console.log(`${tag} browser: ${step.label}`);
        await switchTo('chrome');
        await step.run(env.page);
        break;
      case 'note':
        console.log(`${tag} note: ${step.text.split('\n')[0].slice(0, 80)}`);
        await noteStep(env, step.text, step.fileName, step.dwellMs);
        break;
    }
  }
}

// ── browser helpers ─────────────────────────────────────────────────────────

/**
 * Navigates the (simulated) browser to a URL the way the take expects every
 * page to be: taskbar and cursor back on, and an HTTP error treated as the
 * failure it is rather than filmed as a blank page.
 */
export async function openUrl(page: Page, url: string, timeoutMs = 60_000): Promise<void> {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
  const status = res?.status() ?? 0;
  if (status >= 400) throw new Error(`${url} returned HTTP ${status}`);
  await ensureOverlays(page, 'chrome');
}

// ── doc ─────────────────────────────────────────────────────────────────────

async function docStep(env: TakeEnv, url: string, selections: DocSelection[]): Promise<void> {
  const { page } = env;
  if (page.url().split('#')[0] !== url) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForSelector(SELECTORS.docContentReady, { state: 'visible', timeout: 8000 }).catch(() => {});
    await ensureOverlays(page, 'chrome');
    // A hydration remount resets scroll, so do not scroll before it lands. The
    // reader glances at the title meanwhile.
    const hydrated = waitForHydration(page, 15_000);
    await sleep(500);
    await humanGlide(page, 900, 330, 16);
    await hydrated;
    await pause(600);
  }

  for (const sel of selections) {
    const found = await scrollToDocText(page, sel);
    if (!found) {
      env.ctx.warn(`Doc page: could not find "${sel.from}" in a code block on ${url} -- the page may have changed`);
      continue;
    }
    await dragSelectDocText(page, 26);
    await pause(sel.dwellMs ?? 2200);
  }
  await page.evaluate(() => window.getSelection()?.removeAllRanges()).catch(() => {});
}

/**
 * Finds the snippet's character range inside a visible code block, scrolls it
 * to the upper third of the screen, and stashes it on window for the drag.
 */
async function scrollToDocText(page: Page, sel: DocSelection): Promise<boolean> {
  const ok = await page
    .evaluate(
      ({ from, to, within, blockSel }) => {
        const blocks = Array.from(document.querySelectorAll<HTMLElement>(blockSel)).filter((el) => {
          const r = el.getBoundingClientRect();
          const t = el.textContent ?? '';
          return r.width > 0 && r.height > 0 && t.includes(from) && (!within || t.includes(within));
        });
        const pre = blocks[0];
        if (!pre) return false;

        // Text nodes in order, with their offsets in the concatenated text.
        const nodes: { node: Text; start: number }[] = [];
        const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
        let all = '';
        for (let n = walker.nextNode(); n; n = walker.nextNode()) {
          nodes.push({ node: n as Text, start: all.length });
          all += (n as Text).data;
        }
        const start = all.indexOf(from);
        if (start < 0) return false;
        let end: number;
        if (to) {
          const at = all.indexOf(to, start);
          end = at < 0 ? start + from.length : at + to.length;
        } else {
          const nl = all.indexOf('\n', start);
          end = nl < 0 ? all.length : nl;
        }
        (window as any).__takeDoc = { nodes, start, end };

        const locate = (offset: number): [Text, number] => {
          let k = nodes.length - 1;
          while (k > 0 && nodes[k].start > offset) k--;
          const { node, start: s } = nodes[k];
          return [node, Math.min(offset - s, node.data.length)];
        };
        (window as any).__takeLocate = locate;

        const r = document.createRange();
        const [n0, o0] = locate(start);
        r.setStart(n0, o0);
        r.setEnd(n0, Math.min(o0 + 1, n0.data.length));
        const top = r.getBoundingClientRect().top;

        let scroller: HTMLElement | null = pre.parentElement;
        while (scroller && !(scroller.scrollHeight > scroller.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(scroller).overflowY))) {
          scroller = scroller.parentElement;
        }
        const delta = top - 300;
        if (scroller) scroller.scrollBy({ top: delta, behavior: 'smooth' });
        else window.scrollBy({ top: delta, behavior: 'smooth' });
        return true;
      },
      { from: sel.from, to: sel.to ?? '', within: sel.within ?? '', blockSel: 'pre' },
    )
    .catch(() => false);
  if (ok) await sleep(1100);
  return ok;
}

/**
 * Drag-selects the stashed range: press at its first character, then extend
 * the browser's own selection a few characters at a time with the cursor on
 * the moving end, the way a hand drags across code.
 */
async function dragSelectDocText(page: Page, steps: number): Promise<void> {
  const point = (offset: number) =>
    page
      .evaluate((off) => {
        const d = (window as any).__takeDoc;
        const locate = (window as any).__takeLocate;
        if (!d || !locate) return null;
        const [n, o] = locate(off);
        const r = document.createRange();
        r.setStart(n, o);
        r.setEnd(n, o);
        let rect = r.getBoundingClientRect();
        if (!rect.height) {
          const rr = document.createRange();
          rr.setStart(n, Math.max(0, o - 1));
          rr.setEnd(n, o);
          const b = rr.getBoundingClientRect();
          rect = new DOMRect(b.right, b.top, 0, b.height);
        }
        return { x: rect.left, y: rect.top + rect.height / 2 };
      }, offset)
      .catch(() => null);

  const range = (await page.evaluate(() => (window as any).__takeDoc && { s: (window as any).__takeDoc.start, e: (window as any).__takeDoc.end })) as
    | { s: number; e: number }
    | null;
  if (!range) return;

  const p0 = await point(range.s);
  if (!p0) return;
  await humanGlide(page, p0.x + 1, p0.y, 18);
  await sleep(between(80, 160));
  await pressCursor(page, true);

  for (let k = 1; k <= steps; k++) {
    const off = Math.round(range.s + ((range.e - range.s) * k) / steps);
    const p = await page
      .evaluate(
        ({ s, off }) => {
          const locate = (window as any).__takeLocate;
          const [n0, o0] = locate(s);
          const [n1, o1] = locate(off);
          const sel = window.getSelection();
          const r = document.createRange();
          r.setStart(n0, o0);
          r.setEnd(n1, o1);
          sel?.removeAllRanges();
          sel?.addRange(r);
          const c = document.createRange();
          c.setStart(n1, o1);
          c.setEnd(n1, o1);
          let rect = c.getBoundingClientRect();
          if (!rect.height) {
            const rr = document.createRange();
            rr.setStart(n1, Math.max(0, o1 - 1));
            rr.setEnd(n1, o1);
            const b = rr.getBoundingClientRect();
            rect = new DOMRect(b.right, b.top, 0, b.height);
          }
          return { x: rect.left, y: rect.top + rect.height / 2 };
        },
        { s: range.s, off },
      )
      .catch(() => null);
    if (p) await moveCursorTo(page, p.x, p.y);
    await sleep(jitter(38, 0.4));
  }
  await sleep(between(60, 120));
  await pressCursor(page, false);
}

async function pressCursor(page: Page, down: boolean): Promise<void> {
  await page
    .evaluate((d) => {
      const c = document.getElementById('playwright-virtual-mouse');
      if (c) c.style.transform = `translate(-4px, -2px) scale(${d ? 0.9 : 1})`;
    }, down)
    .catch(() => {});
}

async function moveCursorTo(page: Page, x: number, y: number): Promise<void> {
  await page
    .evaluate(
      ({ x, y }) => {
        const c = document.getElementById('playwright-virtual-mouse');
        if (c) {
          c.style.left = `${x.toFixed(1)}px`;
          c.style.top = `${y.toFixed(1)}px`;
        }
      },
      { x, y },
    )
    .catch(() => {});
  setGlobalCursorPos(x, y);
}

// ── ide ─────────────────────────────────────────────────────────────────────

const LINE_PX = 22; // one editor row in core/ide/generator.ts

async function ideStep(env: TakeEnv, ranges: IdeRange[], n: number): Promise<void> {
  const { page } = env;

  // Check the ranges against the files before filming them.
  for (const r of ranges) {
    if (!r.expect) continue;
    const lines = readFileSync(join(env.rootDir, r.file), 'utf-8').replace(/\r\n/g, '\n').split('\n');
    if (!lines.slice(r.from - 1, r.to).some((l) => l.includes(r.expect!))) {
      env.ctx.warn(`IDE: ${r.file}:${r.from}-${r.to} no longer contains "${r.expect}" -- the line numbers drifted`);
    }
  }

  const files = [...new Set(ranges.map((r) => r.file))];
  const firstOf = (f: string) => ranges.find((r) => r.file === f)!;
  const [head, ...rest] = files;
  const html = await generateIdeHtml(
    env.rootDir,
    head,
    firstOf(head).from,
    firstOf(head).to,
    rest.map((f) => ({ filePath: f, startLine: firstOf(f).from, endLine: firstOf(f).to })),
    0,
  );
  // Nothing on camera is painted in advance: the generator marks the first
  // range of each tab, the drag below does the highlighting.
  const url = new URL(`/__autorecord_take_ide_${n}__`, env.origin).toString();
  await page.route(url, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: html.replace(
        '</head>',
        '<style>@keyframes __tkIn{from{opacity:0;transform:scale(.992)}to{opacity:1;transform:none}}body{animation:__tkIn .18s ease-out both}</style></head>',
      ),
    }),
  );
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await ensureOverlays(page, 'vscode');
  await sleep(350);

  let activeTab = 0;
  for (const r of ranges) {
    const tab = files.indexOf(r.file);
    if (tab !== activeTab) {
      const t = page.locator(`#ide-tab-${tab}`);
      const box = await t.boundingBox().catch(() => null);
      if (box) {
        await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 18);
        await humanClick(page);
      }
      await page.evaluate(`window.switchIdeTab && window.switchIdeTab(${tab})`).catch(() => {});
      activeTab = tab;
      await sleep(350);
    }
    await scrollEditorTo(page, tab, r.from);
    await dragSelectLines(page, tab, r.from, r.to);
    await pause(r.dwellMs ?? 2400);
  }

  await Promise.race([page.unroute(url).catch(() => {}), sleep(3000)]);
}

/** Scrolls one tab's code viewport so `line` sits in the upper third, smoothly. */
async function scrollEditorTo(page: Page, tab: number, line: number): Promise<void> {
  const target = Math.max(0, (line - 9) * LINE_PX);
  await page
    .evaluate(
      async ({ tab, target }) => {
        const vp = document.querySelector(`#ide-view-${tab} .code-viewport`) as HTMLElement | null;
        if (!vp) return;
        const y0 = vp.scrollTop;
        const d = target - y0;
        if (Math.abs(d) < 15) return;
        for (let i = 1; i <= 30; i++) {
          const t = i / 30;
          vp.scrollTop = y0 + d * (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          await new Promise((res) => setTimeout(res, 20));
        }
      },
      { tab, target },
    )
    .catch(() => {});
  await sleep(350);
}

/** Press at the first line, drag down to the last; the highlight follows the cursor. */
async function dragSelectLines(page: Page, tab: number, from: number, to: number): Promise<void> {
  const paint = (upTo: number) =>
    page.evaluate(`window.selectIdeLines && window.selectIdeLines(${tab}, ${from}, ${upTo})`).catch(() => {});
  const row = (n: number) => page.locator(`#ide-view-${tab} .code-line[data-line="${n}"] .line-content`);
  const first = await row(from).boundingBox().catch(() => null);
  if (!first) {
    await paint(to);
    return;
  }
  await humanGlide(page, first.x + 6, first.y + first.height / 2, 18);
  await sleep(between(60, 140));
  await pressCursor(page, true);
  await paint(from);

  // Drag right along a single line, down across several.
  const lastBox = await row(to).boundingBox().catch(() => null);
  const endX = first.x + Math.min(520, Math.max(160, (lastBox?.width ?? 400) * 0.6));
  const endY = (lastBox ?? first).y + first.height / 2;
  const steps = Math.max(8, (to - from) * 3);
  for (let k = 1; k <= steps; k++) {
    const t = k / steps;
    const x = first.x + 6 + (endX - first.x - 6) * t + between(-2, 2);
    const y = first.y + first.height / 2 + (endY - first.y - first.height / 2) * t;
    await moveCursorTo(page, x, y);
    await paint(Math.min(to, from + Math.round((to - from) * t)));
    await sleep(jitter(32, 0.4));
  }
  await sleep(between(50, 110));
  await pressCursor(page, false);
}

// ── note ────────────────────────────────────────────────────────────────────

/** Notepad from the taskbar, one line of dialogue typed, a beat to read, minimised. */
async function noteStep(env: TakeEnv, text: string, fileName?: string, dwellMs?: number): Promise<void> {
  await beat(700);
  await openNotepad(env.page, fileName ?? env.noteFile ?? 'notes.txt');
  await typeInNotepad(env.page, text, { charDelayMs: 42, thinkChance: 0.04 });
  // Reading time scales with length: ~1.5s floor plus ~35ms a character.
  await closeNotepad(env.page, dwellMs ?? Math.min(6000, 1500 + text.length * 35));
}
