# Findings — DeepAgentspy-React (Deep Agents, Python agent + React)
Open doc defects only, approved by the owner 2026-11-09 (QA-RULES section 6). Numbers are stable IDs (code cites `FINDINGS.md #N`); numbers from the retired harness are kept where the defect is the same, so gaps are removed findings.
Stack: `@copilotkit/react-core`/`runtime` 1.85.0 (declared `^1.85.0`), `@ag-ui/client` 1.0.2 (doc pins 1.0.2), `@ag-ui/mcp-apps-middleware` 0.1.3, `@tanstack/ai` 1.2.0, `maplibre-gl` 5.24.0 (harness-installed), `next` 16.4.5, `react` 19.3.0; Python 3.13 via uv: `copilotkit` 0.1.96, `deepagents` 0.7.34, `langchain-openai` 1.7.4, `langgraph` 1.2.20, `ag-ui-langgraph` 0.0.47, `langgraph-api` 0.17.1 / `langgraph-cli` 0.4.42 (started by `npx @langchain/langgraph-cli` 1.7.0); Node 26.7.0, npm 12.0.2, Windows 11 Pro. Model `gpt-6-luna`, Intelligence on (`CPK_INTELLIGENCE_API_KEY`). Docs: https://docs.copilotkit.ai/deepagents (live pages, 2026-11-08/09).

## Dev blockers (seen with `npm run dev` and normal use of the page)

### Pages marked "Not available for Langchain DeepAgents yet"
**#57 17 sidebar pages say the feature is not available for Deep Agents.**
- **Doc:** the banner "Not available for Langchain DeepAgents yet. This feature (…) hasn't been tagged …" on CopilotChat, CopilotSidebar, CopilotPopup, CSS Customization, Slots, Headless UI, Reasoning Messages, Voice, Reasoning, Components as Tools, JSON Render, Hashbrown, Open Generative UI, HITL Overview, Pausing the Agent for Input, Headless Interrupts, Sub-agents.
- **Result:** listed in the Deep Agents sidebar, but not usable with Deep Agents. Doc-only (not implemented).

### [Threads Drawer](https://docs.copilotkit.ai/deepagents/prebuilt-components/copilot-threads-drawer)
**#45 The page crashes: agent `default` not found.**
- **Doc:** `<CopilotKitProvider runtimeUrl="/api/copilotkit">` (no `agentId`) around `<CopilotThreadsDrawer />` and `<CopilotChat />`; no `"use client"`.
- **Error:** `useAgent: Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit). Known agents: [sample_agent]`. The Quickstart registers only `sample_agent`.
- **Confirmed by harness:** with `agentId="sample_agent"` the drawer lists the threads and the chat answers.

### [Components and surfaces](https://docs.copilotkit.ai/deepagents/generative-ui/components)
**#49 The page doesn't compile without `maplibre-gl`, and the "Try it" agent fails with "chat() needs a threadId".**
- **Doc:** step 1 `npm install @copilotkit/react-core @copilotkit/runtime @tanstack/ai @tanstack/ai-openai`; step 3 `import { standardUI } from "@copilotkit/react-core/v2/generative-ui"`; step 2 a TanStack `BuiltInAgent` (not a Deep Agent).
- **Error:** `Module not found: Can't resolve 'maplibre-gl'` (page 500). With it installed, the step 2 agent fails every run: `chat() needs a threadId. Pass a non-empty string, for example the id of the conversation.`
- **Confirmed by harness:** with `maplibre-gl` installed and "step 3 only" on the Quickstart Deep Agent (plus `agentId`), a standard Table component renders.

