/**
 * Page id -> action. Pages not listed run the keyboard-send take (type, Enter, wait for the reply
 * or a generative-UI surface). Deep Agents (Python) + React; page data in deepagents.pages.ts.
 */
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { type Page } from 'playwright';

import { waitForPageReady } from './page-ready';
import { DEEPAGENTS_ACTIONS, DEFAULT_TAKE } from './deepagents.pages';
import { writeFinding, KNOWN_ISSUE } from './deepagents.actions';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = { ...DEEPAGENTS_ACTIONS };

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
): Promise<void> {
  if (!config.docOnly) await waitForPageReady(page, { label: config.id });
  const handler = ACTION_MAP[config.id] ?? DEFAULT_TAKE;
  try {
    await handler(page, config, rootPath, ctx);
  } finally {
    // Level-2 chat pages end after the demo (writeFinding returns early for KNOWN_ISSUE chat pages);
    // called for symmetry so a future level change only needs the data edit.
    if (!ACTION_MAP[config.id] && KNOWN_ISSUE.has(config.id)) await writeFinding(page, config.id, config);
  }
}
