import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { writeIssueNote } from '../core/issue-note';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';

/**
 * Interrupt-based HITL: the interrupt works, the answer to it does not survive.
 *
 * The take has to be three turns long, and each turn is load-bearing:
 *
 *   1. anything at all       -- `before_model` fires and the interrupt renders
 *   2. a name, in the form   -- `resolve()` sends it, the run continues
 *   3. "what should I call you?" -- and the agent says "Deep Agent"
 *
 * Turn 3 is the finding. Without it the clip shows an interrupt working, which
 * is not what was reported. The name is deliberately one no model would produce
 * on its own, so nobody can argue the agent guessed it.
 */

/** A name distinctive enough that the reply cannot be a coincidence. */
const AGENT_NAME = 'Fiqros';

/**
 * Answers the interrupt's form.
 *
 * `input[name="response"]` and its submit button are the demo page's own markup
 * -- the doc prints exactly this form -- so they are targeted directly rather
 * than through the chat selectors, which do not match a component rendered
 * inside an interrupt.
 */
async function answerInterrupt(ctx: ActionContext, page: Page, answer: string): Promise<boolean> {
  const field = page.locator('input[name="response"]').first();

  // `waitFor`, not `isVisible({ timeout })`. Playwright's isVisible is a
  // non-retrying snapshot -- its `timeout` bounds the call, it does not poll --
  // so it answered "no form" the instant the prompt was sent, before the agent
  // had even started. Anything that appears *after* an agent run has to be
  // waited for; isVisible is only safe for things already on the page.
  const appeared = await field
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);

  if (!appeared) {
    ctx.warn(`The interrupt form never appeared.`);
    return false;
  }

  const box = await field.boundingBox();
  if (box) {
    await humanGlide(page, box.x + Math.min(box.width / 2, 120), box.y + box.height / 2, 20);
    await sleep(300);
    await humanClick(page);
  }

  await field.click({ timeout: 5000 }).catch(() => {});
  await field.type(answer, { delay: 105 });
  await sleep(600);

  const submit = page.locator('button[type="submit"]:visible').first();
  if (await submit.isVisible({ timeout: 4000 }).catch(() => false)) {
    const sBox = await submit.boundingBox();
    if (sBox) {
      await humanGlide(page, sBox.x + sBox.width / 2, sBox.y + sBox.height / 2, 18);
      await sleep(250);
      await humanClick(page);
    }
    await submit.click({ timeout: 4000 }).catch(() => {});
  } else {
    await field.press('Enter');
  }

  console.log(`   ✓ Answered the interrupt with "${answer}".`);
  return true;
}

export const runInterruptAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const [opening, followUp] = promptsFor(config);


  console.log(`   [Interrupt] Opening turn to trigger before_model...`);
  await sendPrompt(page, opening, { timeoutMs: 12000 });

  const answered = await answerInterrupt(ctx, page, AGENT_NAME);
  if (!answered) {
    // The interrupt not rendering at all is a different, worse finding than the
    // one on the report, and it must not be filed as this one.
    throw new Error(
      'The interrupt form never rendered, so the reported defect (the name not ' +
        'being used afterwards) could not be reached. This is a different failure.',
    );
  }

  await waitForAgentResponseCompletion(page, 2500);

  const msgCount = await sendPrompt(page, followUp ?? 'What should I call you?', {
    timeoutMs: 12000,
  });
  await waitForAgentResponseCompletion(page, 1500, msgCount);

  await sleep(config.waitAfterPromptMs ?? 4000);

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue);
  }
};
