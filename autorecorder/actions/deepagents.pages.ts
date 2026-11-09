/**
 * Deep Agents (Python) + React: per-page takes, finding notes and doc evidence.
 * Numbers are DeepAgentspy-React/FINDINGS.md IDs (owner-approved 2026-11-09).
 *
 * Level 1 (full take: demo -> doc highlights -> Notepad): #45 threads drawer, #46 A2UI dynamic +
 * advanced, #47 MCP Apps, #48 tool-based state streaming, #16 input/output schemas + workflow.
 * Level 2 (KNOWN_ISSUE, short take ending after the demo; doc-only pages keep the highlight):
 * #49 components, #12 fixed schema, #9 read/write state, #43 prebuilt streaming, #13 manual,
 * #57 the 17 "Not available for Langchain DeepAgents yet" banner pages.
 */
import { join } from 'node:path';
import { type PageActionHandler } from '../core/types';
import { sleep } from '../core/overlays/cursor';
import { checkpoint, mark } from '../core/timeline';
import { glideClick, glideTo } from './glide-click';
import {
  FINDING_EVIDENCE,
  FINDING_NOTES,
  KNOWN_ISSUE,
  keyboardSend,
  runDocOnlyFindingAction,
  runPromptOrError,
  scripted,
  withFinding,
  type DocEvidence,
} from './deepagents.actions';

// The copied LangGraph module ships its own page data: start from a clean slate.
for (const k of Object.keys(FINDING_NOTES)) delete FINDING_NOTES[k];
for (const k of Object.keys(FINDING_EVIDENCE)) delete FINDING_EVIDENCE[k];
KNOWN_ISSUE.clear();

export const BANNER_PAGES = [
  'chat', 'sidebar', 'popup', 'css', 'slots', 'headless-ui', 'reasoning-messages', 'voice', 'reasoning',
  'tool-based', 'json-render', 'hashbrown', 'open-generative-ui', 'hitl', 'use-interrupt',
  'headless-interrupts', 'subagents',
];
const BANNER: DocEvidence = { text: 'Not available for', caption: '"Not available for Langchain DeepAgents yet" banner (#57)' };
for (const id of BANNER_PAGES) {
  FINDING_NOTES[id] = 'page says not available for langchain deepagents yet, nothing to run';
  FINDING_EVIDENCE[id] = [BANNER];
  KNOWN_ISSUE.add(id);
}

/** Level 2 chat pages: already reported by the QA team, failing the same way. */
export const LEVEL2 = ['components', 'a2ui-fixed-schema', 'in-app-agent-read', 'in-app-agent-write', 'predictive-prebuilt', 'predictive-manual'];
for (const id of LEVEL2) {
  KNOWN_ISSUE.add(id);
  FINDING_NOTES[id] = 'already reported by the qa team';
}

Object.assign(FINDING_NOTES, {
  'threads-drawer': [
    'threads drawer (#45)',
    "page crashes right away: useAgent: Agent 'default' not found, known agents [sample_agent]",
    'the provider snippet has no agentId so it looks for "default"',
    'the quickstart only registers sample_agent',
    'also no "use client" on the page',
    'with agentId="sample_agent" added the drawer lists threads and chat works',
  ].join('\n'),
  'a2ui-dynamic-schema': [
    'dynamic schema a2ui (#46)',
    'every run fails, no ui and no reply',
    'error: <asyncio.locks.Event ...> is bound to a different event loop',
    'it comes from generate_a2ui in ag_ui_langgraph a2ui_tool.py calling the ChatOpenAI model',
    'agent is the page code as is, runtime has injectA2UITool: true',
    'also myCatalog in the frontend step is never defined',
  ].join('\n'),
  'a2ui-advanced': [
    'a2ui advanced (#46)',
    'this page builds on the dynamic schema setup',
    'that agent fails every run with "is bound to a different event loop"',
    'so the custom progress renderer never gets to show',
  ].join('\n'),
  'mcp-apps': [
    'mcp apps (#47)',
    'doc uses url https://mcp.excalidraw.com',
    'that url answers 308 redirect to /mcp',
    'runtime log: MCP tool discovery failed ... fetch failed, unexpected redirect',
    'so the agent has no excalidraw tools and no app renders, it just fakes a reply',
    'with mcp.excalidraw.com/mcp the drawing renders fine',
  ].join('\n'),
  'predictive-tool': [
    'tool based state streaming (#48)',
    'the python graph ends with workflow.compile(checkpointer=MemorySaver())',
    'langgraph dev refuses it: GraphLoadError ... includes a custom checkpointer',
    'then Application startup failed, the whole server goes down, every graph',
    'what u see here is a copy with the checkpointer removed, then the steps stream',
  ].join('\n'),
  'state-inputs-outputs': [
    'input/output schemas (#16)',
    "snippet has no imports, first error NameError: name 'List' is not defined",
    'with the imports added model = ChatOpenAI() picks the default gpt-3.5-turbo',
    'openai answers 404 the model gpt-3.5-turbo has been deprecated, on every run',
    'chat shows no reply',
    'with a model set it answers fine',
  ].join('\n'),
});
FINDING_NOTES['workflow-execution'] = FINDING_NOTES['state-inputs-outputs'].replace(
  'input/output schemas (#16)',
  'workflow execution, same content as input/output schemas (#16)',
);