### [Dynamic Schema A2UI](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema) · [A2UI Advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced)
**#46 Every run fails inside `generate_a2ui`: "is bound to a different event loop".**
- **Doc:** `graph = create_deep_agent(model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"), tools=[], middleware=[CopilotKitMiddleware()], …)` and a runtime with `a2ui: { injectA2UITool: true }`. The frontend step uses `myCatalog`, which is never defined.
- **Error:** no UI and no reply; `RuntimeError: <asyncio.locks.Event object at 0x… [unset]> is bound to a different event loop` (from `ag_ui_langgraph/a2ui_tool.py` `_invoke_subagent` → `ChatOpenAI`), 3 of 3 runs. A2UI Advanced builds on this setup and fails the same way before its progress renderer shows.

### [Fixed Schema A2UI](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema)
**#12 The schema file is never shown, and the agent registration is placeholders.**
- **Doc:** "Save it as a JSON file: `apps/agent/src/a2ui/schemas/flight_schema.json`" (contents not shown; "design it in A2UI Composer"); `create_deep_agent(tools=[search_flights, ...], ...)` with no model.
- **Result:** the reader has to write the schema and pick a model. With a hand-written schema the surface renders `Unknown component: Title / Airport / Arrow / AirlineBadge / PriceTag` around a "Book flight" button.

### [MCP Apps](https://docs.copilotkit.ai/deepagents/generative-ui/mcp-apps)
**#47 The Excalidraw server URL redirects, so no MCP App ever loads.**
- **Doc:** `mcpServers: [{ type: "http", url: "https://mcp.excalidraw.com", serverId: "excalidraw" }]`.
- **Error:** `https://mcp.excalidraw.com` answers `308 → /mcp`; the runtime logs `MCP tool discovery failed { serverId: 'excalidraw' } [TypeError: fetch failed] { [cause]: Error: unexpected redirect }`. The agent has no Excalidraw tools and fakes it ("Created the Excalidraw flowchart … [blocked]").
- **Confirmed by harness:** with `https://mcp.excalidraw.com/mcp` the Excalidraw diagram renders in the chat.

### [Reading agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read) / [Writing agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write)
**#9 The language state never reaches the agent; the toggle doesn't change the reply language.**
- **Doc:** `class AgentState(CopilotKitState): language: Literal["english", "spanish"] = "english"` is the only backend code; the frontend reads `agent.state.language` and calls `agent.setState({ language: … })`; "You'll see the language change".
- **Result:** "Language: english" shows only through the `?? "english"` fallback. After the toggle the label says spanish, the reply stays English ("The Moon is moving about 3.8 centimeters farther from Earth each year."), and the label goes back to english after the run. `AgentState` is never passed to `create_deep_agent`.

