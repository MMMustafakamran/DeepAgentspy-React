# Findings — DeepAgentspy-react
Current open doc defects only. A finding is added here only after a human reviews and approves it; page failures in a run are never written here automatically. Resolved or superseded findings are removed (see git history).
Stack: `@copilotkit/react-core`/`runtime`/`a2ui-renderer` 1.73.3, `copilotkit` (PyPI) 0.1.94, `deepagents` 0.7.4, `langgraph-api` 0.12.0, Next 16.3.0, React 19.2.8. No `CPK_INTELLIGENCE_API_KEY`.

## Quickstart and landing page
28. **Landing page and Quickstart give different code for the same file, `app/api/copilotkit/[[...slug]]/route.ts`**: the landing page has no `intelligence`/`identifyUser`, uses unguarded `process.env.X!` and adds `PATCH`/`DELETE`.
29. **`touch app/api/copilotkit/route.ts` contradicts the `[[...slug]]` titles**: a plain route has no `/info`, so from core 1.70.2 it throws on a relative URL. Next rejects having both files.
30. **Two `.env` captions for different directories (agent and frontend), neither labelled**. `COPILOTKIT_LICENSE_TOKEN` is mentioned only to say you won't get one.
21. **Installs `@copilotkit/react-ui`, which is never used** (every import is `react-core/v2`).
20. **Model ids vary across pages**: `openai:gpt-4o`, `gpt-5.4`, `gpt-4`.
14. **Python `compile(checkpointer=MemorySaver())` crashes the server**: a hard `ValueError` at load (langgraph-api 0.12.0) takes all 15 graphs down. JS accepts it.

## A2UI: [fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema), [advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced), [styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling)
1. **Wrong `copilotkit.a2ui` names** (copilotkit 0.1.94): `surface_update`→`update_components`, `data_model_update`→`update_data_model`, `begin_rendering`→`create_surface(id, catalog_id)` (must come first). `render()` has no `action_handlers` parameter.
2. **A2UI buttons can't trigger actions**: there are no `action_handlers`, and `useA2UIActionHandler`, `resolveDeclaredOps` and `defaultActionOrchestrator` are not exported.
4. **Invalid dark-mode CSS**: `.dark .a2ui-surface, @media (…) {}`. An at-rule inside a selector list drops the whole rule.
12. **Schemas and catalog are never shown**: there is no `flight_schema.json`, the "Bring Your Own Catalog" link leaves the Deep Agents docs, and the advanced primitives have to be defined yourself.
19. **Broken anchors on advanced**: `#adding-interactivity-action-handlers`, `./fixed-schema-streaming`.

## [Interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)
3. **`enabled: ({ eventValue })` never fires**: the predicate receives `{ name, value }`. `interrupt()` arrives as `on_interrupt` with `value` serialised as a string, so `event.value.type` is undefined. Still TS2339 ×2 on 1.73.3.

## [Tool rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering)
5. **`useDefaultRenderTool` has no `args`**: the prop is `parameters`.
17. **Says `useRenderToolCall` where `useRenderTool` is meant** (×3).

## Frontend tools, state rendering, shared state, predictive state updates
7. **No page shows how custom state reaches a Deep Agent**: `create_deep_agent` has no `state=`. It needs an `AgentMiddleware` with `state_schema`.
8. **state-rendering never calls `emit_research_progress`**: the call needs a `@tool` (the only place with a `RunnableConfig`). Emitted state is only a prediction and is overwritten when the node returns. A `Command` needs a `ToolMessage` with `tool_call_id`.
9. **The state the agent writes is not the state the UI sees**: needs `CopilotKitMiddleware(expose_state=["language"])` (off by default). Neither shared-state page mentions it.
10. **`setState` replaces instead of merging**: a one-key `setState({ language })` drops `copilotkit` (frontend tools).
11. **`Literal[...] = "english"` is not applied as a default** on a dict-subclass state.
6. **Predictions need `<CopilotKit>`, not `<CopilotKitProvider>`, and no page says so**: the `PredictState` listener is only mounted by `<CopilotKit>`. Without it, it fails silently.
13. **predictive-state-updates manual emission (Python) is incomplete**: no graph, compile step or imports, and `cpk_action_node` is named but never defined. It passes `state["copilotkit"]["actions"]` into `bind_tools` without converting them.
18. **frontend-tools** links to `/langgraph/quickstart`. Steps 4–5 repeat the same text and snippet.

