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
 * This repo is not only documenting an integration that works. Seven of the
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
  // ── Getting Started ──────────────────────────────────────────────────────
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
    prompt: "What's the weather in Karachi?",
    waitAfterPromptMs: 4000,
  },

  // ── Generative UI ────────────────────────────────────────────────────────
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
    prompt: "What's the weather in Tokyo?",
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
    prompt: 'Research renewable energy storage and show me your progress.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'interrupt-based',
    name: 'Generative UI - Your Components - Interrupt-based',
    videoName: 'InterruptBased',
    docPath: 'generative-ui/your-components/interrupt-based',
    route: 'generative-ui/your-components/interrupt-based',
    ideFile:
      'frontend/src/app/generative-ui/your-components/interrupt-based/demo-chat/page.tsx',
    startLine: 12,
    endLine: 39,
    // The `agents` region, because `_SYSTEM_PROMPT` is where the defect lives:
    // the hook stores the name in `agent_name` and the prompt never reads it.
    extraTabs: [{ filePath: 'backend/src/interrupt_based.py', startLine: 64, endLine: 100 }],
    prompt: 'Hello, can you help me with something?',
    prompts: ['Hello, can you help me with something?', 'What should I call you?'],
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - Generative UI - Your components - Interrupt-based',
      problem:
        'The interrupt renders and accepts a name, but the agent does not use it afterwards -- ' +
        'it keeps calling itself "Deep Agent" instead of the name that was entered.',
      impact:
        'The interrupt flow looks like it works while the value the user supplied is never used, ' +
        'so any HITL step built on this pattern silently discards its input.',
      likelyCause:
        'The system prompt does not read the stored state value holding the name, so the model ' +
        'falls back to its default identity even though `agent_name` was written.',
      note: [
        'interrupt based - name is not used',
        '',
        'gave it the name Fiqros in the interrupt box then asked what its called',
        'says Deep Agent',
        '',
        'so whatever the user types into the interrupt never reaches the prompt',
        'anything built on this loses the answer',
      ].join('\n'),
    },
  },
  {
    id: 'a2ui-fixed-schema',
    name: 'Generative UI - A2UI - Fixed Schema',
    videoName: 'A2uiFixedSchema',
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
        startLine: 29,
        endLine: 40,
      },
      { filePath: 'backend/src/a2ui_fixed.py', startLine: 88, endLine: 104 },
    ],
    prompt: 'Find me flights from New York to London on March 15.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area: 'Deep Agents - Generative UI - A2UI - Fixed Schema',
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
    id: 'a2ui-dynamic-schema',
    name: 'Generative UI - A2UI - Dynamic Schema',
    videoName: 'A2uiDynamicSchema',
    docPath: 'generative-ui/a2ui/dynamic-schema',
    route: 'generative-ui/a2ui/dynamic-schema',
    ideFile: 'frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx',
    startLine: 20,
    endLine: 34,
    extraTabs: [{ filePath: 'backend/src/a2ui_dynamic.py', startLine: 17, endLine: 34 }],
    prompt: 'Show me a pricing card for a Pro plan at $29 per month.',
    waitAfterPromptMs: 6000,
  },
  {
    id: 'a2ui-styling',
    name: 'Generative UI - A2UI - Styling',
    videoName: 'A2uiStyling',
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
    prompt: 'Show me a pricing card for a Pro plan at $29 per month.',
    waitAfterPromptMs: 6000,
    // NO knownIssue, deliberately. The QA report marks this page failed but
    // records no symptom, no cause and no Loom -- there is nothing here to
    // reproduce or to write into a report. Recorded as an ordinary page until
    // it is re-tested and the symptom is known; a `knownIssue` invented to
    // match a red cell would be a fabricated finding.
  },
  {
    id: 'a2ui-advanced',
    name: 'Generative UI - A2UI - Advanced',
    videoName: 'A2uiAdvanced',
    docPath: 'generative-ui/a2ui/advanced',
    route: 'generative-ui/a2ui/advanced',
    ideFile: 'frontend/src/app/generative-ui/a2ui/advanced/demo-chat/page.tsx',
    startLine: 12,
    endLine: 26,
    prompt: 'Show me a pricing card for a Pro plan at $29 per month.',
    waitAfterPromptMs: 6000,
  },

  // ── App Control ──────────────────────────────────────────────────────────
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
    prompt: 'Say hello to Fiqros.',
    waitAfterPromptMs: 3500,
  },

  // ── Shared State ─────────────────────────────────────────────────────────
  {
    id: 'in-app-agent-read',
    name: 'Shared State - Reading agent state',
    videoName: 'SharedStateRead',
    docPath: 'shared-state/in-app-agent-read',
    route: 'shared-state/in-app-agent-read',
    ideFile: 'frontend/src/app/shared-state/in-app-agent-read/demo-chat/page.tsx',
    startLine: 10,
    endLine: 39,
    extraTabs: [{ filePath: 'backend/src/shared_state.py', startLine: 33, endLine: 66 }],
    prompt: 'Set the language to Spanish.',
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - App control - Shared state - Reading agent state',
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
    name: 'Shared State - Writing agent state',
    videoName: 'SharedStateWrite',
    docPath: 'shared-state/in-app-agent-write',
    route: 'shared-state/in-app-agent-write',
    ideFile: 'frontend/src/app/shared-state/in-app-agent-write/demo-chat/page.tsx',
    startLine: 10,
    endLine: 55,
    extraTabs: [{ filePath: 'backend/src/shared_state.py', startLine: 33, endLine: 66 }],
    prompt: 'Tell me one interesting fact about Karachi.',
    waitAfterPromptMs: 4000,
    knownIssue: {
      area: 'Deep Agents - App control - Shared state - Writing agent state',
      problem:
        'The toggle button does not change the language the agent answers in. The label flips ' +
        'to Spanish and the chat carries on replying in English.',
      impact:
        'UI elements cannot drive the agent, so nothing in the app can change how the agent ' +
        'behaves without the user typing it into the chat.',
      likelyCause:
        'The written state never reaches the model. `CopilotKitMiddleware` is what puts state ' +
        'keys into the system message and it does not do so unless `expose_state=[...]` names ' +
        'them -- which neither shared-state page mentions.',
      note: [
        'writing agent state - toggle does nothing',
        '',
        'hit toggle language then sent a message',
        'label says spanish and the agent keeps replying in english',
        '',
        'the write lands on the frontend fine - raw state shows it',
        'it just never reaches the model. expose_state isnt set and neither page mentions it',
      ].join('\n'),
    },
  },
  {
    id: 'predictive-prebuilt',
    name: 'Shared State - Predictive State Updates - Prebuilt agent',
    videoName: 'PredictivePrebuilt',
    docPath: 'shared-state/predictive-state-updates?agent-type=prebuilt',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'frontend/src/app/shared-state/predictive-state-updates/demo-chat/page.tsx',
    startLine: 32,
    endLine: 81,
    extraTabs: [{ filePath: 'backend/src/predictive_state.py', startLine: 31, endLine: 61 }],
    prompt: 'Plan a three-step research task about solar panel recycling and report each step.',
    waitAfterPromptMs: 5000,
    knownIssue: {
      area: 'Deep Agents - App control - Shared state - State streaming - Prebuilt agent',
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
        'same prompt on the custom graph tab and the steps show up straight away',
        'so its the prebuilt middleware not the prompt',
      ].join('\n'),
    },
  },
  {
    id: 'predictive-manual',
    name: 'Shared State - Predictive State Updates - Custom graph (manual)',
    videoName: 'PredictiveManual',
    docPath: 'shared-state/predictive-state-updates?agent-type=custom-graph',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'backend/src/predictive_state_manual.py',
    startLine: 39,
    endLine: 64,
    extraTabs: [
      { filePath: 'backend/src/predictive_state_manual.py', startLine: 67, endLine: 77 },
    ],
    prompt: 'Plan a three-step research task about solar panel recycling and report each step.',
    waitAfterPromptMs: 5000,
  },
  {
    id: 'predictive-tool',
    name: 'Shared State - Predictive State Updates - Custom graph (tool-based)',
    videoName: 'PredictiveToolBased',
    docPath: 'shared-state/predictive-state-updates?agent-type=custom-graph',
    route: 'shared-state/predictive-state-updates',
    ideFile: 'backend/src/predictive_state_tool.py',
    startLine: 37,
    endLine: 91,
    extraTabs: [
      { filePath: 'backend/src/predictive_state_tool.py', startLine: 94, endLine: 104 },
    ],
    prompt: 'Plan a three-step research task about solar panel recycling and report each step.',
    waitAfterPromptMs: 5000,
  },
  {
    id: 'state-inputs-outputs',
    name: 'Shared State - Input/Output Schemas',
    videoName: 'StateInputsOutputs',
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
    prompt: 'Why is the sky blue?',
    waitAfterPromptMs: 4000,
  },
]);
