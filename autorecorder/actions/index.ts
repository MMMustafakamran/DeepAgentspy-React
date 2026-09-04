/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS DIRECTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What the recorder *does* on each demo page once it is open.
 *
 * The registry lives here rather than in `core/` on purpose: adding or removing
 * a page must never mean editing frozen code. A page with no entry falls back
 * to `runStandardAction` — type the prompt, submit, wait for the reply — which
 * is right for most pages. Write a handler only when a page needs more than
 * that: switching tabs, clicking an approval button, opening a panel.
 *
 * Handlers should build on the helpers in `core/actions.ts`:
 *
 *   sendPrompt(page, prompt, opts)          types and submits, returns the
 *                                           assistant-message count from before
 *                                           submitting
 *   waitForAgentResponseCompletion(...)     waits for the reply to finish, and
 *                                           throws if none ever arrives
 *   promptsFor(config)                      the page's prompts[] , or [prompt]
 *
 * Pass that returned count into waitForAgentResponseCompletion on multi-turn
 * pages, or the previous turn's reply is mistaken for this one's.
 *
 * The fourth argument, `ctx`, is how a handler reports what it saw:
 *
 *   ctx.warn('the documented defect did not reproduce')  -> [PASS*]/[ISSUE] with the note
 *   ctx.fail('Approve button never rendered')             -> [FAIL], clip still saved
 *
 * A `console.warn` reaches nobody: the summary, RECORD_RESULTS.json and the
 * daily report only see what goes through `ctx`.
 *
 * ── Handlers for pages that reproduce a defect ─────────────────────────────
 * Five pages here carry a `knownIssue`, and their handlers have one extra
 * obligation: make the defect visible, then write it down.
 *
 * The governing rule is that a take may only contain things a person testing
 * this app could actually have done. That rule cost this suite two helpers it
 * used to have — a caption bar and a replica of Chrome's DevTools console,
 * both painted over the page. Both were useful. Neither was something a tester
 * could produce, and an overlay nobody could have summoned turns a recording of
 * evidence into a recording of a presentation. What survives:
 *
 *   showWorkingVariant(page, opts)     core/compare.ts — the same page against
 *                                      code that works, which is what answers
 *                                      "was the demo just wired up wrong?"
 *   writeIssueNote(page, id, issue)    core/issue-note.ts — Notepad, opened
 *                                      from the taskbar and typed into, which
 *                                      is how a tester actually reports
 *   captureConsole(page)               core/console-capture.ts — invisible.
 *                                      Console errors reach the run log and the
 *                                      note, not the screen
 *
 * Anything a clip needs to *say* rather than show belongs on the demo route
 * itself: `QaNote` in the frontend states what to try and what should happen,
 * which is a thing a tester could plausibly have written on the page.
 */

import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction } from '../core/actions';
import { type Page } from 'playwright';

import { runA2uiFixedSchemaAction, runA2uiSurfaceAction } from './a2ui.action';
import { runFrontendToolsAction } from './frontend-tools.action';
import { runInterruptAction } from './interrupt.action';
import {
  runPredictiveManualAction,
  runPredictivePrebuiltAction,
  runPredictiveToolAction,
} from './predictive.action';
import {
  runSharedStateReadAction,
  runSharedStateWriteAction,
} from './shared-state.action';
import { runStateIoAction } from './state-io.action';
import { runStateRenderingAction } from './state-rendering.action';
import { runToolRenderingAction } from './tool-rendering.action';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = {
  quickstart: runStandardAction,

  'tool-rendering': runToolRenderingAction,
  'state-rendering': runStateRenderingAction,
  'interrupt-based': runInterruptAction,

  'a2ui-fixed-schema': runA2uiFixedSchemaAction,
  'a2ui-dynamic-schema': runA2uiSurfaceAction,
  'a2ui-styling': runA2uiSurfaceAction,
  'a2ui-advanced': runA2uiSurfaceAction,

  'frontend-tools': runFrontendToolsAction,

  'in-app-agent-read': runSharedStateReadAction,
  'in-app-agent-write': runSharedStateWriteAction,
  'predictive-prebuilt': runPredictivePrebuiltAction,
  'predictive-manual': runPredictiveManualAction,
  'predictive-tool': runPredictiveToolAction,
  'state-inputs-outputs': runStateIoAction,
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
): Promise<void> {
  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath, ctx);
}