## [State inputs/outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) and workflow-execution
15. **`workflow-execution` serves the state-inputs-outputs page**, byte for byte (only the h1 differs).
16. **Uses deprecated `input=`/`output=`** (warns on LangGraph 1.2.10). The snippet imports nothing, mixes `list`/`List` and never fills `resources`.

## [Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards)
22. **Targets agent `default`, but Deep Agents registers `sample_agent`**: `useAgent()` throws and the route crashes. A card added before connecting is silently dropped. `<DeploymentWatcher />` is never mounted, and its `wss://example.com` URL returns 404.

## [Markdown Rendering](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown)
32. **Targets agent `default`** (as in #22), has no `"use client"`, and `my-link`/`my-heading` are undefined classes. "Drop `node`" triggers `no-unused-vars` ×4, and the custom-tag example gives TS7031. `streamdown` is only a transitive dependency.

## [Jev](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui)
33. **No Deep Agent anywhere**: step 4 replaces the Deep Agents runtime route. 6 of its 10 exact pins are unmet (e.g. zod 3.25.76 vs 4.6.5; `@typesafe-ai/sdk` and `@langchain/openai` absent), 5 dependencies are undeclared, and the 1.73.0 minimum is unexplained. Needs `TYPESAFE_API_KEY`, and `.catch(() => …)` turns every error into "Try again". The optional half pins intelligence-langgraph 1.71.2. `choosePanel` throws on a missing score even when the score doesn't matter.

## [Thread Lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle)
35. **`existingId` is undefined**. "Re-mint on remount" is false under `<CopilotKit>`, which inherits the parent threadId.

## [Message history](https://docs.copilotkit.ai/deepagents/backend/message-history)
37. **`new HttpAgent({ url: AGENT_URL })` has no AG-UI endpoint on Deep Agents** (`RUN_ERROR`). `.use()` on `LangGraphAgent` works. The check script has a TS2339 error. `selfManagedAgents` is only quoted, never shown in use.

## [Memories](https://docs.copilotkit.ai/deepagents/intelligence/memories)
23. **Fails silently without an Intelligence runtime**: no `/memories` request is sent, the list shows as empty instead of unavailable, and `addMemory` says "Runtime URL is not configured". `/memories/*` returns 404 without `memory: { access }`, which the page never mentions. The agent still claims it saved.

## [Learning](https://docs.copilotkit.ai/deepagents/learning) and Automatic Learning
24. **The runtime throws at load without a key** (`apiKey is required`; the `!` hides it, and the key isn't listed as a prerequisite), so `/info` returns 500. Uses undefined `agents` and `identifyUser`. `getLearningContainerId` needs ≥1.70.
27. **Delivery steps point to an adapter you can't install**: for Python that's LangGraph Python, which is 404 on PyPI, so the env block configures nothing.
39. **Automatic Learning recommends LangGraph Python** (404 on PyPI) with no warning.

## [Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills)
38. **`revision: "exact-revision-id"` is still live in all 8 examples**, though the page says to remove it. `copilotkit-intelligence-runtime` (and `-langgraph`, `-adk`) is 404 on PyPI and not flagged. The reuse block sets `apiUrl` without `wsUrl`, which breaks the "set both, or set neither" rule. `intelligence-mastra`/`-langgraph` 1.71.2 hard-pin runtime 1.71.2, so with 1.73.3 installed you get a nested copy and TS2322 `#private`. `npx tsx agent.mts` doesn't load `.env`. The Mastra example prints nothing. Placeholders are inconsistent.

## [Plans](https://docs.copilotkit.ai/deepagents/intelligence/plans)
40. **Says the free Developer plan includes User Memory**, but the API returns `403 MEMORY_NOT_ENTITLED`.

## Intelligence connect-your-runtime
41. **`/intelligence/connect-your-runtime` returns 404 with no redirect**. Five pages link to its replacement, `/intelligence/quickstart`.
