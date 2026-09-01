import { type Page } from 'playwright';
import { AgentSilentError, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { captureConsole, findEntries } from '../core/console-capture';
import { writeIssueNote } from '../core/issue-note';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

/**
 * Predictive State Updates — three variants, one route.
 *
 * The demo page carries a tab strip (`Prebuilt agent` / `Custom graph · manual`
 * / `Custom graph · tool`) because the doc page documents all three against the
 * same `observed_steps` key. Each take picks its tab and drives it.
 *
 * The prebuilt take used to do one thing more: after its own variant failed it
 * switched to the manual tab and asked the identical question there, so the
 * steps filling in on one tab and staying empty on the other made the absence
 * legible. That contrast is gone -- the prebuilt take now stays on its own tab
 * for the whole clip. Prompting a second variant inside another variant's take
 * put a run of the manual graph into a video filed against the prebuilt one,
 * and the manual graph has a defect of its own; two findings in one clip is
 * worse than a weaker clip. The manual variant is recorded separately and can
 * be watched beside this one.
 */

const TABS = {
  prebuilt: 'Prebuilt agent',
  manual: 'Custom graph · manual',
  tool: 'Custom graph · tool',
} as const;

type VariantKey = keyof typeof TABS;

/** Clicks one of the variant tabs, with the cursor visibly travelling to it. */
async function selectVariant(page: Page, key: VariantKey): Promise<void> {
  const label = TABS[key];
  const tab = page.locator(`button:has-text("${label}")`).first();

  if (!(await tab.isVisible({ timeout: 8000 }).catch(() => false))) {
    console.warn(`   ⚠️ Variant tab "${label}" not found -- the demo page may have changed.`);
    return;
  }

  const box = await tab.boundingBox();
  if (!box) return;

  await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
  await sleep(350);
  await humanClick(page);
  console.log(`   ✓ Selected variant "${label}".`);

  // The panel is keyed on the variant, so the click remounts both halves. Give
  // React the frame it needs before anything is typed into the new chat.
  await sleep(1400);
}

/** Rests the cursor on the steps panel, whether it has rows in it or not. */
async function restOnSteps(page: Page, dwellMs: number): Promise<void> {
  const panel = page
    .locator('h1:has-text("Agent Progress"), p:has-text("Empty. Give the agent"), ul')
    .first();
  if (!(await panel.isVisible({ timeout: 4000 }).catch(() => false))) return;

  const box = await panel.boundingBox();
  if (!box) return;
  await humanGlide(page, box.x + Math.min(box.width / 2, 200), box.y + 40, 22);
  await sleep(dwellMs);
}

/** Drives one variant end to end: pick the tab, ask, watch the steps panel. */
async function runVariant(
  page: Page,
  config: PageRecordConfig,
  key: VariantKey,
  startTimeoutMs = 30000,
  waitForStepsMs = 0,
): Promise<void> {
  await selectVariant(page, key);

  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

  // On the custom graphs the steps are the evidence, and on the manual one they
  // are the *only* evidence -- it renders them and then never replies. Waiting
  // for them here means the clip shows the thing that worked before the take
  // runs out of patience on the thing that did not.
  //
  // Not done on `prebuilt`: its finding is that no step ever appears, so a wait
  // there buys a minute of dead video to prove what an empty panel already says.
  if (waitForStepsMs > 0) {
    const appeared = await page
      .locator('h3:has-text("Steps"), ul li')
      .first()
      .waitFor({ state: 'visible', timeout: waitForStepsMs })
      .then(() => true)
      .catch(() => false);
    console.log(
      appeared
        ? `   ✓ Steps rendered on "${TABS[key]}".`
        : `   ⚠️ No steps rendered on "${TABS[key]}" within ${waitForStepsMs / 1000}s.`,
    );
  }

  // Mid-stream is the only moment the steps are interesting: this is when rows
  // should be filling in. Waiting for the reply first and looking afterwards
  // shows the aftermath rather than the behaviour.
  await sleep(waitForStepsMs > 0 ? 600 : 2200);
  await restOnSteps(page, 2200);

  await waitForAgentResponseCompletion(
    page,
    config.waitAfterPromptMs ?? 4000,
    msgCount,
    undefined,
    startTimeoutMs,
  );
}

/** Prebuilt agent -- its own tab, start to finish. Nothing else is driven. */
export const runPredictivePrebuiltAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  await runVariant(page, config, 'prebuilt');

  // A long, deliberate look at the panel that should have filled in and did
  // not. With the manual-tab comparison gone this is the whole of the evidence,
  // so it gets the dwell the second half used to spend.
  await restOnSteps(page, 5200);

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue);
  }
};

/**
 * The two custom-graph variants, each as its own take.
 *
 * 90s to start rather than the default 30s. These graphs emit four steps a
 * second apart before they say anything, and one has been measured at 50s end
 * to end; 30s was reporting a working graph as dead.
 */
const CUSTOM_GRAPH_START_TIMEOUT_MS = 90000;

/**
 * Manual: the steps render, then the run dies on the recursion limit.
 *
 * The silence in the chat is the visible half; the reason is in the console --
 * `Recursion limit of 25 reached without hitting a stop condition`. Capture
 * starts before the prompt because the error arrives during the run, and the
 * matcher is `/recursion limit/i` rather than anything looser: this graph's own
 * name and agent id show up in most CopilotKit errors on the page, so a broad
 * pattern would match an unrelated failure and type it into the note as if it
 * were this one.
 *
 * `AgentSilentError` is caught rather than allowed to propagate. The engine
 * reports `[ISSUE]` either way thanks to `expectsNoResponse`, but an exception
 * escaping here would skip the Notepad note, and a defect take that does not
 * write its own report is half a take.
 */
export const runPredictiveManualAction: PageActionHandler = async (page, config) => {
  const capture = captureConsole(page);

  try {
    await runVariant(page, config, 'manual', CUSTOM_GRAPH_START_TIMEOUT_MS, 45000);
    console.warn(
      `   ⚠️ [Predictive manual] The agent DID reply this time -- the documented ` +
        `defect did not reproduce. Check whether it has been fixed before filing it again.`,
    );
  } catch (e) {
    if (!(e instanceof AgentSilentError)) throw e;
    console.log(`   🐞 [Predictive manual] Steps rendered, no reply -- as reported.`);
  }

  const recursion = findEntries(capture, /recursion limit/i, 2);
  console.log(`   [Predictive manual] Recursion-limit errors captured: ${recursion.length}`);
  for (const entry of recursion) {
    console.log(`      · [${entry.level}] ${entry.text}${entry.source ? `  (${entry.source})` : ''}`);
  }
  if (recursion.length === 0) {
    // Not fatal. The silence is still on tape and still the filed finding; what
    // is missing is the sentence that explains it, and that is worth knowing
    // before this clip is used to argue the cause.
    console.warn(
      `   ⚠️ [Predictive manual] Nothing matched /recursion limit/ this run. The take ` +
        `still shows the silence, but the note's stated cause is unwitnessed -- watch it.`,
    );
    for (const entry of capture.entries.slice(0, 3)) {
      console.warn(`      · [${entry.level}] ${entry.text}`);
    }
  }

  capture.stop();

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue);
  }
};

export const runPredictiveToolAction: PageActionHandler = async (page, config) => {
  await runVariant(page, config, 'tool', CUSTOM_GRAPH_START_TIMEOUT_MS, 45000);
};
