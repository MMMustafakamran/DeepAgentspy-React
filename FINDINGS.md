# Findings — DeepAgentspy-react
Current open doc defects only. A finding is added here only after a human reviews and approves it; page failures in a run are never written here automatically. Resolved or superseded findings are removed (see git history).
Stack: `@copilotkit/react-core`/`runtime`/`a2ui-renderer` 1.73.3, `copilotkit` (PyPI) 0.1.94, `deepagents` 0.7.4, `langgraph-api` 0.12.0, Next 16.3.0, React 19.2.8. No `CPK_INTELLIGENCE_API_KEY`.
Major = blocks a reader (doesn't compile, crashes/throws, silently broken behaviour, step impossible to follow, missing required step/package, 404 target). Minor = one-line notes.

## Major

### Quickstart
29. **`touch app/api/copilotkit/route.ts` contradicts the `[[...slug]]` titles**: a plain route has no `/info`, so from core 1.70.2 it throws on a relative URL. Next rejects having both files.
14. **Python `compile(checkpointer=MemorySaver())` crashes the server**: hard `ValueError` at load (langgraph-api 0.12.0) takes all 15 graphs down. JS accepts it.

### A2UI: [fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema), [advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced), [styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling)
1. **Wrong `copilotkit.a2ui` names** (0.1.94): `surface_update`→`update_components`, `data_model_update`→`update_data_model`, `begin_rendering`→`create_surface(id, catalog_id)` (must come first). `render()` has no `action_handlers`.
2. **A2UI buttons can't trigger actions**: no `action_handlers`; `useA2UIActionHandler`, `resolveDeclaredOps`, `defaultActionOrchestrator` not exported.
4. **Invalid dark-mode CSS**: `.dark .a2ui-surface, @media (…) {}` — an at-rule in a selector list drops the whole rule.
12. **Schemas and catalog never shown**: no `flight_schema.json`, "Bring Your Own Catalog" leaves Deep Agents docs, advanced primitives must be self-defined.

### [Interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)
3. **`enabled: ({ eventValue })` never fires**: predicate receives `{ name, value }`; `interrupt()` arrives as `on_interrupt` with `value` as a string, so `event.value.type` is undefined. TS2339 ×2 on 1.73.3.

### [Tool rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering)
5. **`useDefaultRenderTool` has no `args`**: the prop is `parameters`.

### Frontend tools, state rendering, shared state, predictive state updates
7. **No page shows how custom state reaches a Deep Agent**: `create_deep_agent` has no `state=`; needs `AgentMiddleware` with `state_schema`.
8. **state-rendering never calls `emit_research_progress`**: needs a `@tool` (only place with `RunnableConfig`); emitted state is overwritten when the node returns; a `Command` needs a `ToolMessage` with `tool_call_id`.
9. **Agent-written state not what the UI sees**: needs `CopilotKitMiddleware(expose_state=["language"])` (off by default); neither shared-state page mentions it.
10. **`setState` replaces instead of merging**: one-key `setState({ language })` drops `copilotkit` (frontend tools).
11. **`Literal[...] = "english"` not applied as a default** on a dict-subclass state.
6. **Predictions need `<CopilotKit>`, not `<CopilotKitProvider>`, unstated**: `PredictState` listener only mounted by `<CopilotKit>`; otherwise fails silently.
13. **predictive-state-updates manual emission (Python) incomplete**: no graph/compile/imports, `cpk_action_node` undefined, `state["copilotkit"]["actions"]` passed to `bind_tools` unconverted.

### [State inputs/outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) and workflow-execution
15. **`workflow-execution` serves the state-inputs-outputs page** byte for byte (only h1 differs).

### [Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards)
22. **Targets agent `default`, but Deep Agents registers `sample_agent`**: `useAgent()` throws and the route crashes. Card added before connecting silently dropped; `<DeploymentWatcher />` never mounted; its `wss://example.com` URL 404s.

### [Markdown Rendering](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown)
32. **Targets agent `default`** (as #22), no `"use client"`; custom-tag example gives TS7031. (Minor bits in notes.)

### [Jev](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui)
33. **No Deep Agent anywhere**: step 4 replaces the Deep Agents runtime route. 6 of 10 exact pins unmet (zod 3.25.76 vs 4.6.5; `@typesafe-ai/sdk`, `@langchain/openai` absent), 5 deps undeclared; needs `TYPESAFE_API_KEY`; `.catch(() => …)` masks every error as "Try again"; `choosePanel` throws on a missing score.

### [Thread Lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle)
35. **`existingId` is undefined**; "re-mint on remount" is false under `<CopilotKit>` (inherits parent threadId).

### [Message history](https://docs.copilotkit.ai/deepagents/backend/message-history)
37. **`new HttpAgent({ url: AGENT_URL })` has no AG-UI endpoint on Deep Agents** (`RUN_ERROR`); `.use()` on `LangGraphAgent` works. Check script has TS2339.

### [Memories](https://docs.copilotkit.ai/deepagents/intelligence/memories)
23. **Fails silently without an Intelligence runtime**: no `/memories` request, list shows empty, `addMemory` says "Runtime URL is not configured"; `/memories/*` 404s without `memory: { access }` (unmentioned); agent still claims it saved.

### [Learning](https://docs.copilotkit.ai/deepagents/learning) and Automatic Learning
24. **Runtime throws at load without a key** (`apiKey is required`, hidden by `!`, key not a listed prerequisite) so `/info` 500s. Uses undefined `agents` and `identifyUser`; `getLearningContainerId` needs ≥1.70.
27. **Delivery steps point to an uninstallable adapter**: LangGraph Python is 404 on PyPI, so the env block configures nothing.
39. **Automatic Learning recommends LangGraph Python** (404 on PyPI) with no warning.

### [Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills)
38. **Broken examples and unpublished packages**: `revision: "exact-revision-id"` live in all 8 examples; `copilotkit-intelligence-runtime` (and `-langgraph`, `-adk`) 404 on PyPI; `intelligence-mastra`/`-langgraph` 1.71.2 hard-pin runtime 1.71.2 → nested copy + TS2322 `#private` with 1.73.3; reuse block sets `apiUrl` without `wsUrl`; `npx tsx agent.mts` doesn't load `.env`. (Minor bits in notes.)

### [Plans](https://docs.copilotkit.ai/deepagents/intelligence/plans)
40. **Says free Developer plan includes User Memory**, but the API returns `403 MEMORY_NOT_ENTITLED`.

### Intelligence connect-your-runtime
41. **`/intelligence/connect-your-runtime` returns 404 with no redirect**; five pages link to its replacement `/intelligence/quickstart`.

## Minor notes
- #28 Landing/Quickstart: different code for `app/api/copilotkit/[[...slug]]/route.ts` (landing lacks `intelligence`/`identifyUser`, unguarded `process.env.X!`, adds `PATCH`/`DELETE`).
- #30 Quickstart: two unlabelled `.env` captions (agent vs frontend); `COPILOTKIT_LICENSE_TOKEN` mentioned only to say you won't get one.
- #21 Quickstart: installs unused `@copilotkit/react-ui` (all imports are `react-core/v2`).
- #20 Multiple pages: model ids vary (`openai:gpt-4o`, `gpt-5.4`, `gpt-4`).
- #19 [A2UI advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced): broken anchors `#adding-interactivity-action-handlers`, `./fixed-schema-streaming`.
- #17 [Tool rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering): says `useRenderToolCall` where `useRenderTool` is meant (×3).
- #18 frontend-tools: links to `/langgraph/quickstart`; steps 4–5 repeat the same text and snippet.
- #16 [State inputs/outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs): deprecated `input=`/`output=` (warns on LangGraph 1.2.10); snippet imports nothing, mixes `list`/`List`, never fills `resources`.
- #32 [Markdown](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown): `my-link`/`my-heading` undefined classes; "Drop `node`" triggers `no-unused-vars` ×4; `streamdown` only a transitive dep.
- #33 [Jev](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui): 1.73.0 minimum unexplained; optional half pins intelligence-langgraph 1.71.2.
- #37 [Message history](https://docs.copilotkit.ai/deepagents/backend/message-history): `selfManagedAgents` only quoted, never shown in use.
- #38 [Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills): Mastra example prints nothing; placeholders inconsistent.
