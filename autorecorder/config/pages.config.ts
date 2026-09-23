/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * `startLine`/`endLine` are what the simulated IDE highlights. They are
 * hardcoded, which means they drift the moment someone edits a demo page.
 * Doctor guards this: where a file carries `[!code highlight]` or `#region`
 * markers, it checks the range still covers one and names the marker's current
 * line when it does not. Keep those markers in the frontend and the guard keeps
 * working.
 *
 * ── `knownIssue` ───────────────────────────────────────────────────────────
 * This repo is not only documenting an integration that works. Ten of the
 * pages below are on the QA report as broken, and their clips exist to show
 * that. `knownIssue` is what makes the run say `[ISSUE]` rather than `[PASS]`,
 * and it is the same object `ci/build-report.mjs` renders into the daily
 * report — so the sentence typed into Notepad on video and the row that goes
 * to the manager are one string, written here, once.
 *
 * A page whose defect gets fixed upstream should have its `knownIssue` deleted
 * in the same change that confirms the fix. Leaving a stale one behind is worse
 * than having none: the clip keeps asserting a bug that is gone.
 */

import { definePages } from '../core/types';

/**
 * Pages that stay registered but are never filmed.
 *
 * They keep their route, their doctor entry and their CI group, so drift and
 * coverage still track them and the findings still hold. Only the camera is
 * off. A page belongs here when a clip would show nothing the findings do not
 * already say, or would film a wall rather than the feature.
 *
 * Intelligence and the new upstream markdown page are excluded by standing
 * instruction from the project owner, not by accident. Do not re-enable one
 * without asking: an empty entry here is how a page silently starts recording
 * again.
 */
export const SKIP_RECORDING: Record<string, string> = {
  'intelligence-memories': 'memory is not entitled on this CopilotKit org (403 MEMORY_NOT_ENTITLED)',
  learning: 'owner instruction: Intelligence Learning is not recorded',
  'intelligence-learned-skills': 'owner instruction: Intelligence Learned Skills is not recorded',
  'markdown-rendering':
    'owner instruction: not reachable from the docs sidebar, so not under test yet',
  'message-history': 'owner instruction: tracked and built 2026-09-22, not recorded yet',
};