Object.assign(FINDING_EVIDENCE, {
  'threads-drawer': [{ text: '<CopilotKitProvider runtimeUrl="/api/copilotkit">', caption: 'provider without agentId -> "default" not found' }],
  'a2ui-dynamic-schema': [
    { text: 'injectA2UITool: true,', caption: 'runtime turns the A2UI tool on' },
    { text: 'model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),', caption: 'the agent whose generate_a2ui call fails every run' },
  ],
  'a2ui-advanced': [{ text: 'a secondary LLM generates the UI schema and data', caption: 'builds on the Dynamic Schema flow that fails (#46)' }],
  'mcp-apps': [{ text: 'url: "https://mcp.excalidraw.com",', caption: '308-redirects to /mcp: discovery fails' }],
  'predictive-tool': [
    { text: 'Configure specific tool calls', caption: 'tool-based option', clickTab: 'Tool-Based Predictive State Updates' },
    { text: 'graph = workflow.compile(checkpointer=MemorySaver())', caption: 'langgraph dev refuses a custom checkpointer', clickTab: 'Python' },
  ],
  'state-inputs-outputs': [
    { text: 'model = ChatOpenAI()', caption: 'no imports anywhere in this block; defaults to gpt-3.5-turbo, which OpenAI rejects as deprecated' },
  ],
});
FINDING_EVIDENCE['workflow-execution'] = FINDING_EVIDENCE['state-inputs-outputs'];

/** No MCP App iframe after the reply = the feature did not work. */
const mcpTake: PageActionHandler = async (page, config, root, ctx) => {
  await keyboardSend(page, config, root, ctx);
  await sleep(5000);
  const frames = await page.locator('iframe').count().catch(() => 0);
  void checkpoint('mcp-app', 'MCP App iframe rendered', async () => (frames > 0 ? `${frames} iframe(s)` : null));
  if (frames === 0) ctx.fail('No MCP App rendered: the agent replied without any Excalidraw app (see #47).');
};

/** Write-state take: toggle, then ask; the reply stays English (level 2, #9). */
const writeStateTake = scripted([
  { click: 'Toggle Language', holdMs: 1500 },
  { waitText: 'spanish', timeoutMs: 10000 },
  { prompt: 'Tell me one short fact about the moon.' },
  { holdMs: 4000 },
]);

const multimodalTake: PageActionHandler = async (page, config, root, ctx) => {
  const input = page.locator('input[type=file]').first();
  await input.waitFor({ state: 'attached', timeout: 60000 });
  mark('action', 'attach image');
  await input.setInputFiles(join(process.cwd(), 'assets', 'red.png')); // cwd = autorecorder/ (ESM: no __dirname)
  await sleep(2500);
  await keyboardSend(page, config, root, ctx);
};

