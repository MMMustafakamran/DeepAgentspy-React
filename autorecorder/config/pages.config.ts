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
    id: 'intelligence-quickstart',
    name: 'Intelligence - Connect Intelligence in 5 minutes',
    videoName: 'IntelligenceQuickstart',
    docPath: 'intelligence/quickstart',
    route: 'intelligence/quickstart',
    // The doc's step 3: a plain `route.ts` with `mode: "single-route"` and one
    // verb, where the page used to publish `[[...slug]]` and four.
    ideFile: 'frontend/src/app/api/copilotkit-single/route.ts',
    startLine: 1,
    endLine: 37,
    extraTabs: [
      // Step 4: the matching provider flag.
      {
        filePath: 'frontend/src/components/single-endpoint-provider.tsx',
        startLine: 26,
        endLine: 39,
      },
    ],
    prompt: 'Tell me a one-line joke.',
    // The only page in this suite whose runtime route is never touched by any
    // other take, so its first request is also the first time `next dev`
    // compiles `/api/copilotkit-single`. On a cold CI runner that lands past
    // the 30s default and the take fails with the agent apparently silent.
    // `core/timeouts.ts` says the defaults suit a warm dev server and that a
    // legitimately slow page should say so here; this is that page.
    timeouts: { replyStartMs: 90_000 },
    waitAfterPromptMs: 4000,
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
    name: 'Intelligence - Memories & Recall',
    videoName: 'Memories',
    docPath: 'intelligence/memories',
    route: 'intelligence/memories',
    // The page's React component, verbatim -- with the two compiler errors its
    // import produces acknowledged in place.
    ideFile: 'frontend/src/app/intelligence/memories/memory-list.tsx',
    startLine: 22,
    endLine: 45,
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
      area: 'Deep Agents - Intelligence - Memories & Recall',
      problem:
        'The React snippet does not compile: it imports `useMemories` from `@copilotkit/react-core`, ' +
        'which has no such export (TS2305, plus a knock-on TS7006). With the import moved to `/v2`, on ' +
        'the Deep Agents Quickstart runtime the hook reports `isAvailable: true` over an empty list, no ' +
        'memory request ever leaves the browser, and saving fails with "Runtime URL is not configured". ' +
        'The agent, asked to remember something, says it will.',
      impact:
        'Memory cannot be used from React as documented, and the failure does not look like one: the ' +
        "page's component shows an empty list rather than \"Memory is not available\", and the save " +
        "error names a runtime URL that is in fact configured.",
      likelyCause:
        'The client memory store only gets a context when `/info` advertises an Intelligence socket, ' +
        'so on a non-Intelligence runtime it never fetches and never flips `isAvailable`. Even on an ' +
        'Intelligence runtime every `/memories/*` route 404s unless `CopilotRuntime` is built with ' +
        '`memory: { access }` (or the deprecated `exposeMemoryRoutes`), which the page never mentions ' +
        '-- present on both 1.69.0 and 1.71.0. With that option and an Intelligence key the platform ' +
        'answers for itself (see the take\'s note); without a key that mount answers 503.',
      note: [
        'memories - react snippet doesnt compile, and memory never actually runs',
        '',
        'useMemories isnt exported from @copilotkit/react-core, only /v2',
        'moved the import to /v2 so the demo loads at all',
        '',
        'on the quickstart runtime the list is just empty, isAvailable says true',
        'save fails with "runtime url is not configured" - it is configured',
        'no /memories request ever leaves the browser. agent says it will remember anyway',
        '',
        'the memory.access option the page never mentions needs an intelligence key',
        'dont have one here so that mount is 503',
      ].join('\n'),
    },
  },
  {
    id: 'learning',
    name: 'Intelligence - Learning',
    videoName: 'Learning',
    docPath: 'learning',
    route: 'learning',
    // The page's runtime snippet, verbatim, and the two identifiers it leaves
    // undefined supplied above it.
    ideFile: 'frontend/src/lib/learning-runtime.ts',
    startLine: 36,
    endLine: 68,
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
        '`expense-review`; where that container does not exist the platform answers ' +
        '`LEARNING_CONTAINER_NOT_FOUND`, the run fails with "Failed to initialize thread", and the chat ' +
        'shows nothing, while `sample_agent` (not assigned) answers. Without a key the snippet fails at ' +
        "module load: the `apiKey: process.env.CPK_INTELLIGENCE_API_KEY!` constructor throws and the " +
        'route answers 500.',
      impact:
        'Copying the example as written silences the agent it is meant to teach, with nothing in the chat ' +
        'to say why -- the troubleshooting table only says the Thread will not appear in the container. ' +
        'The non-null assertion hides the key requirement from the type checker. The snippet also uses ' +
        '`agents` and `identifyUser` without defining them, and `getLearningContainerId` does not exist ' +
        "before runtime 1.70 (this repo's lockfile pins 1.69.0), a floor the page never states.",
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
        'getLearningContainerId needs runtime 1.70+, lockfile here is 1.69.0',
      ].join('\n'),
    },
  },
]);
