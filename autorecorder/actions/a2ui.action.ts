import { type Page } from 'playwright';
import { sendPrompt, waitForAgentResponseCompletion, AgentSilentError } from '../core/actions';
import { writeIssueNote } from '../core/issue-note';
import { captureConsole, findEntries } from '../core/console-capture';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

/**
 * The A2UI takes.
 *
 * Three of these four pages work and are recorded plainly. The fourth --
 * Fixed Schema -- fails with `Catalog not found: .../basic_catalog.json`, and
 * that message exists only in the browser console.
 *
 * This take used to draw a replica of Chrome's DevTools console over the page
 * to put the error on screen. It has stopped doing that: nobody testing an app
 * can conjure a panel into existence, and anything on screen a human could not
 * have put there turns evidence into a presentation. What a tester actually
 * does is read the console, then write down what it said -- so the error is
 * still captured, still verified, and now reaches the video the way a person
 * would deliver it: typed into the Notepad note at the end.
 *
 * The page itself carries the expectation (`QaNote` on the demo route), which
 * is what makes the empty space legible without narration.
 */

/** Rests the cursor where the A2UI surface renders, or should have. */
async function restOnSurface(page: Page, dwellMs: number): Promise<void> {
  const surface = page
    .locator('.a2ui-surface, [class*="a2ui"], .copilotKitAssistantMessage')
    .first();

  // Waited for, not snapshotted. An A2UI surface is drawn once the operations
  // container arrives in the tool result, which is after the text has finished
  // streaming -- and `isVisible` does not poll however large its timeout, so
  // checking it directly parked the cursor in the middle of the screen every
  // time the surface was a moment late.
  await surface.waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});

  if (!(await surface.isVisible().catch(() => false))) {
    await humanGlide(page, 960, 460, 20);
    await sleep(dwellMs);
    return;
  }

  const box = await surface.boundingBox();
  if (!box) return;
  await humanGlide(
    page,
    box.x + Math.min(box.width / 2, 260),
    box.y + Math.min(box.height / 2, 120),
    22,
  );
  await sleep(dwellMs);
}

/** Dynamic Schema, Styling, Advanced: prompt, then look at what got drawn. */
export const runA2uiSurfaceAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  console.log(`   [A2UI] Prompting for a generated surface...`);
  const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

  // A2UI surfaces arrive after the text does -- the operations container is
  // rendered once the tool result lands -- so the wait comes first and the
  // cursor moves afterwards.
  //
  // 75s to start, not the default 30s. On the dynamic-schema agent a *second*
  // model writes the whole component tree before the first word is said, and
  // 30s was a coin flip: Dynamic Schema and Advanced cleared it on CI while
  // Styling -- same agent, same runtime, same prompt -- did not, and was
  // reported as a dead page. A limit that fails one of three identical calls is
  // measuring the limit, not the app.
  await waitForAgentResponseCompletion(page, 1500, msgCount, undefined, 75000);
  await restOnSurface(page, config.waitAfterPromptMs ?? 5000);
};

/**
 * Fixed Schema: the catalog never resolves, and the console is the only witness.
 *
 * Capture starts before the prompt, because the fetch that fails happens while
 * the surface is being drawn. `AgentSilentError` is caught rather than allowed
 * to propagate: whether the agent also fails to answer is not the finding, and
 * the engine reports `[ISSUE]` either way.
 */
export const runA2uiFixedSchemaAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  const capture = captureConsole(page);

  try {
    console.log(`   [A2UI Fixed] Prompting for the fixed-schema surface...`);
    const msgCount = await sendPrompt(page, config.prompt, { timeoutMs: 12000 });

    try {
      await waitForAgentResponseCompletion(page, 2000, msgCount);
    } catch (e) {
      if (!(e instanceof AgentSilentError)) throw e;
      console.log(`   [A2UI Fixed] No assistant reply -- continuing.`);
    }

    // The empty space where the card should be. The page's own note says what
    // was expected there, so this reads as an absence rather than a pause.
    await restOnSurface(page, config.waitAfterPromptMs ?? 4000);

    // `/catalog/i`, not `/catalog|a2ui/i`. The looser pattern matched the agent
    // id -- `a2ui_fixed_agent` appears in the context of every CopilotKit error
    // on this page -- so an unrelated stream failure was reported as the catalog
    // defect and typed into the note as if it were. A matcher for a specific
    // finding has to be narrow enough that it cannot match the page's own name.
    const catalogErrors = findEntries(capture, /catalog/i, 2);
    const found = catalogErrors.length > 0 ? catalogErrors : capture.entries.slice(0, 1);

    // The text goes in the log, not just a count. "1 captured error" says
    // nothing about whether the take caught the catalog failure it is about or
    // an unrelated warning, and the only other way to find out is to watch the
    // video and squint.
    console.log(`   [A2UI Fixed] Console errors captured: ${found.length}`);
    for (const e of found) {
      console.log(`      · [${e.level}] ${e.text}${e.source ? `  (${e.source})` : ''}`);
    }
    if (catalogErrors.length === 0) {
      console.warn(
        `   ⚠️ [A2UI Fixed] Nothing matched /catalog/ -- the reported defect may ` +
          `not have reproduced. Watch the clip before filing this one.`,
      );
    }

    if (config.knownIssue) {
      // The console line goes into the note, which is how a tester would carry
      // it: read the console, write down what it said.
      const consoleLine = found[0]
        ? `console: ${found[0].text.slice(0, 180)}`
        : undefined;
      await writeIssueNote(page, config.id, config.knownIssue, {
        extraLines: consoleLine ? [consoleLine] : [],
      });
    }
  } finally {
    capture.stop();
  }
};
