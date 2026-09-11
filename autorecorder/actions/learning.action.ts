import { type Page } from 'playwright';
import {
  AgentSilentError,
  promptsFor,
  sendPrompt,
  waitForAgentResponseCompletion,
} from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { markServerLogs } from './error-evidence';
import { evidenceThenIssueNote, glideClick, glideTo, waitForText } from './glide-click';

/**
 * Learning -- one turn on the agent the page's selector assigns, one on the
 * agent it does not.
 *
 * With `CPK_INTELLIGENCE_API_KEY` set, the page's runtime connects and the
 * take follows the path the page describes: `expense-agent` is routed to the
 * example container `expense-review`; where that container does not exist the
 * platform answers `LEARNING_CONTAINER_NOT_FOUND`, the run fails with "Failed
 * to initialize thread" and the chat shows nothing, while `sample_agent` (the
 * control, which the selector assigns nowhere) answers.
 *
 * Without a key, the page's
 * `new CopilotKitIntelligence({ apiKey: process.env.CPK_INTELLIGENCE_API_KEY! })`
 * throws at module load, the mount answers 500, and neither tab can send.
 *
 * The note is written from what the take saw, so it holds either way.
 */

/** The platform's Learning codes, the run failure, and the module-load throw. */
const RELEVANT = /LEARNING_|expense-agent|initialize thread|copilotkit-learning\/agent\/|CopilotKitIntelligence|apiKey is required/i;

const SILENCE_MS = 25_000;

type Outcome = 'answered' | 'silent';

async function turn(
  page: Page,
  agentId: string,
  prompt: string,
  postWaitMs: number,
): Promise<Outcome> {
  const ready = await waitForText(page.locator('[data-testid=learning-ready]'), (t) => t === 'true', 30_000);
  await glideTo(page, page.locator('[data-testid=learning-assignment]'), 2000);
  console.log(`   [Learning] ${agentId}: ready=${ready}`);

  // The composer may not be able to send (runtime in error): type it anyway
  // and let the button's disabled state show that nothing went out.
  const count = await sendPrompt(page, prompt, { expectInputToEmpty: false });
  try {
    await waitForAgentResponseCompletion(page, postWaitMs, count, undefined, {
      startTimeoutMs: SILENCE_MS,
    });
    console.log(`   [Learning] ${agentId} answered.`);
    return 'answered';
  } catch (error) {
    if (!(error instanceof AgentSilentError)) throw error;
    console.log(`   [Learning] ${agentId} stayed silent.`);
    await glideTo(page, page.locator('[data-testid=learning-info]'), 1800);
    return 'silent';
  }
}

function noteFor(info: string, expense: Outcome, control: Outcome, serverLines: string[]): string {
  const tail = [
    '',
    'also: agents and identifyUser never defined on the page',
    'getLearningContainerId needs runtime 1.70+, lockfile here is 1.69.0',
  ];
  if (/^5\d\d/.test(info) || serverLines.some((l) => /apiKey is required/.test(l))) {
    return [
      'learning - page runtime 500s at load, nothing answers',
      '',
      'mounted the snippet verbatim on its own route',
      'no intelligence key, apiKey: process.env.CPK_INTELLIGENCE_API_KEY! throws at import',
      '/info 500, runtime stuck in error, send button never enables',
      ...tail,
    ].join('\n');
  }
  const notFound = serverLines.some((l) => /LEARNING_CONTAINER_NOT_FOUND/.test(l));
  return [
    expense === 'silent' ? 'learning - expense-agent never answers' : 'learning - both agents answer',
    '',
    'page selector sends expense-agent threads to container "expense-review"',
    ...(expense === 'silent'
      ? [
          notFound
            ? 'that container does not exist in this project -> LEARNING_CONTAINER_NOT_FOUND'
            : 'the platform refuses the thread (see terminal)',
          'thread is never created, run 404s "failed to initialize thread", chat stays blank',
        ]
      : ['this project has that container, the run goes through']),
    control === 'answered'
      ? 'sample_agent (no container) answers fine, same graph'
      : 'sample_agent (no container) did not answer either this take',
    '',
    'troubleshooting table only says the thread will not show in the container',
    ...tail,
  ].join('\n');
}

export const runLearningAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
) => {
  const logs = markServerLogs(rootPath);
  const prompts = promptsFor(config);

  console.log('   [Learning] 1/2: expense-agent -> "expense-review"...');
  const expense = await turn(page, 'expense-agent', prompts[0], 2000);
  if (expense === 'answered') {
    ctx.warn('expense-agent answered. The expense-review container may exist in the project now -- re-check the finding on /learning.');
  }

  console.log('   [Learning] 2/2: sample_agent -> no container...');
  await glideClick(page, page.locator('[data-testid=learning-agent-sample_agent]'));
  await sleep(1500);
  const control = await turn(page, 'sample_agent', prompts[1] ?? prompts[0], config.waitAfterPromptMs ?? 3000);

  const info = ((await page.locator('[data-testid=learning-info]').textContent().catch(() => '')) ?? '').trim();
  await evidenceThenIssueNote(page, config, logs, RELEVANT, {
    note: (lines) => noteFor(info, expense, control, lines),
    extraLines: () => (info ? [`GET /api/copilotkit-learning/info -> ${info}`] : []),
  });
};