const programmaticTake: PageActionHandler = async (page, _config, _root, ctx) => {
  const btn = page.getByRole('button', { name: 'Run agent', exact: true });
  await btn.waitFor({ state: 'visible', timeout: 60000 });
  await sleep(6000);
  mark('click', 'Run agent');
  await glideClick(page, btn);
  const ok = await page.locator('#messages [data-role="assistant"]').filter({ hasText: /\w{3,}/ }).first()
    .waitFor({ timeout: 180000 }).then(() => true).catch(() => false);
  void checkpoint('reply', 'assistant message appeared', async () => (ok ? 'yes' : null));
  if (!ok) ctx.fail('Run agent produced no assistant message.');
  await sleep(4000);
};

const governedTake: PageActionHandler = async (page, config, root, ctx) => {
  await keyboardSend(page, config, root, ctx);
  const approve = page.getByRole('button', { name: 'Approve and run' });
  const shown = await approve.waitFor({ timeout: 120000 }).then(() => true).catch(() => false);
  void checkpoint('card', 'approval card rendered', async () => (shown ? 'Approve and run' : null));
  if (!shown) {
    ctx.fail('No approval card rendered.');
    return;
  }
  await sleep(1500);
  mark('click', 'Approve and run');
  await glideClick(page, approve);
  await sleep(20000);
};

/**
 * Threads Drawer (#45): the page crashes on load. Show the crash, then end the take (no minutes of
 * a frozen error page): mark it, rest the cursor on the message, fail, and let the finding follow.
 */
const crashTake: PageActionHandler = async (page, _config, _root, ctx) => {
  const crash = page.getByText(/couldn.t load|Application error|not found after runtime sync/i).first();
  const input = page.locator('textarea:visible').first();
  const outcome = await Promise.race([
    crash.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'crash' as const),
    input.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'chat' as const),
  ]).catch(() => 'timeout' as const);
  if (outcome === 'chat') {
    await keyboardSend(page, _config, _root, ctx);
    return;
  }
  mark('error');
  if (outcome === 'crash') await glideTo(page, crash, 2000).catch(() => {});
  void checkpoint('error', 'page crash visible', async () => (outcome === 'crash' ? 'crash page' : null));
  await sleep(4000);
  ctx.fail("The page crashed on load (useAgent: Agent 'default' not found).");
};

/**
 * State streaming (/shared-state/streaming): the agent writes the document into shared state with a
 * tool and posts no chat text, so wait for the page's document panel instead of a chat reply.
 */
const streamingTake: PageActionHandler = async (page, config, _root, ctx) => {
  const input = page.locator('textarea:visible').first();
  await input.waitFor({ state: 'visible', timeout: 60000 });
  await sleep(2000);
  await glideClick(page, input);
  await sleep(300);
  await page.keyboard.type(config.prompt, { delay: 60 });
  await page.keyboard.press('Enter');
  mark('action', 'prompt sent');
  const doc = page.locator('#doc');
  const ok = await page
    .waitForFunction(() => (document.querySelector('#doc')?.textContent ?? '').trim().length > 40, undefined, { timeout: 180000, polling: 500 })
    .then(() => true)
    .catch(() => false);
  if (ok) {
    await glideTo(page, doc, 1500).catch(() => {});
    await page.getByText('State streaming done').waitFor({ timeout: 120000 }).catch(() => {});
  }
  void checkpoint('document', 'document streamed into shared state', async () => ((await doc.textContent().catch(() => '')) || null));
  if (!ok) ctx.fail('The document never appeared in shared state.');
  await sleep(4000);
};

export const DEEPAGENTS_ACTIONS: Record<string, PageActionHandler> = {
  ...Object.fromEntries(BANNER_PAGES.map((id) => [id, runDocOnlyFindingAction])),
  'threads-drawer': withFinding(crashTake),
  'a2ui-dynamic-schema': withFinding(runPromptOrError),
  'a2ui-advanced': withFinding(runPromptOrError),
  'state-inputs-outputs': withFinding(runPromptOrError),
  'workflow-execution': withFinding(runPromptOrError),
  'mcp-apps': withFinding(mcpTake),
  'predictive-tool': withFinding(keyboardSend),
  'in-app-agent-write': writeStateTake,
  multimodal: multimodalTake,
  'programmatic-control': programmaticTake,
  'governed-actions': governedTake,
  'shared-state-streaming': streamingTake,
};

/** Every other page (✅ and level-2 chat pages): keyboard send + reply/surface wait. */
export const DEFAULT_TAKE: PageActionHandler = keyboardSend;