export const PAGES = definePages([
  // -- Getting Started ---------------------------------------------------------
  {
    id: 'quickstart',
    name: 'Quickstart',
    videoName: 'Quickstart',
    docPath: 'quickstart',
    route: 'quickstart',
    // Leads with the versions rather than package.json, which declares RANGES:
    // a clip showing "^1.69.0" while the run installed 1.69.3 documents a floor
    // nobody tested. VERSIONS.md is generated after install
    // (`node ci/write-versions.mjs`) and names what actually resolved.
    ideFile: 'frontend/VERSIONS.md',
    startLine: 6,
    endLine: 20,
    extraTabs: [
      // The manifest next to the resolved versions. VERSIONS.md says what this
      // run installed; package.json says what a reader would write in their own
      // project, which is the thing the Quickstart is actually teaching. Both,
      // in that order, because the range alone was what used to mislead.
      { filePath: 'frontend/package.json', startLine: 11, endLine: 25 },
      { filePath: 'backend/main.py', startLine: 13, endLine: 31 },
      {
        filePath: 'frontend/src/app/quickstart/demo-chat/page.tsx',
        startLine: 21,
        endLine: 39,
      },
    ],
    prompt: 'Hey, are you connected? What is the weather like in Karachi right now?',
    waitAfterPromptMs: 4000,
  },
  // -- Generative UI > A2UI ----------------------------------------------------
  {
    id: 'a2ui-advanced',
    name: 'Generative UI - A2UI - Advanced',
    videoName: 'Advanced',
    docPath: 'generative-ui/a2ui/advanced',
    route: 'generative-ui/a2ui/advanced',
    ideFile: 'frontend/src/app/generative-ui/a2ui/advanced/demo-chat/page.tsx',
    startLine: 12,
    endLine: 26,
    prompt: 'Can you show me a pricing card for a Pro plan at $29 a month?',
    waitAfterPromptMs: 6000,
  },
  {
    id: 'a2ui-dynamic-schema',
    name: 'Generative UI - A2UI - Dynamic Schema A2UI',
    videoName: 'DynamicSchemaA2UI',
    docPath: 'generative-ui/a2ui/dynamic-schema',
    route: 'generative-ui/a2ui/dynamic-schema',
    ideFile: 'frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx',
    startLine: 20,
    endLine: 34,
    extraTabs: [{ filePath: 'backend/src/a2ui_dynamic.py', startLine: 17, endLine: 34 }],
    prompt: 'Can you show me a pricing card for a Pro plan at $29 a month?',
    waitAfterPromptMs: 6000,
  },
  {
    id: 'a2ui-fixed-schema',
    name: 'Generative UI - A2UI - Fixed Schema A2UI',
    videoName: 'FixedSchemaA2UI',
    docPath: 'generative-ui/a2ui/fixed-schema',
    route: 'generative-ui/a2ui/fixed-schema',
    // The catalog, not the page: `includeBasicCatalog: true` is the line that
    // sends the renderer looking for the basic catalog it cannot resolve.
    ideFile: 'frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts',
    startLine: 16,
    endLine: 26,
    extraTabs: [
      {
        filePath: 'frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx',
        // Was 29-40, which ran two lines past the end of a 37-line file and
        // failed the doctor. Now the provider block: the a2ui={{ catalog }}
        // prop and the chat it wraps.
        startLine: 28,
        endLine: 36,
      },
      { filePath: 'backend/src/a2ui_fixed.py', startLine: 88, endLine: 104 },
    ],
    prompt: 'Find me flights from New York to London on March 15, please.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area: 'Deep Agents - Generative UI - A2UI - Fixed Schema A2UI',
      problem:
        'A2UI rendering fails with `Catalog not found: ' +
        'https://a2ui.org/specification/v0_9/basic_catalog.json`, so no surface is drawn.',
      impact:
        'The A2UI feature cannot be used at all on this page: without the catalog the renderer ' +
        'has no component vocabulary and the generated surface never appears.',
      likelyCause:
        'The renderer resolves the `v0_9/basic_catalog.json` catalog from a2ui.org, and that ' +
        'catalog is unavailable at the URL it requests.',
      note: [
        'a2ui fixed schema - no card renders',
        '',
        'asked for flights new york to london',
        'expected a flight card. nothing drawn in the chat at all',
        '',
        'console has the real reason - catalog cant be resolved',
        'no catalog means no components to draw with so a2ui is unusable here',
      ].join('\n'),
    },
  },
  {
    id: 'a2ui-styling',
    name: 'Generative UI - A2UI - Styling',
    videoName: 'Styling',
    docPath: 'generative-ui/a2ui/styling',
    route: 'generative-ui/a2ui/styling',
    // The page is a CSS file, so the CSS is what the IDE step should show.
    ideFile: 'frontend/src/a2ui/theme.css',
    startLine: 22,
    endLine: 40,
    extraTabs: [
      {
        filePath: 'frontend/src/app/generative-ui/a2ui/styling/demo-chat/page.tsx',
        startLine: 17,
        endLine: 31,
      },
    ],
    prompt: 'Can you show me a pricing card for a Pro plan at $29 a month?',
    waitAfterPromptMs: 6000,
    // The entry this comment used to withhold. It said the page would carry no
    // `knownIssue` until the symptom was known, because a defect invented to
    // match a red cell is a fabricated finding. The symptom is now known and
    // the cause is checkable without running anything -- see `likelyCause`.
    knownIssue: {
      area: 'Deep Agents - Generative UI - A2UI - Styling',
      problem:
        'None of the eight CSS custom properties the page documents changes the surface. ' +
        'theme.css is imported at the app root and the surface does carry `.a2ui-surface`, ' +
        'but the rendered card keeps the renderer built-in colours regardless of what the ' +
        'variables are set to.',
      impact:
        'A2UI surfaces cannot be themed by the documented method. Everything the page teaches -- ' +
        'the custom-properties table, the dark-mode block and the `.a2ui-card` width override -- ' +
        'has no effect, and the reader has no way to tell that from the page.',
      likelyCause:
        '@copilotkit/a2ui-renderer reads exactly one custom property, ' +
        '`--a2ui-primary-color`, which the page never mentions. None of `--primary`, ' +
        '`--primary-foreground`, `--card`, `--border`, `--radius`, `--foreground`, `--input` ' +
        'or `--background` is read anywhere in the shipped package, and `.a2ui-card` is never ' +
        'emitted, so the "Card width" selector matches no element either.',
      note: [
        'a2ui styling - theme.css does nothing',
        '',
        'set every variable in the page to a loud colour to make it obvious',
        'asked for the pro plan pricing card',
        'card comes out in the renderer default dark + blue, none of my colours',
        '',
        'surface has the .a2ui-surface class and the css is imported, so that part is fine',
        'grepped the installed renderer - only var() in the whole package is',
        '--a2ui-primary-color, which the page never mentions',
        'none of the 8 documented variables are read anywhere, and nothing emits .a2ui-card',
      ].join('\n'),
    },
  },
  // -- Generative UI > Your Components -----------------------------------------
  {
    id: 'interrupt-based',
    name: 'Generative UI - Your Components - Interrupt-Based',
    videoName: 'InterruptBased',
    docPath: 'generative-ui/your-components/interrupt-based',
    route: 'generative-ui/your-components/interrupt-based',
    ideFile:
      'frontend/src/app/generative-ui/your-components/interrupt-based/demo-chat/page.tsx',
    startLine: 12,
    endLine: 39,
    // The `agents` region, because `_SYSTEM_PROMPT` is the half of this that is
    // worth reading: it names `agent_name` and tells the model to use it, which
    // is what makes the name survive the interrupt.
    extraTabs: [{ filePath: 'backend/src/interrupt_based.py', startLine: 73, endLine: 116 }],
    prompt: 'Hi there. Could you help me with something?',
    prompts: ['Hi there. Could you help me with something?', 'What should I call you?'],
    waitAfterPromptMs: 4000,
    // No `knownIssue`, as of 01 Sep 2026: the page works. The entry that was
    // here filed the interrupt's name being lost, and it was written as an
    // explicit re-check -- the 30-Aug doc revision had changed both halves of
    // its stated cause, so the note said that if the agent came back with the
    // name it was given, the finding was resolved upstream and the entry came
    // out. It did, so it has.
    //
    // Removing it is what stops the Notepad report being typed at the end of
    // the take: the action writes that note only when this field is present. A
    // clip that still reports a fixed bug is worse than one that reports
    // nothing, which is why this is a deletion rather than a comment-out.
    //
    // `git log -S 'name is not remembered' -- autorecorder/config/pages.config.ts`
    // brings back the full text if this turns out to be intermittent. The
    // narration filed against it is parked in `autorecorder/audio/on-hold/`.
  },
  // -- Generative UI -----------------------------------------------------------
  {
    id: 'tool-rendering',
    name: 'Generative UI - Tool Rendering',
    videoName: 'ToolRendering',
    docPath: 'generative-ui/tool-rendering',
    route: 'generative-ui/tool-rendering',
    ideFile: 'frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx',
    startLine: 30,
    endLine: 44,
    extraTabs: [{ filePath: 'backend/src/tool_rendering.py', startLine: 13, endLine: 33 }],
    prompt: 'Check the weather in Tokyo for me.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'state-rendering',
    name: 'Generative UI - State Rendering',
    videoName: 'StateRendering',
    docPath: 'generative-ui/state-rendering',
    route: 'generative-ui/state-rendering',
    ideFile: 'frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx',
    startLine: 9,
    endLine: 37,
    prompt: 'Research renewable energy storage for me, and show me your progress as you go.',
    waitAfterPromptMs: 4000,
  },
  // -- App Control -------------------------------------------------------------
  {
    id: 'frontend-tools',
    name: 'App Control - Frontend Tools',
    videoName: 'FrontendTools',
    docPath: 'frontend-tools',
    route: 'frontend-tools',
    ideFile: 'frontend/src/app/frontend-tools/demo-chat/page.tsx',
    startLine: 16,
    endLine: 29,
    extraTabs: [{ filePath: 'backend/src/frontend_tools.py', startLine: 31, endLine: 52 }],
    prompt: 'Can you say hello to Fiqros for me?',
    waitAfterPromptMs: 3500,
  },
  {
    id: 'in-app-agent-read',
    name: 'App Control - Reading agent state',
    videoName: 'ReadingAgentState',
    docPath: 'shared-state/in-app-agent-read',
    route: 'shared-state/in-app-agent-read',
    ideFile: 'frontend/src/app/shared-state/in-app-agent-read/demo-chat/page.tsx',
    startLine: 10,
    endLine: 39,
    extraTabs: [{ filePath: 'backend/src/shared_state.py', startLine: 33, endLine: 66 }],
    prompt: 'Please set the language to Spanish.',
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - App Control - Reading agent state',
      problem:
        'The agent switches to Spanish when asked, but the `language` value shown in the app ' +
        'never updates -- the panel stays on its previous value while the chat answers in Spanish.',
      impact:
        'State written by the agent cannot be read back in the app, so no UI can reflect what ' +
        'the agent is currently doing.',
      likelyCause:
        'The state delta is not reaching the frontend `useAgent` subscription, so `agent.state` ' +
        'never carries the value the agent is acting on.',
      note: [
        'reading agent state - ui never updates',
        '',
        'told it to set language to spanish',
        'it answers in spanish so the agent got it',
        '',
        'but the language field on the left never changes',
        'state the agent writes isnt reaching useAgent',
      ].join('\n'),
    },
  },
  {
    id: 'in-app-agent-write',
    name: 'App Control - Writing agent state',
    videoName: 'WritingAgentState',
    docPath: 'shared-state/in-app-agent-write',
    route: 'shared-state/in-app-agent-write',
    ideFile: 'frontend/src/app/shared-state/in-app-agent-write/demo-chat/page.tsx',
    startLine: 10,
    endLine: 55,
    extraTabs: [{ filePath: 'backend/src/shared_state.py', startLine: 33, endLine: 66 }],
    prompt: 'Tell me one interesting fact about Karachi, please.',
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - App Control - Writing agent state',
      problem:
        'When set to Spanish, the agent replies in Spanish, but the `language` field gets empty.',
      impact:
        'UI elements cannot maintain agent state, as the language field gets emptied after the agent responds.',
      likelyCause:
        'The state delta returned by the agent run drops the `language` field, clearing the frontend state.',
      note: [
        'writing agent state',
        '',
        'hit toggle language then sent a message',
        'when set to spanish it replies in spanish but language fields gets empty',
      ].join('\n'),
    },
  },
  {
    id: 'state-inputs-outputs',
    name: 'App Control - Input/Output Schemas',
    videoName: 'InputOutputSchemas',
    docPath: 'shared-state/state-inputs-outputs',
    route: 'shared-state/state-inputs-outputs',
    ideFile: 'backend/src/state_inputs_outputs.py',
    startLine: 31,
    endLine: 49,
    extraTabs: [
      { filePath: 'backend/src/state_inputs_outputs.py', startLine: 103, endLine: 114 },
      {
        filePath: 'frontend/src/app/shared-state/state-inputs-outputs/demo-chat/page.tsx',
        startLine: 10,
        endLine: 45,
      },
    ],
    prompt: 'Quick one: why is the sky blue?',
    waitAfterPromptMs: 4000,
  },
  // -- App Control > State Streaming -------------------------------------------
  {
    id: 'predictive-prebuilt',
    name: 'App Control - State Streaming - Prebuilt agent',
    videoName: 'PrebuiltAgent',
    docPath: 'shared-state/predictive-state-updates?agent-type=prebuilt',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'frontend/src/app/shared-state/predictive-state-updates/demo-chat/page.tsx',
    startLine: 32,
    endLine: 81,
    extraTabs: [{ filePath: 'backend/src/predictive_state.py', startLine: 31, endLine: 61 }],
    prompt: 'Plan a three-step research task on solar panel recycling, and report each step as you go.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area: 'Deep Agents - App Control - State Streaming - Prebuilt agent',
      problem:
        'No agent progress appears in the app. The steps list stays empty for the whole run ' +
        'while the chat answers normally.',
      impact:
        'Agent progress cannot be shown in real time, which is the entire purpose of this page.',
      likelyCause:
        'The streamed state never reaches the UI variables, so `observed_steps` stays empty in ' +
        '`agent.state` even though the tool call carrying it completes.',
      note: [
        'predictive state - prebuilt renders no steps',
        '',
        'asked for a multi step task on the prebuilt tab',
        'agent progress stayed empty the whole run',
        '',
        'chat answered fine so the agent ran, the steps just never reach the panel',
      ].join('\n'),
    },
  },
  // -- App Control > State Streaming > Custom Graph -----------------------------
  {
    id: 'predictive-manual',
    name: 'App Control - State Streaming - Custom Graph - Manually Predictive',
    videoName: 'ManuallyPredictive',
    docPath: 'shared-state/predictive-state-updates?agent-type=custom-graph',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'backend/src/predictive_state_manual.py',
    startLine: 39,
    endLine: 64,
    // The diagnosis, as three tabs in the order a tester opens them.
    //
    // `ideFile` is the shipped node: the unused `ChatOpenAI` import at the top
    // and the body ending at `# ...` are both in frame at once. Then the doc's
    // own Python tab, so the elisions are visibly the page's and not ours. Then
    // the TypeScript tab from the same section, which prints the two lines the
    // Python reader never gets -- `model.invoke`, and the return carrying
    // `messages` and `observed_steps`. Those are the silence and the vanishing
    // steps, one key each.
    //
    // The doc snapshot rather than the live page because the IDE step reads
    // files from the repo, and because pinning the snapshot means the clip
    // keeps showing the revision the finding was filed against.
    extraTabs: [
      {
        filePath: 'doc-snapshot/pages/deepagents__shared-state__predictive-state-updates.md',
        startLine: 149,
        endLine: 165,
      },
      {
        filePath: 'doc-snapshot/pages/deepagents__shared-state__predictive-state-updates.md',
        // From the emit loop, not from the model call, so the tab opens on the
        // same four-step loop the Python tab ends with -- then keeps going into
        // the two lines Python replaces with `# ...`. The parallel is the point.
        startLine: 186,
        endLine: 203,
      },
    ],
    prompt: 'Plan a three-step research task on solar panel recycling, and report each step as you go.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area:
        'Deep Agents - App Control - State Streaming - Custom Graph - Manually Predictive',
      problem:
        'The steps render while the run is in flight and then vanish, and the agent never ' +
        'replies. The run completes with an empty chat and nothing kept in state.',
      impact:
        'The variant is unusable as published: the user gets no answer, and the progress the ' +
        'page is about does not survive the run it was emitted during, so nothing in the app ' +
        'can read it afterwards.',
      likelyCause:
        "The Python tab's `chat_node` is printed with two `# ...` elisions, and they hide " +
        'everything that makes the node work: it never instantiates a model, never calls one, ' +
        'and never returns. `ChatOpenAI`, `SystemMessage` and the model id are imported and ' +
        'unused; there is no `.invoke` and no `return` in the body at all, so the node emits ' +
        'four hardcoded strings, sleeps, and yields `None`. `copilotkit_emit_state` streams ' +
        'each step as it goes, which is why the rows appear live, but a node returning `None` ' +
        'contributes no message and no state update. The TypeScript tab of the same section ' +
        'prints the missing half in full -- `const response = await model.invoke(...)` then ' +
        '`return { messages: [response], observed_steps: state.observed_steps }`, its own ' +
        'comment calling that second key "Persist the final state". Those are exactly the two ' +
        'symptoms: no `messages` is the silence, no `observed_steps` is the vanishing. The ' +
        'signature also promises `Command[Literal["cpk_action_node", "tool_node", "__end__"]]` ' +
        'while the body returns nothing and the graph contains neither node.',
      // The finding IS the silence, so it must not be read as a broken take.
      expectsNoResponse: true,
      note: [
        'predictive custom graph manual - steps show, then no reply',
        '',
        'asked for a multi step task',
        'the steps list fills in while it runs so the emit half works',
        '',
        'but the agent never answers, and the steps dont survive the run either',
        'called the graph directly - comes back 200 with no observed_steps and no ai message',
        '',
        'the python tab hides the working half behind two # ... markers',
        'no model is ever created or called in that node, and it never returns',
        '',
        'the typescript tab right next to it prints both - model.invoke, then',
        'return { messages: [response], observed_steps: ... } "persist the final state"',
        'thats the silence and the vanishing steps, one missing key each',
      ].join('\n'),
    },
  },
  {
    id: 'predictive-tool',
    name: 'App Control - State Streaming - Custom Graph - Tool-based Predictive',
    videoName: 'ToolBasedPredictive',
    docPath: 'shared-state/predictive-state-updates?agent-type=custom-graph',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'backend/src/predictive_state_tool.py',
    startLine: 49,
    endLine: 134,
    // The `graph` region, because the checkpointer note is where the defect
    // lives -- the page's own compile call is the thing that cannot run.
    extraTabs: [
      { filePath: 'backend/src/predictive_state_tool.py', startLine: 137, endLine: 180 },
    ],
    prompt: 'Plan a three-step research task on solar panel recycling, and report each step as you go.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area:
        'Deep Agents - App Control - State Streaming - Custom Graph - Tool-based Predictive',
      problem:
        "The snippet's last line, `graph = workflow.compile(checkpointer=MemorySaver())`, " +
        'cannot run on the server the same docs tell you to use. `langgraph dev` raises ' +
        'ValueError on a graph that carries its own checkpointer and then exits.',
      impact:
        'Copying the page as published does not yield a degraded page -- it yields no server. ' +
        'The load error aborts startup for the whole app, so all fifteen graphs in ' +
        'langgraph.json go down together and every route in the harness is unreachable, not ' +
        'just this one.',
      likelyCause:
        'LangGraph API manages persistence itself and rejects a user-supplied checkpointer. ' +
        'The page adds MemorySaver without noting that it only applies when the graph is run ' +
        'standalone, not under `langgraph dev` / LangGraph Platform.',
      note: [
        'predictive tool based - published compile call kills the server',
        '',
        'new 30 aug revision ends with compile(checkpointer=MemorySaver())',
        'pasted it in verbatim and langgraph dev refused to boot at all',
        '',
        'ValueError ... includes a custom checkpointer ... Application startup failed. Exiting.',
        'langgraph-api 0.12.0',
        '',
        'not just this graph - the whole app dies so nothing else records either',
        'had to drop the checkpointer to get a run at all, see the note in the file',
      ].join('\n'),
    },
  },
  {
    id: 'human-in-the-loop-governed-actions',
    name: 'App Control - Governed Action Approval',
    videoName: 'GovernedActions',
    docPath: 'human-in-the-loop/governed-actions',
    route: 'human-in-the-loop/governed-actions',
    // The tool registration -- the half that makes the run stop.
    ideFile: 'frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx',
    startLine: 109,
    endLine: 148,
    extraTabs: [
      // The approval card the tool renders.
      {
        filePath: 'frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx',
        startLine: 42,
        endLine: 103,
      },
    ],
    prompt:
      'Please send an invoice reminder to acme@example.com, but check with me before it goes out.',
    // Two turns, because the card has two answers and only one of them was
    // ever filmed. The first request is harmless and gets approved; the second
    // is destructive and gets rejected, which is the half that shows the
    // policy actually stopping something.
    prompts: [
      'Please send an invoice reminder to acme@example.com, but check with me before it goes out.',
      'Now permanently delete the acme@example.com customer record, but check with me before it goes through.',
    ],
    waitAfterPromptMs: 6000,
  },
  // -- Added 2026-09-11: three pages new upstream, identical under every
  // framework prefix. After every existing doc page so no clip is renumbered.
  {
    id: 'frontend-cards',
    name: 'Generative UI - Frontend-Driven Cards',
    videoName: 'FrontendCards',
    docPath: 'generative-ui/frontend-cards',
    route: 'generative-ui/frontend-cards',
    // Step 1: the renderer, verbatim.
    ideFile: 'frontend/src/app/generative-ui/frontend-cards/event-card.tsx',
    startLine: 8,
    endLine: 28,
    extraTabs: [
      // Step 2: registered on the provider, props as published -- and beside
      // it the Quickstart-agent variant the take switches to.
      {
        filePath: 'frontend/src/app/generative-ui/frontend-cards/demo-chat/page.tsx',
        startLine: 251,
        endLine: 271,
      },
      // Step 3: the bare useAgent() and addMessage with role "activity", verbatim.
      {
        filePath: 'frontend/src/app/generative-ui/frontend-cards/deployment-watcher.tsx',
        startLine: 16,
        endLine: 38,
      },
    ],
    prompt:
      'Have you been shown any deployment card in this conversation? List the roles of every message you received.',
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - Generative UI - Frontend-Driven Cards',
      problem:
        'Built as published, the page renders no chat. Its `useAgent()` and `<CopilotChat />` pass no ' +
        'agent id, so they ask for "default"; the Deep Agents runtime registers its graphs by id ' +
        '(`sample_agent`) and has no "default", and `useAgent()` throws "Agent \'default\' not found after ' +
        'runtime sync" as soon as `/info` answers (3 of 3 loads).',
      impact:
        'A Deep Agents reader who copies the three snippets gets a crashed route, not a card. With the ' +
        'Quickstart\'s `agent="sample_agent"` added to the provider the rest of the page holds -- the card ' +
        'renders and the run payload carries only `user` -- but the page never says that prop is needed. ' +
        'Separately, a card added before the runtime connects is silently dropped (3 of 3).',
      likelyCause:
        'The page is byte-identical under every framework prefix and assumes an agent registered as ' +
        '"default". The Deep Agents Quickstart names its agent `sample_agent` and puts ' +
        '`agent="sample_agent"` on its own provider; step 2\'s provider has neither.',
      note: [
        'frontend cards - published code crashes the route',
        '',
        'first tab = step 2 provider exactly as the page has it, no agent prop',
        "so useAgent() asks for agent 'default'. deep agents registers sample_agent, no default",
        "-> Agent 'default' not found after runtime sync (the overlay). chat never renders",
        '',
        'second tab = same code + the quickstart agent="sample_agent"',
        'card renders, payload row says user only, agent says it saw no card',
        'so the idea works, the page just assumes a default agent',
      ].join('\n'),
    },
  },
  {
    id: 'intelligence-memories',
    name: 'Intelligence - User Memories',
    videoName: 'Memories',
    docPath: 'intelligence/memories',
    route: 'intelligence/memories',
    // The page's React component, verbatim. Its import was wrong until the
    // 2026-09-21 sync and now points at /v2, so the file compiles and the demo
    // imports it rather than keeping a corrected copy.
    ideFile: 'frontend/src/app/intelligence/memories/memory-list.tsx',
    startLine: 16,
    endLine: 37,
    extraTabs: [
      // The option the page never mentions, and without which every memory
      // route 404s at the runtime.
      {
        filePath: 'frontend/src/app/api/copilotkit-memory/[[...slug]]/route.ts',
        startLine: 44,
        endLine: 60,
      },
    ],
    prompt: 'Please remember that I prefer concise status updates.',
    waitAfterPromptMs: 3000,
    knownIssue: {
      area: 'Deep Agents - Intelligence - User Memories',
      problem:
        'On the Deep Agents Quickstart runtime the hook reports `isAvailable: true` over an empty list, ' +
        'no memory request ever leaves the browser, and saving fails with "Runtime URL is not ' +
        'configured". The agent, asked to remember something, says it will. (The React snippet also ' +
        'imported `useMemories` from `@copilotkit/react-core`, which has no such export -- TS2305 plus a ' +
        'knock-on TS7006. Fixed upstream on 2026-09-21: it now reads `@copilotkit/react-core/v2`.)',
      impact:
        'Memory cannot be used from React as documented, and the failure does not look like one: the ' +
        "page's component shows an empty list rather than \"Memory is not available\", and the save " +
        "error names a runtime URL that is in fact configured.",
      likelyCause:
        'The client memory store only gets a context when `/info` advertises an Intelligence socket, ' +
        'so on a non-Intelligence runtime it never fetches and never flips `isAvailable`. Even on an ' +
        'Intelligence runtime every `/memories/*` route 404s unless `CopilotRuntime` is built with ' +
        '`memory: { access }` (or the deprecated `exposeMemoryRoutes`), which the page never mentions ' +
        '-- present on both 1.69.0 and 1.71.0. With that option the platform answers 403 ' +
        'MEMORY_NOT_ENTITLED: the CopilotKit org has no memory entitlement.',
      note: [
        'memories - blocked on entitlement',
        '',
        'the /v2 import bug is fixed upstream as of 21 sep, snippet compiles now',
        'runtime needs memory: { access }, page never says',
        'with it: 403 MEMORY_NOT_ENTITLED, org has no memory',
        'managed platform, so no embedder config needed',
      ].join('\n'),
    },
  },
  {
    id: 'intelligence-learned-skills',
    name: 'Intelligence - Skill delivery',
    videoName: 'LearnedSkills',
    docPath: 'intelligence/learned-skills',
    route: 'intelligence/learned-skills',
    // The one adapter row whose package this repo has: BuiltInAgent, added to
    // the table on 2026-09-21. Verbatim. Uncompilable on runtime 1.71.0;
    // compiles on the 1.73.3 installed since 2026-09-23.
    ideFile: 'frontend/src/app/intelligence/learned-skills/built-in-agent-classic.ts',
    startLine: 30,
    endLine: 41,
    extraTabs: [
      // Factory mode, where the page's "every factory receives a learnedSkills
      // object" met an AgentFactoryContext with no such property on 1.71.0.
      {
        filePath: 'frontend/src/app/intelligence/learned-skills/built-in-agent-factory.ts',
        startLine: 31,
        endLine: 58,
      },
      // The Python side: no adapter to mount, so the demo lists the two tool
      // names the page reserves as absent rather than registered.
      {
        filePath: 'frontend/src/app/intelligence/learned-skills/demo-chat/page.tsx',
        startLine: 7,
        endLine: 36,
      },
    ],
    prompt: 'List the skills you can load, then load the refund-policy skill and follow it.',
    waitAfterPromptMs: 3000,
    knownIssue: {
      area: 'Deep Agents - Intelligence - Skill delivery',
      problem:
        'The adapter the page names for this flavour, `copilotkit-intelligence-langgraph`, is not on ' +
        'PyPI (404 as of 2026-09-16), and neither is the base client the page says Python uses, ' +
        '`copilotkit-intelligence-runtime`, nor the ADK adapter `copilotkit-intelligence-adk`. ' +
        '`uv pip install` resolves to "not found in the package registry". The TypeScript siblings ' +
        '@copilotkit/intelligence-langgraph and -mastra are published at 1.71.2 (2026-09-14), so the ' +
        'gap is Python-side rather than the whole feature being unreleased. The BuiltInAgent row added ' +
        'on 2026-09-21 is the one whose package this repo installs. On runtime 1.71.0 it did not ' +
        'compile: `learnedSkills` was on no BuiltInAgent config (TS2353), no factory context carried it ' +
        '(TS2339), and `BuiltInAgentFactoryContext`, which the page tells you to import, was not an ' +
        'export (TS2724). All three land in 1.73.0 (2026-09-19); resolved here at 1.73.3 (declared ' +
        '^1.73.3), and the page still names no minimum version. BuiltInAgent is not an adapter for the ' +
        'Deep Agent in any case: it replaces it.',
      impact:
        'No row of the adapter table can be followed for this backend: the Python ones cannot be ' +
        'installed, and BuiltInAgent (which now typechecks on 1.73.3) would replace the Deep Agent. ' +
        'Nothing on the page can be followed from a Python backend. The two tools it reserves, ' +
        '`copilotkit_load_skill` and `copilotkit_read_skill_file`, are never registered, so the agent ' +
        'answers from its own instructions and the failure looks like an ordinary reply rather than a ' +
        'missing integration. The page states LangChain >=1.2.16,<2 and LangGraph >=1.1.10,<2 floors ' +
        'for a package that cannot be obtained.',
      likelyCause:
        "The page's own closing section says \"The server migration and v1 delivery endpoint must " +
        'deploy before adapters rely on them\", i.e. the feature may not be live yet -- but that is a ' +
        'deployment note at the bottom, not a prerequisite at the top. Since 2026-09-23 the LangGraph ' +
        'Python and ADK sections do say \"Python adapter pending release\"; the adapter table and the ' +
        'base client `copilotkit-intelligence-runtime` are still unflagged. The same page is also ' +
        'published under /agno (no Agno adapter exists at all) and ' +
        '/ms-agent-python (whose only Microsoft Agent Framework adapter is .NET 9, under a Python ' +
        'section).',
      expectsNoResponse: false,
      note: [
        'learned-skills - no row of the adapter table works here',
        '',
        'BuiltInAgent row (21 sep): learnedSkills wasnt on any config in 1.71.0',
        'TS2353 on the option, TS2339 on the factory arg,',
        'TS2724 on BuiltInAgentFactoryContext which the prose says to import',
        'all three ship in 1.73.0 (19 sep). upgraded to 1.73.3 on 23 sep: compiles now',
        'page still names no version. and every snippet pins revision "exact-revision-id"',
        '',
        'copilotkit-intelligence-langgraph -> 404',
        'copilotkit-intelligence-runtime -> 404 (page says "Python uses" this one)',
        'copilotkit-intelligence-adk -> 404',
        'uv says "not found in the package registry"',
        '',
        'the TS ones are real: @copilotkit/intelligence-langgraph 1.71.2, published 14 Sep',
        'so its the python side thats missing, not the whole feature',
        '',
        'so the two tools never get registered. agent just answers normally,',
        'looks like a normal reply not a missing integration',
        '',
        'same page is also under /agno and /ms-agent-python',
        'agno isnt in the adapter table at all',
        'ms-agent-python only gets a .NET adapter, and that repo is python',
      ].join('\n'),
    },
  },
  {
    id: 'learning',
    name: 'Intelligence - Automatic Learning',
    videoName: 'Learning',
    docPath: 'learning',
    route: 'learning',
    // The page's runtime snippet, verbatim, and the two identifiers it leaves
    // undefined supplied above it.
    ideFile: 'frontend/src/lib/learning-runtime.ts',
    startLine: 36,
    endLine: 69,
    extraTabs: [
      // Where it is mounted: its own route, so the page's code cannot take
      // down the app's main runtime.
      {
        filePath: 'frontend/src/app/api/copilotkit-learning/[[...slug]]/route.ts',
        startLine: 1,
        endLine: 24,
      },
    ],
    prompt: 'Review this expense: $42 team lunch at Cafe Rio, receipt attached. Approve or flag it?',
    // Turn 2 is the control on `sample_agent`, which the selector assigns nowhere.
    prompts: [
      'Review this expense: $42 team lunch at Cafe Rio, receipt attached. Approve or flag it?',
      'Say hello in five words.',
    ],
    waitAfterPromptMs: 3000,
    knownIssue: {
      area: 'Deep Agents - Intelligence - Learning',
      problem:
        "With an Intelligence key, the page's example selector routes `expense-agent` to the container " +
        '`expense-review` (this runtime ships a constant selector instead -- see FINDINGS.md #' +
        '25); where that container does not exist the platform answers ' +
        '`LEARNING_CONTAINER_NOT_FOUND`, the run fails with "Failed to initialize thread", and the chat ' +
        'shows nothing, while `sample_agent` (not assigned) answers. Without a key the snippet fails at ' +
        "module load: the `apiKey: process.env.CPK_INTELLIGENCE_API_KEY!` constructor throws and the " +
        'route answers 500.',
      impact:
        'Copying the example as written silences the agent it is meant to teach, with nothing in the chat ' +
        'to say why -- the troubleshooting table only says the Thread will not appear in the container. ' +
        'The non-null assertion hides the key requirement from the type checker. The snippet also uses ' +
        '`agents` and `identifyUser` without defining them, and `getLearningContainerId` does not exist ' +
        "before runtime 1.70 (this repo's lockfile pinned 1.69.0 until 2026-09-23; now declared ^1.73.3, " +
        'installed 1.73.3), a floor the page never states.',
      likelyCause:
        'The example container has to be created in the dashboard first, and a missing one fails the ' +
        'Thread rather than skipping assignment. The page also assumes the Intelligence Quickstart has ' +
        'provisioned `CPK_INTELLIGENCE_API_KEY`; the `!` turns a missing key into a constructor throw at ' +
        'import time. The dashboard/CLI steps (Run Learning, Skills) are behind a login and not on camera.',
      expectsNoResponse: true,
      note: [
        'learning - page runtime 500s at load, nothing answers',
        '',
        'mounted the snippet verbatim on its own route',
        'no intelligence key here, apiKey: process.env.CPK_INTELLIGENCE_API_KEY! throws at import',
        '/info 500, runtime stuck in error, send button never enables',
        'tried expense-agent and sample_agent, both silent',
        '',
        'also: agents and identifyUser never defined on the page',
        'getLearningContainerId needs runtime 1.70+, page never says so (here: 1.73.3 now)',
      ].join('\n'),
    },
  },
  // -- Added 2026-09-21: two pages new upstream and tracked nowhere until now.
  // Only one of them is filmable; /cookbook/jev-generative-ui deliberately has
  // no entry here, because its decision layer needs a third-party vendor key
  // and every take of it would be a stand-in. See FINDINGS.md.
  {
    id: 'markdown-rendering',
    name: 'Custom Look and Feel - Markdown Rendering',
    videoName: 'MarkdownRendering',
    docPath: 'custom-look-and-feel/markdown',
    route: 'custom-look-and-feel/markdown',
    // The published `components` override, with the `a` override highlighted:
    // that one line carries both of the page's prop warnings -- `node`
    // destructured out, and the rest spread to keep the link hardening.
    ideFile: 'frontend/src/app/custom-look-and-feel/markdown/chat-variants.tsx',
    startLine: 78,
    endLine: 101,
    extraTabs: [
      // The other two techniques, so all three of the page's routes into the
      // slot are in frame: the class string and the replacing component.
      {
        filePath: 'frontend/src/app/custom-look-and-feel/markdown/chat-variants.tsx',
        startLine: 130,
        endLine: 155,
      },
      // The claim the page makes that no reply can show: a custom tag is a
      // compile error, with the page's exact TS2353 quoted above it.
      {
        filePath: 'frontend/src/app/custom-look-and-feel/markdown/custom-tag.tsx',
        startLine: 1,
        endLine: 27,
      },
      // What the probe reads off the rendered HTML, which is the take's evidence.
      {
        filePath: 'frontend/src/app/custom-look-and-feel/markdown/demo-chat/page.tsx',
        startLine: 85,
        endLine: 94,
      },
    ],
    prompt:
      'Reply in markdown. Include an "## Example" heading, a link to https://docs.copilotkit.ai/deepagents, and the literal text <reference-chip id="42">Doc 42</reference-chip>.',
    // Two turns because tab three is a different chat instance: the baseline
    // needs its own reply to have an anchor of its own to compare against.
    prompts: [
      'Reply in markdown. Include an "## Example" heading, a link to https://docs.copilotkit.ai/deepagents, and the literal text <reference-chip id="42">Doc 42</reference-chip>.',
      'Same again please: an "## Example" heading and a link to https://docs.copilotkit.ai/deepagents.',
    ],
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - Custom Look and Feel - Markdown Rendering',
      problem:
        'All three published blocks are a bare `<CopilotChat>` carrying only `messageView`, so they ask ' +
        'for the agent id "default", which a Deep Agents runtime does not register, and the route throws ' +
        '"Agent \'default\' not found after runtime sync" as soon as `/info` answers. None of the three ' +
        'carries `"use client"` either, although each is titled `page.tsx` and passes inline functions ' +
        'to a client component.',
      impact:
        'A Deep Agents reader who copies any block on this page gets a crashed route rather than a ' +
        'restyled message, and the page never names the prop that fixes it. With `agentId` added the ' +
        'rest of the page holds exactly as written -- the override runs, the link hardening survives the ' +
        'spread, `data-streamdown` disappears -- but the headline `components` example styles with ' +
        '`.my-link` and `.my-heading`, which the page never defines, so following it end to end changes ' +
        'nothing a reader can see.',
      likelyCause:
        'The page is written framework-agnostically and assumes an agent registered as "default". The ' +
        'Deep Agents Quickstart names its agent `sample_agent` and puts the id on the provider; none of ' +
        'these blocks has a provider at all. The same assumption already broke Frontend-Driven Cards ' +
        '(FINDINGS.md #22), so this is the second page with it.',
      note: [
        'markdown rendering - published blocks crash the route',
        '',
        'tab 1 = the page block exactly, no agent id',
        "so CopilotChat asks for 'default'. deep agents registers sample_agent, no default",
        '-> Agent \'default\' not found after runtime sync. no chat at all',
        '',
        'tab 2 = same + agentId="sample_agent". everything else on the page is true:',
        'anchor comes out class="my-link" rel="noopener noreferrer" target="_blank", no data-streamdown',
        'node attribute count 0, so "drop node" works',
        'tab 3 (no override) has data-streamdown="link" on the same anchor',
        '',
        'but .my-link / .my-heading are never defined anywhere on the page',
        'so the headline example is a no-op visually, tailwind has no such utility',
        'and no block has "use client", which app router needs for these',
        '',
        'installed react-core 1.71.0, streamdown 1.6.11 (undeclared, transitive)',
      ].join('\n'),
    },
  },
  {
    id: 'threads-lifecycle',
    name: 'Rich Threads - Thread & History Lifecycle',
    videoName: 'ThreadsLifecycle',
    docPath: 'threads-lifecycle',
    route: 'threads/lifecycle',
    // Appended last so no existing clip is renumbered. The page's own
    // ThreadControls first, then the readout that proves each step.
    ideFile: 'frontend/src/app/threads/lifecycle/demo-chat/page.tsx',
    startLine: 79,
    endLine: 121,
    extraTabs: [
      {
        filePath: 'frontend/src/app/threads/lifecycle/demo-chat/page.tsx',
        startLine: 123,
        endLine: 168,
      },
    ],
    // Deliberately about nothing: the take is about the threadId, not the
    // model's reply.
    prompt: 'Say hello in one short sentence.',
    waitAfterPromptMs: 3000,
  },
  {
    // Tracked 2026-09-22 and appended last so no existing clip is renumbered.
    // Registered so coverage and the doctor see it, but in SKIP_RECORDING
    // until the owner turns it on.
    id: 'message-history',
    name: 'Backend - Message History',
    videoName: 'MessageHistory',
    docPath: 'backend/message-history',
    route: 'backend/message-history',
    // The page's HttpAgent block, then the same middleware on the
    // Quickstart's LangGraphAgent (NOT FROM THE PAGE), then the runtime.
    ideFile: 'frontend/src/app/api/copilotkit-trimmed/[[...slug]]/route.ts',
    startLine: 23,
    endLine: 47,
    extraTabs: [
      {
        // The browser recipe, verbatim, over a prop no release declares.
        filePath: 'frontend/src/app/backend/message-history/demo-chat/page.tsx',
        startLine: 86,
        endLine: 96,
      },
    ],
    prompts: ['My name is Sam.', 'What is my name?'],
    prompt: 'My name is Sam.',
    waitAfterPromptMs: 4000,
  },
]);
