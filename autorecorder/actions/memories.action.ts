import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { writeIssueNote } from '../core/issue-note';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { glideClick, glideTo, waitForText } from './glide-click';

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
 * the page never mentions. That needs an Intelligence key this harness does not
 * have, so it answers 503 and the save fails the same way.
 *
 * Nothing here fails the take on those results: they are the finding, carried
 * by `knownIssue` (`[ISSUE]`). The handler only fails when the surface it needs
 * to film is missing.
 */

async function save(page: Page, ctx: ActionContext, label: string): Promise<string> {
  const button = page.locator('[data-testid=memory-save]');
  if (!(await button.isVisible({ timeout: 8000 }).catch(() => false))) {
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

export const runMemoriesAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath: string,
  ctx: ActionContext,
) => {
  const prompts = promptsFor(config);

  // Pass 1 -- as documented.
  console.log('   [Memories] 1/2: the runtime the page describes...');
  await waitForText(page.locator('[data-testid=memory-isLoading]'), (t) => t === 'false', 20_000);
  await glideTo(page, page.locator('[data-testid=memory-list]'), 1500);
  const documented = await save(page, ctx, 'documented runtime');
  console.log(`   [Memories] save on the documented runtime: ${documented}`);

  const msgCount = await sendPrompt(page, prompts[0]);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 3000, msgCount);

  // Pass 2 -- with the option the page leaves out.
  console.log('   [Memories] 2/2: the same graphs with memory.access...');
  await glideClick(page, page.locator('[data-testid=memory-runtime-memory-access]'));
  await sleep(2000);
  await waitForText(page.locator('[data-testid=memory-isLoading]'), (t) => t === 'false', 20_000);
  await glideTo(page, page.locator('[data-testid=memory-list]'), 1500);
  const opened = await save(page, ctx, 'memory.access runtime');
  console.log(`   [Memories] save with memory.access: ${opened}`);

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue, {
      extraLines: [`documented runtime save: ${documented}`, `memory.access mount save: ${opened}`],
    });
  }
};
