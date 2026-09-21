import { type Page } from 'playwright';
import { promptsFor, sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { markServerLogs } from './error-evidence';
import { evidenceThenIssueNote, glideClick, glideTo, waitForText } from './glide-click';

/**
 * Markdown Rendering -- the published block first, then the HTML it produces.
 *
 * Three passes.
 *
 * 1. The page's own block, nothing added. Its `<CopilotChat>` carries no agent
 *    id, so it asks for `"default"`, which a Deep Agents runtime does not
 *    register, and it throws as soon as `/info` answers. Same defect as
 *    Frontend-Driven Cards, on a second page. The demo prints the thrown
 *    message where the chat was; the take rests on it.
 *
 * 2. The same block plus `agentId="sample_agent"`, which is the only change
 *    the rest of the page needs. A reply containing a link, an `h2` and a
 *    `<reference-chip>` is asked for, and the probe's anchor row is read. That
 *    row is the page's three claims in one string: `class="my-link"` says the
 *    override ran, `rel="noopener noreferrer"` says the hardening survived the
 *    spread, and the absent `data-streamdown` says the override replaced
 *    rather than extended.
 *
 * 3. The baseline tab, no override, same prompt. The anchor row now carries
 *    `data-streamdown="link"` and Streamdown's own classes, which is what pass
 *    2 is missing and the only way to see that it is missing.
 *
 * The `node` row is checked on both: the page's first warning is that spreading
 * `node` writes `node="[object Object]"` into the document, and the published
 * block destructures it out, so the count must be zero. A non-zero count there
 * would mean the page's advice does not work, which is a bigger finding than
 * anything else on the route.
 */

const RELEVANT = /markdown|\/agent\/[^/]+\/run|custom-look-and-feel/;

const ANCHOR = '[data-testid=markdown-anchor]';
const NODE_ATTRS = '[data-testid=markdown-node-attributes]';

export const runMarkdownRenderingAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
) => {
  const logs = markServerLogs(rootPath);
  const [first, second] = promptsFor(config);

  // Pass 1 -- the published block.
  console.log('   [Markdown] 1/3: the page block, verbatim...');
  await glideClick(page, page.locator('[data-testid=markdown-tab-published]'));
  const thrown = page.locator('[data-testid=markdown-tab-error]');
  let thrownText = '';
  if (await thrown.waitFor({ state: 'visible', timeout: 30_000 }).then(() => true).catch(() => false)) {
    thrownText = ((await thrown.textContent().catch(() => '')) ?? '').trim();
    console.log(`   [Markdown] the published block threw: ${thrownText.slice(0, 120)}`);
    await glideTo(page, thrown, 3500);
  } else {
    ctx.warn(
      'The published block did not throw -- a `default` agent may be registered now. ' +
        'Re-check the finding here and on /generative-ui/frontend-cards.',
    );
  }

  // Pass 2 -- the same block with an agent id.
  console.log('   [Markdown] 2/3: + agentId="sample_agent"...');
  await glideClick(page, page.locator('[data-testid=markdown-tab-components]'));
  await sleep(800);

  const anchor = page.locator(ANCHOR);
  const nodeAttrs = page.locator(NODE_ATTRS);

  let msgCount = await sendPrompt(page, first);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const overridden = await waitForText(anchor, (t) => t.startsWith('<a'), 15_000);
  if (!overridden.startsWith('<a')) {
    ctx.warn('No link rendered in the reply, so none of the three claims could be read off the HTML');
  } else {
    if (!overridden.includes('my-link')) {
      ctx.fail(`The components override did not run: the anchor is "${overridden}"`);
    }
    if (!overridden.includes('noopener noreferrer')) {
      ctx.fail(
        `Link hardening did not survive the override: the page promises target="_blank" ` +
          `rel="noopener noreferrer", the anchor is "${overridden}"`,
      );
    }
    if (overridden.includes('data-streamdown')) {
      ctx.warn(
        'The overridden anchor still carries data-streamdown, which contradicts the page\'s ' +
          '"you are replacing, not extending".',
      );
    }
    await glideTo(page, anchor, 3000);
  }

  const nodeCount = ((await nodeAttrs.textContent().catch(() => '')) ?? '').trim();
  if (nodeCount !== '0') {
    ctx.fail(
      `${nodeCount} element(s) carry a literal node attribute after destructuring it out -- ` +
        "the page's own remedy did not work",
    );
  }
  await glideTo(page, nodeAttrs, 1500);

  // Pass 3 -- the baseline, for the comparison the page describes but cannot show.
  console.log('   [Markdown] 3/3: no override, for comparison...');
  await glideClick(page, page.locator('[data-testid=markdown-tab-none]'));
  await sleep(800);

  msgCount = await sendPrompt(page, second ?? first);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const baseline = await waitForText(anchor, (t) => t.startsWith('<a'), 15_000);
  if (baseline.startsWith('<a') && !baseline.includes('data-streamdown')) {
    ctx.warn(
      'The default anchor carries no data-streamdown either, so the page\'s "your component ' +
        'supplies neither" has nothing to be measured against on this version.',
    );
  }
  await glideTo(page, anchor, 3000);

  await evidenceThenIssueNote(page, config, logs, RELEVANT, {
    extraLines: () => {
      const lines: string[] = [];
      if (thrownText) lines.push(`thrown: ${thrownText.split(' Known agents')[0]}`);
      if (overridden.startsWith('<a')) lines.push(`overridden: ${overridden.slice(0, 160)}`);
      if (baseline.startsWith('<a')) lines.push(`default:    ${baseline.slice(0, 160)}`);
      return lines;
    },
  });
};
