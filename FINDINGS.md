# Findings — DeepAgentspy-react
Open doc defects only. An entry is added only after the user approves it. Numbers are stable IDs (code cites `FINDINGS.md #N`), so gaps are removed findings.
Stack: `@copilotkit/react-core`/`runtime`/`a2ui-renderer` 1.73.3, `@ag-ui/langgraph` 0.0.43, `copilotkit` (PyPI) 0.1.96, `deepagents` 0.7.4, `langgraph-api` 0.14.4, Next 16.3.0. No `CPK_INTELLIGENCE_API_KEY`.

## Dev blockers (seen with `npm run dev` and normal use of the page)

### [Interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)
**#3 Typed interrupt dispatch never shows a card, and the run hangs.**
- **Doc:** `useInterrupt({ enabled: ({ eventValue }) => eventValue.type === 'ask', render: … event.value.content })`, plus a second hook for `'approval'`.
- **Error:** the console logs `[CopilotKit] useInterrupt enabled predicate threw; treating interrupt as disabled`, no card appears, and the agent stays paused. The predicate receives `{ name, value }`, not `eventValue`. `@ag-ui/langgraph` also sends `value` as a JSON string, so `event.value.type` would be undefined too. In `tsc` it's `TS2339: Property 'eventValue' does not exist on type 'InterruptEvent<any>'` ×2.
- **Harness:** the verbatim code is on the "Two, dispatched by type" tab, which the recorder never opens.

### [Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards)
**#22 The page throws: agent `default` not found.**
- **Doc:** `<CopilotKit runtimeUrl="/api/copilotkit" renderActivityMessages={[eventCardRenderer]}><CopilotChat /></CopilotKit>` and `const { agent } = useAgent();`, with no agent id.
- **Error:** `useAgent: Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit). Known agents: [sample_agent, …]`. Deep Agents registers its graphs by name and has no `default`. Also: `<DeploymentWatcher />` is never mounted, and a card added before the agent connects is dropped.

### [Reading](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read) / [Writing agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write)
**#9 Language toggle doesn't change the chat language; replies stay in English.** (Includes #7, #10 and #11.)
- **Doc:** `class AgentState(CopilotKitState): language: Literal["english","spanish"] = "english"` is the only backend code. `agent.setState({ language: … })` follows, and the page promises "You'll see the language change".
- **Cause:** three breaks:
  1. `AgentState` is never passed to `create_deep_agent`, so `@ag-ui/langgraph` strips `language` from the run input (#7).
  2. `CopilotKitMiddleware` defaults to `expose_state=False` (`copilotkit_lg_middleware.py:260`), so the model never sees the state.
  3. `setState` replaces the whole state: it drops `copilotkit` (#10), and the next snapshot removes `language`. The `Literal` default is never applied (#11).
- **Correct setup (for reference):** a middleware with `state_schema`, plus `expose_state=["language"]`, plus `setState({ ...agent.state, language })`.

## Minor notes
- #29 Quickstart: `touch app/api/copilotkit/route.ts`, but the code blocks are titled `[[...slug]]/route.ts`. A plain route has no `/info`. Not reproduced at runtime.
- #6 Predictive state: needs `<CopilotKit>`, not `<CopilotKitProvider>`, and the page doesn't say so. Fails silently.
- #13 Predictive state (Python): the manual emission fragment is incomplete, and `cpk_action_node` is undefined.
- #12 A2UI fixed-schema: `flight_schema.json` contents aren't shown (you author it in A2UI Composer).
- #15 `workflow-execution` serves the same page as state-inputs-outputs.
- #23 Memories: silently empty without an Intelligence runtime.
- #24 Learning: the runtime throws "`apiKey` is required" without a key. The key is now a listed prerequisite. `agents` and `identifyUser` are placeholders.
- #27/#39 Learning: recommends LangGraph Python, whose package returns 404 on PyPI. Flagged only on learned-skills:145.
- #38 Skill delivery: `-runtime`/`-langgraph` return 404 on PyPI (disclosed), and `revision: "exact-revision-id"` is in every example.
- #33 Jev: all pins now exist on npm, but it needs `TYPESAFE_API_KEY` and has no Deep Agent.
- #35 Threads Lifecycle: `existingId` is undefined (a placeholder).
- #37 Message history: generic `HttpAgent({ url: AGENT_URL })` snippet.
- #40 Plans: says Developer includes User Memory. Not re-tested (needs a key).
- #41 `/intelligence/connect-your-runtime` returns 404 with no redirect.
- #28 Landing and Quickstart use different code for the same `route.ts`.
- #30 Quickstart: two unlabelled `.env` captions.
- #21 Quickstart installs the unused `@copilotkit/react-ui`.
- #20 Model ids vary across pages.
- #17 Tool rendering says `useRenderToolCall` where it means `useRenderTool` (×2).
- #18 Frontend tools links to `/langgraph/quickstart`.
- #16 State I/O: deprecated `input=`/`output=`, and the snippet has no imports.
- #32 Markdown: `my-link`/`my-heading` classes are undefined, and `node` is unused.

## Build-only (`tsc` / `next build`; `npm run dev` runs fine)
- **#5 [Tool rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering):** `useDefaultRenderTool({ render: ({ name, args, status, result }) => … })` fails with `TS2339: Property 'args' does not exist on type 'DefaultRenderProps'`. The prop is `parameters`, and in dev `args` is just undefined.
- **#4 [A2UI Styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling):** `.dark .a2ui-surface,` followed by `@media (prefers-color-scheme: dark) { … }` makes `next build` fail with `Turbopack build failed … Parsing CSS source code failed … Invalid empty selector`. You can't put an at-rule in a selector list. `npm run dev` probably shows the same overlay (same parser), but that's untested.
- **#3** (TS side): `TS2339` on `eventValue` ×2. The runtime effect is listed under Dev blockers.
