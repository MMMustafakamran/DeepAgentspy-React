import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { writeIssueNote } from '../core/issue-note';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { glideClick, glideTo, waitForText } from './glide-click';

/**
 * Frontend-Driven Cards -- the published provider first, then the one that runs.
 *
 * Pass one is step 2's provider exactly as published. Its bare `useAgent()` and
 * `<CopilotChat />` ask for the agent id `"default"`, which this repo's runtime
 * (like the Deep Agents Quickstart's) does not register, so `useAgent()` throws
 * the moment `/info` answers and the chat disappears. The demo prints the
 * thrown message in its place; the take rests on it.
 *
 * Pass two switches to the same provider plus the Quickstart's
 * `agent="sample_agent"` and films the page's two claims: the card renders in
 * the transcript (click "Simulate: deployment finished"), and the agent never
 * receives it (send a turn, then read the probe row that prints the roles in the
 * run request that actually left the browser). The prompt asks the agent what
 * it was shown, so its own answer is on camera too.
 *
 * The click waits for `isReady true` on purpose. A card added while the runtime
 * is still connecting goes to a provisional agent and is silently dropped when
 * the real one arrives -- a finding on the route page, reproduced 3/3, but not
 * what this take is about. Clicking early would film that instead, randomly.
 */

const CARD = '.rounded-lg.border.p-4:has-text("Deployment finished")';

export const runFrontendCardsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath: string,
  ctx: ActionContext,
) => {
  // Pass 1 -- as published.
  console.log('   [Frontend Cards] 1/2: step 2 provider as published...');
  const thrown = page.locator('[data-testid=provider-error]');
  const crashed = await thrown
    .waitFor({ state: 'visible', timeout: 30_000 })
    .then(() => true)
    .catch(() => false);
  let thrownText = '';
  if (crashed) {
    thrownText = ((await thrown.textContent().catch(() => '')) ?? '').trim();
    console.log(`   [Frontend Cards] the published provider threw: ${thrownText.slice(0, 120)}`);
    await glideTo(page, thrown, 3500);
  } else {
    ctx.warn(
      'The published provider did not throw -- a `default` agent may be registered now. ' +
        'Re-check the finding on /generative-ui/frontend-cards.',
    );
  }

  // Pass 2 -- with the Quickstart's agent prop.
  console.log('   [Frontend Cards] 2/2: + agent="sample_agent"...');
  await glideClick(page, page.locator('[data-testid=cards-provider-quickstart-agent]'));
  await sleep(800);

  const state = page.locator('[data-testid=agent-state]');
  const ready = await waitForText(state, (t) => t.includes('isReady true'), 60_000);
  if (!ready.includes('isReady true')) {
    ctx.fail(`useAgent() never became ready (last: "${ready}") -- the card would go to a provisional agent`);
  }
  await glideTo(page, state, 1200);

  console.log('   [Frontend Cards] adding the activity card...');
  await glideClick(page, page.locator('[data-testid=add-activity-card]'));
  await sleep(1200);
  const card = page.locator(CARD).first();
  if (!(await card.isVisible({ timeout: 5000 }).catch(() => false))) {
    ctx.fail('The activity card never rendered in the transcript');
  } else {
    await glideTo(page, card, 1500);
  }

  const [prompt] = promptsFor(config);
  const msgCount = await sendPrompt(page, prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const payload = page.locator('[data-testid=roles-payload]');
  const roles = await waitForText(payload, (t) => !t.startsWith('no run'), 10_000);
  if (roles.startsWith('no run')) {
    ctx.warn('No run payload was captured, so the "agent never sees it" claim went unchecked');
  } else if (/\bactivity\b/.test(roles.split('(')[0])) {
    ctx.fail(`The activity message reached the agent: payload roles were "${roles}"`);
  }
  await glideTo(page, payload, 2500);

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue, {
      extraLines: thrownText ? [`thrown: ${thrownText.split(' Known agents')[0]}`] : [],
    });
  }
};
