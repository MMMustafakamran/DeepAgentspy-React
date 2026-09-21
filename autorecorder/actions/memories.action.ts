import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { markServerLogs } from './error-evidence';
import { evidenceThenIssueNote, glideClick, glideTo, visibleWithin, waitForText } from './glide-click';

/**
 * Memories & Recall -- the documented runtime, then the undocumented option.
 *
 * Pass one is the page as written, on the Deep Agents Quickstart's runtime. It
 * is not an Intelligence runtime, so `/info` carries no Intelligence socket and
 * the client's memory store never gets a context: no memory request leaves the
 * browser, the hook keeps reporting `isAvailable true` over an empty list, and
 * the save fails client-side with "Runtime URL is not configured". The agent,
 * asked to remember something, says it will.
 *
 * Pass two switches to the mount carrying `memory: { access }` -- the option
 * the page never mentions. It is an Intelligence runtime: with
 * `CPK_INTELLIGENCE_API_KEY` set the platform itself answers (and its code is
 * on the terminal); without one the mount answers 503. The note is written
 * from what the take saw, so it holds either way.
 *
 * Nothing here fails the take on those results: they are the finding, carried
 * by `knownIssue` (`[ISSUE]`). The handler only fails when the surface it needs
 * to film is missing.
 */

/** Memory routes and the platform's memory codes. */
const RELEVANT = /memor|MEMORY_/i;

const NOTE_HEAD = [
  'memories - blocked on entitlement',
  '',
  'the /v2 import bug is fixed upstream as of 21 sep, snippet compiles now',
  'runtime needs memory: { access }, page never says',
  'org has no memory (403 MEMORY_NOT_ENTITLED), managed so no embedder needed',
];

/** What the memory.access mount did, in the tester's words. */
function accessLines(serverLines: string[], opened: string): string[] {
  const text = serverLines.join('\n');
  if (/MEMORY_NOT_ENTITLED/.test(text)) {
    return [
      'memory.access mount (option the page never mentions) reaches the platform:',
      '403 MEMORY_NOT_ENTITLED. hook still says isAvailable true, list empty.',
      'page says unentitled shows as isAvailable false. it does not',
    ];
  }
  if (/\b503\b/.test(text) || /CPK_INTELLIGENCE_API_KEY is not set/.test(opened)) {
    return ['memory.access mount (option the page never mentions) needs an intelligence key', 'no key here, so it is the 503s'];
  }
  return ['memory.access mount (option the page never mentions): see terminal'];
}

async function save(page: Page, ctx: ActionContext, label: string): Promise<string> {
  const button = page.locator('[data-testid=memory-save]');
  if (!(await visibleWithin(button, 8000))) {
    ctx.fail(`${label}: the save button never rendered`);
    return '';
  }
  await glideClick(page, button);
  const result = await waitForText(
    page.locator('[data-testid=memory-save-result]'),
    (t) => t.length > 0 && !t.startsWith('saving'),
    20_000,
  );
  await glideTo(page, page.locator('[data-testid=memory-probe]'), 2500);
  return result;
}

/**
 * Waits until the hook has heard back from the runtime: `isAvailable` flips to
 * false or an error shows up (ported from Agno-react). `isLoading` is no
 * signal -- it reads false before the memory store has started. On the
 * Quickstart runtime nothing is ever heard back, so the cap is short.
 */
async function settledMemory(page: Page, capMs: number): Promise<void> {
  const deadline = Date.now() + capMs;
  while (Date.now() < deadline) {
    const available = (await page.locator('[data-testid=memory-isAvailable]').textContent().catch(() => '')) ?? '';
    const error = (await page.locator('[data-testid=memory-error]').textContent().catch(() => '')) ?? '';
    if (available.trim() === 'false' || (error.trim() && error.trim() !== 'null')) return;
    await sleep(500);
  }
}

export const runMemoriesAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
) => {
  const logs = markServerLogs(rootPath);
  const prompts = promptsFor(config);

  // Pass 1 -- as documented.
  console.log('   [Memories] 1/2: the runtime the page describes...');
  await settledMemory(page, 8000);
  await glideTo(page, page.locator('[data-testid=memory-list]'), 1500);
  const documented = await save(page, ctx, 'documented runtime');
  console.log(`   [Memories] save on the documented runtime: ${documented}`);

  const msgCount = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, msgCount);

  // Pass 2 -- with the option the page leaves out.
  console.log('   [Memories] 2/2: the same graphs with memory.access...');
  await glideClick(page, page.locator('[data-testid=memory-runtime-memory-access]'));
  await sleep(2000);
  await settledMemory(page, 20_000);
  await glideTo(page, page.locator('[data-testid=memory-list]'), 1500);
  const opened = await save(page, ctx, 'memory.access runtime');
  console.log(`   [Memories] save with memory.access: ${opened}`);

  // The note depends on what the memory.access mount answered, which is only
  // known from the server lines -- so it is built after they are read.
  await evidenceThenIssueNote(page, config, logs, RELEVANT, {
    note: (lines) => [...NOTE_HEAD, '', ...accessLines(lines, opened)].join('\n'),
    extraLines: () => [`save, as documented: ${documented}`, `save, with memory.access: ${opened}`],
  });
};
