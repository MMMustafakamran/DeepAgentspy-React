import { type Page } from 'playwright';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

/**
 * Input/Output Schemas — driven by the page's own form, not by the chat.
 *
 * This is the one route here whose point is not what the agent says. Three
 * fields go into the graph and only one comes back, and the page shows that as
 * three verdict rows plus the raw `agent.state`. Sending a chat message would
 * exercise the same graph and show none of it, so this take clicks "Ask" and
 * then reads the panel.
 *
 * Which also means `waitForAgentResponseCompletion` is the wrong wait here: no
 * assistant message is involved. The take waits for `answer` to arrive in the
 * panel, which is the thing under test.
 */
export const runStateIoAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  const question = page.locator('#question');
  if (await question.isVisible({ timeout: 8000 }).catch(() => false)) {
    const box = await question.boundingBox();
    if (box) {
      await humanGlide(page, box.x + Math.min(box.width / 2, 160), box.y + box.height / 2, 20);
      await sleep(300);
      await humanClick(page);
    }
    await question.click({ timeout: 5000 }).catch(() => {});
    await question.fill('');
    await question.type(config.prompt, { delay: 65 });
    await sleep(500);
  }

  console.log(`   [Input/Output Schemas] Running the graph from the form...`);
  const ask = page.locator('button:has-text("Ask")').first();
  if (await ask.isVisible({ timeout: 5000 }).catch(() => false)) {
    const box = await ask.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
      await sleep(300);
      await humanClick(page);
    }
    await ask.click({ timeout: 5000 }).catch(() => {});
  }

  // `answer` is the one field OutputState returns, so its arrival is what says
  // the run finished. 45s to match the streaming budget elsewhere.
  const answered = await page
    .locator('div:has(dt:text-is("answer")) >> text=present')
    .first()
    .waitFor({ state: 'visible', timeout: 45000 })
    .then(() => true)
    .catch(() => false);

  if (!answered) {
    ctx.warn(`No answer arrived within 45s; recording what is on screen.`);
  }

  // The three verdict rows, then the raw state. Reading them in that order is
  // the argument: two fields absent by design, one present, and the raw dump
  // confirming the browser never received the other two.
  for (const label of ['question', 'answer', 'resources']) {
    const row = page.locator(`div:has(> div > dt:text-is("${label}"))`).first();
    if (!(await row.isVisible({ timeout: 3000 }).catch(() => false))) continue;
    const box = await row.boundingBox();
    if (!box) continue;
    await humanGlide(page, box.x + Math.min(box.width / 2, 200), box.y + 24, 22);
    await sleep(1400);
  }

  const raw = page.locator('pre').first();
  if (await raw.isVisible({ timeout: 3000 }).catch(() => false)) {
    const box = await raw.boundingBox();
    if (box) {
      await humanGlide(page, box.x + box.width / 2, box.y + Math.min(box.height / 2, 90), 22);
    }
  }

  await sleep(config.waitAfterPromptMs ?? 4000);
};
