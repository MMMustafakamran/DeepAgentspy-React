import { type Page } from 'playwright';
import { beat } from '../core/overlays/human';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { glideClick, glideTo, visibleWithin, waitForText } from './glide-click';
import { openUrl, runTake, type TakeStep } from './take';

/**
 * Frontend-Driven Cards -- DEMO_SCRIPT.md "Clip 9" (#22), as a scripted take.
 *
 * The page sets `ownsTake`, so this handler films the whole clip in the
 * script's order, the way a tester would work through it:
 *
 *   doc      the page's `<CopilotKit runtimeUrl="/api/copilotkit" ...>` and
 *            step 3's bare `useAgent()`                         -> note
 *   ide      demo-chat/page.tsx:255-256 (the provider as published) and :71
 *            (the bare `useAgent()` in the probe)
 *   browser  the route as published: `useAgent()` throws "Agent 'default'
 *            not found after runtime sync" the moment `/info` answers; the
 *            demo's error boundary prints the real message       -> note
 *   ide      :267, the Quickstart's `agent="sample_agent"`        -> note
 *   browser  same route, still broken first, then the page's own
 *            quickstart-agent variant: add a card, it renders     -> note
 *
 * The as-published half always comes first and is never patched: the route's
 * default tab is step 2's provider verbatim. The fix is the demo's existing
 * sibling tab, which differs by exactly that one prop. Dialogue is DEMO_SCRIPT's
 * 🎙 lines, typed into Notepad, one per beat.
 *
 * The add-card click waits for `isReady true` on purpose: a card added while
 * the runtime is still connecting goes to a provisional agent and is silently
 * dropped when the real one arrives (a separate finding, 3/3), which is not
 * what this clip is about.
 */

const DEMO_FILE = 'frontend/src/app/generative-ui/frontend-cards/demo-chat/page.tsx';
const CARD = '.rounded-lg.border.p-4:has-text("Deployment finished")';

export const runFrontendCardsAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
) => {
  const steps: TakeStep[] = [
    {
      kind: 'doc',
      url: config.docUrl,
      select: [
        { from: '<CopilotKit', to: '</CopilotKit>', within: 'runtimeUrl="/api/copilotkit"', dwellMs: 2600 },
        { from: 'const { agent }', to: 'useAgent();', within: 'DeploymentWatcher', dwellMs: 2000 },
      ],
    },
    { kind: 'note', text: 'Neither the provider nor useAgent() names an agent.' },
    {
      kind: 'ide',
      ranges: [
        // The provider as published (config's ideFile range, doctor-checked).
        { file: config.ideFile, from: config.startLine, to: config.endLine, expect: 'runtimeUrl="/api/copilotkit"' },
        { file: DEMO_FILE, from: 71, to: 71, expect: 'useAgent()' },
      ],
    },
    {
      kind: 'browser',
      label: 'the route as published crashes',
      run: async (p) => {
        await openUrl(p, config.demoUrl, ctx.timeouts.demoNavMs);
        await showPublishedCrash(p, ctx);
      },
    },
    {
      kind: 'note',
      text:
        "With no name, CopilotKit looks for an agent called 'default'.\n" +
        'Deep Agents registers graphs by name, like sample_agent,\n' +
        'so the page crashes on load.',
    },
    {
      kind: 'ide',
      ranges: [{ file: DEMO_FILE, from: 267, to: 267, expect: 'agent="sample_agent"', dwellMs: 2600 }],
    },
    {
      kind: 'note',
      text:
        'Fix: pass the agent name, as the Deep Agents quickstart does:\n' +
        '<CopilotKit runtimeUrl="/api/copilotkit" agent="sample_agent" ...>\n' +
        'and mount <DeploymentWatcher /> inside the provider.',
    },
    {
      kind: 'browser',
      label: 'same route, + agent="sample_agent", add a card',
      run: async (p) => {
        await openUrl(p, config.demoUrl, ctx.timeouts.demoNavMs);
        // Still broken as published -- a second look before switching.
        await showPublishedCrash(p, ctx, 1800);
        await showFixedVariant(p, ctx);
      },
    },
    { kind: 'note', text: 'Add agent="sample_agent" and the same page works.' },
  ];

  await runTake(steps, { page, rootDir: rootPath, origin: new URL(config.demoUrl).origin, ctx, noteFile: 'frontend-cards.txt' });
};

/** Waits for the published provider's real throw and rests the cursor on it. */
async function showPublishedCrash(page: Page, ctx: ActionContext, dwellMs = 3500): Promise<void> {
  const thrown = page.locator('[data-testid=provider-error]');
  if (!(await visibleWithin(thrown, 30_000))) {
    ctx.warn(
      'The published provider did not throw -- a `default` agent may be registered now. ' +
        'Re-check the finding on /generative-ui/frontend-cards.',
    );
    return;
  }
  const text = ((await thrown.textContent().catch(() => '')) ?? '').trim();
  console.log(`   [Frontend Cards] the published provider threw: ${text.slice(0, 140)}`);
  if (!/Agent 'default' not found/.test(text)) {
    ctx.warn(`The published provider threw something else: "${text.slice(0, 160)}"`);
  }
  await glideTo(page, thrown, dwellMs);
}

/** The page's quickstart-agent tab: wait for the agent, add a card, show it. */
async function showFixedVariant(page: Page, ctx: ActionContext): Promise<void> {
  await glideClick(page, page.locator('[data-testid=cards-provider-quickstart-agent]'));
  await beat(800);

  const state = page.locator('[data-testid=agent-state]');
  const ready = await waitForText(state, (t) => t.includes('isReady true'), 60_000);
  if (!ready.includes('isReady true')) {
    ctx.fail(`useAgent() never became ready (last: "${ready}") -- the card would go to a provisional agent`);
  }
  await glideTo(page, state, 1500);

  await glideClick(page, page.locator('[data-testid=add-activity-card]'));
  await beat(1200);
  const card = page.locator(CARD).first();
  if (!(await visibleWithin(card, 5000))) {
    ctx.fail('The activity card never rendered in the transcript');
  } else {
    await glideTo(page, card, 3000);
  }
}
