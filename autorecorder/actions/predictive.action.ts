import { type Page } from 'playwright';
import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
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
 * The prebuilt take does one thing more. Its defect is an *absence* -- a list
 * that stays empty -- and absence is the hardest thing to film: an empty panel
 * beside a working chat looks like a page that has not been asked anything yet.
 * So after the prebuilt variant fails, the take switches to the manual variant
 * and asks the identical question, and the steps appear. Two tabs of the same
 * page, one prompt, one of them filling in. Nothing else in this suite makes
 * the point as economically.
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
): Promise<void> {
  await selectVariant(page, key);

  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

  // Mid-stream is the only moment the steps are interesting: this is when rows
  // should be filling in. Waiting for the reply first and looking afterwards
  // shows the aftermath rather than the behaviour.
  await sleep(2200);
  await restOnSteps(page, 2200);

  await waitForAgentResponseCompletion(
    page,
    config.waitAfterPromptMs ?? 4000,
    msgCount,
    undefined,
    startTimeoutMs,
  );
}

/** Prebuilt agent — the reported defect, recorded against the manual variant. */
export const runPredictivePrebuiltAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  await runVariant(page, config, 'prebuilt');

  await restOnSteps(page, 2600);

  // The same question, the same page, a different variant.
  //
  // Deliberately NOT waiting for a reply here. The custom-graph variants have a
  // defect of their own -- the QA report records them as "showing the steps but
  // no response from the agent on frontend", and a run of this take confirmed
  // it, timing out at 90s against a graph whose steps had already rendered.
  // Waiting for an answer that is documented not to arrive would fail the take
  // for the wrong reason every time.
  //
  // What is being contrasted is the steps list, so that is what to wait for.
  // The prebuilt tab leaves it empty; this one fills it. That is the argument,
  // and it is complete without either side saying a word.
  await selectVariant(page, 'manual');
  await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

  const stepsAppeared = await page
    .locator('h3:has-text("Steps"), ul li')
    .first()
    .waitFor({ state: 'visible', timeout: 60000 })
    .then(() => true)
    .catch(() => false);

  if (stepsAppeared) {
    console.log(`   ✓ [Predictive] Steps rendered on the custom-graph variant.`);
    await restOnSteps(page, 4000);
  } else {
    // Corroboration, not the finding. The prebuilt half is already on tape, so
    // a missing contrast weakens the clip rather than invalidating it.
    console.warn(
      `   ⚠️ [Predictive] The custom-graph variant rendered no steps either within 60s.` +
        ` The prebuilt half is recorded; the clip just lacks its comparison.`,
    );
    await sleep(2500);
  }

  if (config.knownIssue) {
    await writeIssueNote(page, config.id, config.knownIssue);
  }
};

/**
 * The two custom-graph variants, each as its own take.
 *
 * 90s rather than the default 30s, and still fatal: on these pages the graph IS
 * the subject, so silence is a real finding and must fail. What 30s was doing
 * was reporting a graph measured at 50s as dead, which is a different claim and
 * a wrong one.
 */
const CUSTOM_GRAPH_START_TIMEOUT_MS = 90000;

export const runPredictiveManualAction: PageActionHandler = async (page, config) => {
  await runVariant(page, config, 'manual', CUSTOM_GRAPH_START_TIMEOUT_MS);
};

export const runPredictiveToolAction: PageActionHandler = async (page, config) => {
  await runVariant(page, config, 'tool', CUSTOM_GRAPH_START_TIMEOUT_MS);
};
