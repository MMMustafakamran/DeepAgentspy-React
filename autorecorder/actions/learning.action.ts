import { type Page } from 'playwright';
import {
  AgentSilentError,
  promptsFor,
  sendPrompt,
  waitForAgentResponseCompletion,
} from '../core/actions';
import { writeIssueNote } from '../core/issue-note';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { glideClick, glideTo, waitForText } from './glide-click';

/**
 * Learning -- one turn on the agent the page's selector assigns, one on the
 * agent it does not.
 *
 * This harness has no `CPK_INTELLIGENCE_API_KEY`, and the page's
 * `new CopilotKitIntelligence({ apiKey: process.env.CPK_INTELLIGENCE_API_KEY! })`
 * throws at module load without one. The mount answers 500, the provider
 * lands in `error`, the agents never become ready and the composer's send
 * button stays disabled -- so the prompt is typed and never leaves. Silence on
 * both tabs is the finding; the panel's last row shows the 500 on screen.
 *
 * If a key is ever supplied, `expense-agent` is routed to `expense-review`,
 * which is expected not to exist in the project either; if the agent DOES
 * answer, the warning says the finding needs revisiting.
 */

const SILENCE_MS = 12_000;

async function turn(
  page: Page,
  ctx: ActionContext,
  agentId: string,
  prompt: string,
  postWaitMs: number,
): Promise<'answered' | 'silent'> {
  const ready = await waitForText(page.locator('[data-testid=learning-ready]'), (t) => t === 'true', 8000);
  await glideTo(page, page.locator('[data-testid=learning-assignment]'), 2000);
  console.log(`   [Learning] ${agentId}: ready=${ready}`);

  // The composer may not be able to send (runtime in error): type it anyway
  // and let the button's disabled state show that nothing went out.
  const count = await sendPrompt(page, prompt, { expectInputToEmpty: false });
  try {
    await waitForAgentResponseCompletion(page, postWaitMs, count, undefined, {
      startTimeoutMs: SILENCE_MS,
    });
    ctx.warn(`${agentId} answered -- re-check the finding on /learning.`);
    return 'answered';
  } catch (error) {
    if (!(error instanceof AgentSilentError)) throw error;
    console.log(`   [Learning] ${agentId} stayed silent -- the finding.`);
    await glideTo(page, page.locator('[data-testid=learning-info]'), 1800);
    return 'silent';
  }
}

export const runLearningAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath: string,
  ctx: ActionContext,
) => {
  const prompts = promptsFor(config);

  console.log('   [Learning] 1/2: expense-agent -> "expense-review"...');
  await turn(page, ctx, 'expense-agent', prompts[0], 2000);

  console.log('   [Learning] 2/2: sample_agent -> no container...');
  await glideClick(page, page.locator('[data-testid=learning-agent-sample_agent]'));
  await sleep(1500);
  await turn(page, ctx, 'sample_agent', prompts[1] ?? prompts[0], config.waitAfterPromptMs ?? 3000);

  const info = ((await page.locator('[data-testid=learning-info]').textContent().catch(() => '')) ?? '').trim();
  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue, {
      extraLines: info ? [`GET /api/copilotkit-learning/info -> ${info}`] : [],
    });
  }
};
