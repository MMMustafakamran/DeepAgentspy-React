import { type Locator, type Page } from 'playwright';
import { writeIssueNote } from '../core/issue-note';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageRecordConfig } from '../core/types';
import { type LogMark, serverLogSince, showNextIssues, showServerTerminal } from './error-evidence';

/**
 * Glide the on-screen cursor to an element and click it, the way the other
 * handlers do by hand. Falls back to a plain click when the element has no box
 * yet (mid-layout), so a take never stalls on the cursor overlay.
 */
export async function glideClick(page: Page, target: Locator): Promise<void> {
  await target.scrollIntoViewIfNeeded().catch(() => {});
  const box = await target.boundingBox();
  if (box) {
    await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
    await humanClick(page);
  } else {
    await target.click();
  }
}

/** Rest the cursor on an element so the viewer's eye lands there. */
export async function glideTo(page: Page, target: Locator, pauseMs = 1500): Promise<void> {
  const box = await target.boundingBox().catch(() => null);
  if (box) await humanGlide(page, box.x + Math.min(box.width / 2, 240), box.y + box.height / 2, 25);
  await sleep(pauseMs);
}

/**
 * Poll an element's text until `test` passes or the time runs out. Returns the
 * last text seen either way, so the caller decides what a miss means.
 */
export async function waitForText(
  target: Locator,
  test: (text: string) => boolean,
  timeoutMs: number,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  let last = '';
  while (Date.now() < deadline) {
    last = ((await target.textContent({ timeout: 1000 }).catch(() => '')) ?? '').trim();
    if (test(last)) return last;
    await sleep(500);
  }
  return last;
}

/**
 * Whether an element becomes visible within `timeoutMs`. Not
 * `locator.isVisible({ timeout })`: Playwright ignores that timeout and answers
 * at once, which on a cold `next dev` route reads "not there yet" as "never".
 */
export async function visibleWithin(target: Locator, timeoutMs: number): Promise<boolean> {
  return target
    .waitFor({ state: 'visible', timeout: timeoutMs })
    .then(() => true)
    .catch(() => false);
}

/**
 * The end of every defect take here: the real Next.js issues overlay, then the
 * dev servers' own lines from this take, then the ONE note -- the page's
 * `knownIssue`, typed by core `writeIssueNote`. Same order as Agno-react's
 * `showEvidence`; the explanation comes from the config because this repo's
 * report and Notepad share that object.
 *
 * `note` replaces `knownIssue.note` for a take whose outcome depends on the
 * environment (an Intelligence key or not); `extraLines(serverLines)` adds what
 * only this take knows (a save result) before the version lines.
 */
export async function evidenceThenIssueNote(
  page: Page,
  config: PageRecordConfig,
  logs: LogMark,
  relevant: RegExp,
  opts: {
    note?: (serverLines: string[]) => string;
    extraLines?: (serverLines: string[]) => string[];
  } = {},
): Promise<void> {
  const overlay = await showNextIssues(page);
  console.log(`   [evidence] Next overlay: ${overlay ?? '(no issues badge)'}`);
  const serverLines = serverLogSince(logs, { relevant });
  console.log(`   [evidence] ${serverLines.length} server line(s) on screen`);
  for (const l of serverLines) console.log(`      | ${l}`);
  await showServerTerminal(page, serverLines);
  if (config.knownIssue) {
    const issue = opts.note ? { ...config.knownIssue, note: opts.note(serverLines) } : config.knownIssue;
    await writeIssueNote(page, config.id, issue, { extraLines: opts.extraLines?.(serverLines) ?? [] });
  }
}