### [State streaming](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates) (Prebuilt agent)
**#43 "Agent Progress" never shows a step.**
- **Doc:** `class AgentState(CopilotKitState): observed_steps: list[str]` and `create_deep_agent(…, middleware=[CopilotKitMiddleware(), StateStreamingMiddleware(StateItem(state_key="observed_steps", tool="step_progress_tool", tool_argument="steps"))])`.
- **Result:** the agent calls `step_progress_tool` and answers, but the Agent Progress list stays empty. `AgentState` is never given to the agent (same gap as #9).

### [State streaming](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates) (Custom graph, Manual)
**#13 The Python snippet is a fragment that can't run.**
- **Doc:** `async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["cpk_action_node", "tool_node", "__end__"]]:` with `# ...` before and after the emit loop; no imports, no model call, no graph.
- **Error:** `NameError: name 'RunnableConfig' is not defined`; with imports, `langgraph dev` refuses the graph: `Found edge ending at unknown node 'cpk_action_node'`.
- **Confirmed by harness:** with imports, a model call and a START → chat_node → END graph, the four steps show and the agent answers.

### [State streaming](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates) (Custom graph, Tool-based)
**#48 The published graph stops the whole `langgraph dev` server.**
- **Doc:** `graph = workflow.compile(checkpointer=MemorySaver())`.
- **Error:** `GraphLoadError: Failed to load graph … includes a custom checkpointer (type <class 'langgraph.checkpoint.memory.InMemorySaver'>) … please remove the custom checkpointer`, then `Application startup failed. Exiting.` Every other graph on the server goes down with it.
- **Confirmed by harness:** `workflow.compile()` without the checkpointer loads, and the steps stream.

### [Input/Output Schemas](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) · [Workflow Execution](https://docs.copilotkit.ai/deepagents/shared-state/workflow-execution)
**#16 The snippet has no imports, and `ChatOpenAI()` uses a deprecated model, so every run fails.**
- **Doc:** `class OverallState(InputState, OutputState): resources: List[str]` … `model = ChatOpenAI()` … `StateGraph(OverallState, input=InputState, output=OutputState)`, with no import lines. Workflow Execution serves the same content.
- **Error:** `NameError: name 'List' is not defined`; with the imports added, every run: `Error code: 404 - The model 'gpt-3.5-turbo' has been deprecated` (no reply in the UI; console `An internal error occurred`).
- **Confirmed by harness:** with imports and `ChatOpenAI(model="gpt-6-luna")` the agent answers.

## Minor notes
- #42 Windows: `npx @langchain/langgraph-cli dev` (Python) crashes with `ConsoleRenderer with colors=True on Windows requires the colorama package`; `uv add colorama` fixes it (the QA team notes the same). Upstream packaging.
- #44 Windows + Node 26: the same command hangs at "Downloading uv 0.9.11 for win32" (the unzipped `uv.exe` is truncated); it also warns "Launching Python server from @langchain/langgraph-cli is experimental". Environment-level.
- #50 Multimodal: `<CopilotChat agentId="my-agent" …>` crashes (`Agent 'my-agent' not found`); with the app's agent, the image reply works.
- #51 Headless Threads: `useThreads({ agentId: "my-agent" })` lists nothing; `verifyAppSession` is undefined; `ThreadSidebar` ignores `onSelectThread`, so a thread can't be opened.
- #52 Open, close, and feedback: `analytics` is undefined; `OpenChatButton` outside the sidebar renders nothing.
- #53 Governed Action Approval UI: the `useInterrupt` path has no backend on the page (the `useHumanInTheLoop` path works).
- #54 WebMCP: `searchOrders` is undefined. Tested with a stubbed `document.modelContext`, not in Chrome 149.
- #55 State streaming (`/shared-state/streaming`): the agent is LangChain `create_agent`, not a Deep Agent, and the frontend is a `useAgent` fragment only.
- #56 Programmatic Control: the interrupt example imports `../_shared/interrupt-fallback-slots`, which isn't shown.
- #58 Components sub-pages (Surfaces, Catalogs, Standard catalog, Theming, Transports, Markdown mode, Adopt from A2UI, State and actions): the provider snippets have no `agentId` (a Quickstart app has only `sample_agent`, see #45) and need `maplibre-gl` (#49). Surfaces: `Product`/`ProductRow` undefined. Adopt from A2UI: `z` not imported, `Airport`/`Arrow` renderers not shown.
- #59 State and actions: the catalog is split over three `createGenerativeUI({ id: "acme/shop@1" … })` / component blocks; merged into one it works (card, live `inCart`, Add to cart). `Cart` is undefined.
- #18 Frontend tools and other pages link "Getting Started" to `/langgraph/quickstart`.
- #17 Tool rendering says `useRenderToolCall` where it means `useRenderTool` (×2).
- #32 Markdown: `my-link`/`my-heading` classes are undefined.
- #60 The docs site shows "Missing snippet — No demo found for `deepagents::<cell>`" boxes where code should be on Headless UI (×3), Voice, Reasoning, Sub-agents, HITL Overview, CopilotChat, CopilotSidebar, CopilotPopup and A2UI (all already carry the "Not available" banner, #57).

## Build-only (`tsc` / `next build`; `npm run dev` runs fine)
- **#5 [Tool rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering):** `useDefaultRenderTool({ render: ({ name, args, status, result }) => … })`: `args` is not a prop (it is `parameters`).
