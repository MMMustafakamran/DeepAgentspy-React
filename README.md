# CopilotKit + Deep Agents Test Suite

A navigable, working test harness for the CopilotKit ↔ Deep Agents (Python) integration — one route per doc page, each running the real thing.

| | |
|---|---|
| **Doc-sync date** | 2026-08-06 — every page below was fetched live on this date |
| **Doc root tracked** | <https://docs.copilotkit.ai/deepagents> |
| **Language tab** | **Python** throughout. The TypeScript tabs are not implemented. |
| **Backend flavour** | LangGraph CLI (`langgraph.json`), not the FastAPI tab |
| **CopilotKit (npm)** | `@copilotkit/react-core` 1.66.2 · `@copilotkit/runtime` 1.66.2 · `@copilotkit/a2ui-renderer` 1.66.2 |
| **CopilotKit (PyPI)** | `copilotkit` 0.1.94 |
| **Agent framework** | `deepagents` 0.7.4 · `langgraph-cli[inmem]` |
| **Frontend** | Next.js 16.3.0 · React 19.2.8 · TypeScript 5 · Tailwind 4 |
| **CI** | none |

---

## Overview

Deep Agents is LangChain's framework for long-horizon agents — `create_deep_agent` returns a compiled LangGraph graph with planning and virtual-filesystem tools already installed. CopilotKit connects one of those graphs to a React app over the AG-UI protocol, so the agent can render components, call browser-side tools, suspend for human input, and share state with your UI.

This repo implements every Deep Agents doc page in that list as a live route. It is a QA tool, not a tutorial: each route shows what the page teaches actually running, alongside the repo's own source read off disk at render time, plus a plain statement of anywhere the page and the shipped packages disagree. Fifteen doc pages, thirteen routes (three doc URLs are query-string variants of one page), thirteen graphs — ten Deep Agents plus three hand-built `StateGraph`s, for the pages that are about LangGraph features `create_deep_agent` does not expose.

Everything traces to a doc page. Nothing was invented to fill a gap — where a page omits something needed to run, the gap is named on the route and in [§9](#9-known-issues--docvsimplementation-discrepancies).

---

## 3. Architecture

```
browser
  └─ <CopilotKit runtimeUrl="/api/copilotkit">        frontend/src/components/providers.tsx
       └─ <CopilotChat agentId="…"> + hooks           frontend/src/app/**/demo-chat/page.tsx
            │  HTTP POST (single-route JSON envelope)
            ▼
       Next route handler                             frontend/src/app/api/copilotkit/route.ts
       CopilotRuntime { agents: { <graphId>: LangGraphAgent } }
            │  LangGraph Platform API
            ▼
       LangGraph dev server  :8123                    backend/langgraph.json
       ├─ 10 compiled graphs from create_deep_agent   backend/main.py, backend/src/*.py
       └─  3 hand-built StateGraphs                   predictive_state_manual / predictive_state_tool
            │                                         / state_inputs_outputs
            │
            ▼
       OpenAI
```

**Backend language: Python.** The Quickstart's Python tab describes a `langgraph.json` manifest served by the LangGraph CLI; that is what this repo builds. The page's third tab (FastAPI + `add_langgraph_fastapi_endpoint`) is an alternative not implemented here.

Two runtime endpoints, not one:

- `/api/copilotkit` — all thirteen graphs. Sets `a2ui: { injectA2UITool: false, agents: ["a2ui_fixed_agent"] }`, because the fixed-schema agent returns its own A2UI operations and must not also be handed a `generate_a2ui` tool.
- `/api/copilotkit-a2ui-dynamic` — the dynamic-schema agent only, with no `a2ui` block, so injection stays on. The setting is per-runtime, which is why it needs its own endpoint.

---

## 4. Prerequisites

| Requirement | Version used | Notes |
|---|---|---|
| Node.js | 24.16.0 (20+ per the Quickstart) | |
| npm | 12.0.1 | or pnpm/yarn/bun |
| Python | 3.12 | `langgraph.json` declares `"python_version": "3.12"` |
| `uv` | 0.11.20 | The Quickstart's package manager for Deep Agents |
| OpenAI API key | — | **Required.** Every agent uses it. |
| LangSmith / LangGraph Platform key | — | **Not** required locally. Only for a Platform deployment. |

No framework-specific CLI to install globally: `langgraph-cli[inmem]` comes in as a `uv` dev dependency.

---

## 5. Setup

```bash
# 1. Clone
git clone <this-repo> deepagents && cd deepagents

# 2. Frontend deps
cd frontend && npm install && cd ..

# 3. Backend deps (creates backend/.venv and installs langgraph-cli too)
cd backend && uv sync && cd ..
```

**4. Environment.** There are two processes, so two files:

```bash
cp .env.example backend/.env       # then keep the backend block
cp .env.example frontend/.env.local # then keep the frontend block
```

| Variable | Goes in | Required | What it does |
|---|---|---|---|
| `OPENAI_API_KEY` | `backend/.env` | **yes** | The model key. Every agent reads it. |
| `OPENAI_MODEL` | `backend/.env` | no | Model id for every agent. Defaults to `gpt-4o`. |
| `LANGGRAPH_DEPLOYMENT_URL` | `frontend/.env.local` | no | Where the runtime route forwards runs. Defaults to `http://localhost:8123`. |
| `LANGSMITH_API_KEY` | `frontend/.env.local` | no | Sent as `langsmithApiKey`. Ignored by a local `langgraph dev`. |
| `COPILOTKIT_TELEMETRY_DISABLED` | `frontend/.env.local` | no | Silences the runtime's telemetry notice. |

**Ports:** frontend `3000`, agent server `8123`. Change the agent port and you must change `LANGGRAPH_DEPLOYMENT_URL` to match.

---

## 6. Running the project

Two terminals — the CLI does not start both.

**Terminal 1 — the agent server:**

```bash
cd backend && uv run langgraph dev --port 8123 --no-browser
```

Success looks like this, with all thirteen graphs importing:

```
Welcome to
╦  ┌─┐┌┐┌┌─┐╔═╗┬─┐┌─┐┌─┐┬ ┬
║  ├─┤││││ ┬║ ╦├┬┘├─┤├─┘├─┤
╩═╝┴ ┴┘└┘└─┘╚═╝┴└─┴ ┴┴  ┴ ┴
- 🚀 API: http://localhost:8123
...
Importing graph  graph_id=sample_agent  path=./main.py
Importing graph  graph_id=tool_rendering_agent  ...
Application started up in 3.55s
```

Confirm with `curl http://localhost:8123/ok` → `{"ok":true}`.

**Terminal 2 — the app:**

```bash
cd frontend && npm run dev
```

You should see `✓ Ready in …` and `- Local: http://localhost:3000`.

**Open <http://localhost:3000>.** Start at `/quickstart` — if that streams a reply, every other route's plumbing is fine.

> The Quickstart's Deep Agent tab says to start the agent with `npx @langchain/langgraph-cli dev --port 8123`. That does work against this Python manifest, but the CLI itself prints *"Launching Python server from @langchain/langgraph-cli is experimental. Please use the `langgraph-cli` package from PyPi instead"* and then downloads its own copy of `uv`. This repo takes that advice.

---

## 7. What to expect — walkthrough per section

Every route has a notes page (source, discrepancies, a **Try it** box) and, where there is something to drive, a chrome-free demo at `<route>/demo-chat`.

### Getting Started

**`/`** — Introduction. Orientation and the live graph roster. Nothing to drive.

**`/quickstart`** → `sample_agent`
Proves the whole stack in one message: a Deep Agent with a single Python tool, published by the LangGraph server, reached through `CopilotRuntime`, driven by a `CopilotSidebar`.
*Try:* `What's the weather in Lisbon?`
*Pass:* tokens stream a word at a time; a collapsed `Called get_weather` row appears (that's `useDefaultRenderTool`); the reply says Lisbon is sunny.
*Fail:* an error banner or no reply — `langgraph dev` is down, or `OPENAI_API_KEY` is missing from `backend/.env`.

### Generative UI

**`/generative-ui/tool-rendering`** → `tool_rendering_agent`
`useRenderTool` claims a backend tool by name and replaces its chat bubble; `useDefaultRenderTool` catches the rest.
*Try:* `What's the weather in Tokyo?` then `Write a short plan for a two-day trip to Tokyo`
*Pass:* the first draws a grey `Called the weather API for Tokyo.` line; the second makes the agent use its own planning tools, which fall through to the catch-all as `✓ write_todos` rows with JSON.
*Fail:* a default tool bubble instead of the grey line — the name in `useRenderTool` no longer matches the Python `@tool`.

**`/generative-ui/state-rendering`** → `state_rendering_agent`
`copilotkit_emit_state` pushes state mid-node so a slow task reports progress; `useAgent` renders it outside the chat.
*Try:* `Research the history of the espresso machine`
*Pass:* three rows appear at once, all ⏳, then flip to ✅ one per second, and stay after the reply lands.
*Fail:* rows that appear then vanish — the emitted state was never returned by the node. All-✅-at-once — the deltas were batched, not streamed.

**`/generative-ui/your-components/interrupt-based`** → `interrupt_agent`, `interrupt_multi_agent`
LangGraph `interrupt()` in an `AgentMiddleware.before_model` hook, answered by `useInterrupt`. Two tabs: one interrupt, and two dispatched by `type` via `enabled`.
*Try:* send `Hello`.
*Pass:* on **One interrupt**, the first message is answered with a name form rather than a reply; submit a name and the run resumes using it. On **Two, dispatched by type**, an amber Approve/Reject card comes first, then the blue name form.
*Fail:* a raw JSON blob instead of a form — no `useInterrupt` claimed the event; on the conditional tab that means the `enabled` predicate did not match.

**`/generative-ui/a2ui/fixed-schema`** → `a2ui_fixed_agent`
A component tree authored as JSON up front; the tool supplies only data and returns an `a2ui_operations` container the runtime middleware detects.
*Try:* `Find me a flight from SFO to JFK on United for around $289`
*Pass:* a rendered itinerary card — airport codes either side of an arrow, an airline pill, a price, a Book button.
*Fail:* a raw JSON dump — the container was not detected. An empty card — the `catalogId` in the agent does not match `catalog.ts`.
*Known limit:* the Book button does nothing. See [§9](#9-known-issues--docvsimplementation-discrepancies).

**`/generative-ui/a2ui/dynamic-schema`** → `a2ui_dynamic_agent`
A secondary LLM writes the schema and the data per request. The backend contributes only `CopilotKitMiddleware`.
*Try:* `Show me a KPI dashboard for a SaaS business last quarter`
*Pass:* a progress skeleton, then cards appearing one at a time as data streams in, with a one-line chat reply beside them.
*Fail:* a long prose answer and no surface — the model chose not to call `generate_a2ui`. An empty surface — the generated schema had no component with `id: "root"`.

**`/generative-ui/a2ui/styling`** → `a2ui_dynamic_agent`
The `.a2ui-surface` CSS custom properties, applied to a real surface.
*Try:* `Draw a comparison table of three laptops`
*Pass:* surface text in Plus Jakarta Sans with tight letter-spacing; cards at least 280px wide even when one has streamed in; card background goes near-black in OS dark mode.
*Fail:* system-default typography on the surface — `theme.css` was not imported.

**`/generative-ui/a2ui/advanced`** → `a2ui_dynamic_agent`
A custom `render_a2ui` progress renderer replacing the built-in skeleton.
*Try:* `Chart quarterly revenue for three product lines`
*Pass:* a grey `Building interface...` box with a spinner, gaining an `N components, M items` line as the schema streams, then vanishing as the surface paints.
*Fail:* CopilotKit's own shimmering skeleton — the renderer was registered outside the provider that owns this agent.
*Known limit:* the action-handler half of this page is not implementable. See [§9](#9-known-issues--docvsimplementation-discrepancies).

### App Control

**`/frontend-tools`** → `frontend_tools_agent`
A tool whose body runs in the browser. The Python side defines no tool at all.
*Try:* `Say hello to Ada`
*Pass:* a browser `alert()` reading `Hello, Ada!`; dismiss it and a green line appears in the left panel; the agent then reports it said hello — that reply is the handler's return value.
*Fail:* the agent describing what it *would* do — the tool never reached it; check `CopilotKitMiddleware` is in the middleware list.

### Shared State

**`/shared-state/in-app-agent-read`** → `shared_state_agent`
Reading agent state as ordinary reactive React state.
*Try:* `Hello`
*Pass:* the left panel reads `Language: english` and the JSON dump shows a `language` key.
*Fail:* an empty dump — the agent has not run yet; state only syncs once a run starts.

**`/shared-state/in-app-agent-write`** → `shared_state_agent`
`agent.setState` from the app, plus `agent.runAgent` to re-run immediately.
*Try:* `Tell me a fun fact about octopuses`, hit **Toggle Language**, ask again.
*Pass:* first answer in English, second in Spanish. **Toggle + runAgent()** produces a fresh reply with no typing.
*Fail:* the label flips but answers stay English — the write landed but the model never saw it; check `expose_state`.

**`/shared-state/predictive-state-updates`** → `predictive_state_agent`, `predictive_manual_graph`, `predictive_tool_graph`
**All three of the page's variants are live**, behind a toggle at the top of the demo. Variants 2 and 3 are not Deep Agents — they are hand-built `StateGraph`s, which is what those tabs are for.
*Try:* `Plan and execute a website redesign` on each tab.
*Pass:* **Prebuilt** — step rows appear one at a time, noticeably *before* the chat message completes. **Custom · manual** — exactly four fixed rows, one per second, then an ordinary answer (verified: four distinct state updates in order). **Custom · tool** — steps stream as the model writes the tool call, then the node's `Command` copies the same argument into `observed_steps` so it persists.
*Fail:* all rows at once after the reply — the streaming did not intercept. Nothing at all — the provider is `<CopilotKitProvider>` rather than `<CopilotKit>`; see [§9](#9-known-issues--docvsimplementation-discrepancies).

**`/shared-state/state-inputs-outputs`** → `state_io_graph` — *the one route that is not a Deep Agent*
A hand-built `StateGraph` with `input_schema` / `output_schema`, because the page's own callout says `create_deep_agent` does not expose them. Three fields, three fates: `question` goes in and never comes back, `answer` comes back, `resources` never crosses the wire at all.
*Try:* leave the question as `Why is the sky blue?` and hit **Ask**.
*Pass:* three green badges — `question` absent, `answer` present and holding the reply, `resources` absent — and the state dump at the bottom shows only `answer` and `copilotkit`. Verified on the wire: the final `STATE_SNAPSHOT` carries exactly `["messages", "copilotkit", "answer"]`.
*Fail:* a red badge on `question` or `resources` — `input_schema` / `output_schema` were dropped from the `StateGraph` call and the whole of `OverallState` is coming back.

**`/shared-state/workflow-execution`** — reference only, no demo. The page currently serves the Input/Output Schemas content verbatim.

---

## 8. Testing checklist / current status

Verified 2026-08-06 by driving every graph through the real `CopilotRuntime` route against a live `langgraph dev` and an OpenAI key.

| Doc page | Route | Graph | Status | Notes |
|---|---|---|---|---|
| [quickstart](https://docs.copilotkit.ai/deepagents/quickstart) | `/quickstart` | `sample_agent` | ✅ Working | Python tab + Deep Agent runtime tab |
| [generative-ui/tool-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering) | `/generative-ui/tool-rendering` | `tool_rendering_agent` | ✅ Working | Page's `useDefaultRenderTool` destructures a prop that doesn't exist |
| [generative-ui/state-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering) | `/generative-ui/state-rendering` | `state_rendering_agent` | ✅ Working | Emit coroutine's caller is not shown by the page |
| [.../your-components/interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based) | `/generative-ui/your-components/interrupt-based` | `interrupt_agent`, `interrupt_multi_agent` | ✅ Working | Conditional snippet cannot work as printed |
| [.../a2ui/fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema) | `/generative-ui/a2ui/fixed-schema` | `a2ui_fixed_agent` | ⚠️ Partial | Different `a2ui` API than printed; Book button inert |
| [.../a2ui/dynamic-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema) | `/generative-ui/a2ui/dynamic-schema` | `a2ui_dynamic_agent` | ✅ Working | `myCatalog` never defined by the page |
| [.../a2ui/styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling) | `/generative-ui/a2ui/styling` | `a2ui_dynamic_agent` | ✅ Working | Page's dark-mode rule is invalid CSS |
| [.../a2ui/advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced) | `/generative-ui/a2ui/advanced` | `a2ui_dynamic_agent` | ⚠️ Partial | Progress renderer works; action-handler exports missing |
| [frontend-tools](https://docs.copilotkit.ai/deepagents/frontend-tools) | `/frontend-tools` | `frontend_tools_agent` | ✅ Working | Page duplicates two of its own sections |
| [shared-state/in-app-agent-read](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read) | `/shared-state/in-app-agent-read` | `shared_state_agent` | ✅ Working | `Literal[...] = "english"` is not a runtime default |
| [shared-state/in-app-agent-write](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write) | `/shared-state/in-app-agent-write` | `shared_state_agent` | ✅ Working | Needs `expose_state`, which neither page mentions |
| [.../predictive-state-updates?agent-type=prebuilt](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt) | `/shared-state/predictive-state-updates` | `predictive_state_agent` | ✅ Working | Requires `<CopilotKit>`, not `<CopilotKitProvider>` |
| [...&state-emission=manual-emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission) | same route, tab 2 | `predictive_manual_graph` | ✅ Working | Node body from the Python tab; graph wiring from the same page's TS tab |
| [...&state-emission=tool-emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission) | same route, tab 3 | `predictive_tool_graph` | ✅ Working | Python snippet is near-complete; only the state class and graph were missing |
| [shared-state/state-inputs-outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) | `/shared-state/state-inputs-outputs` | `state_io_graph` | ✅ Working | Custom `StateGraph`, not a Deep Agent — the page calls for exactly that |
| [shared-state/workflow-execution](https://docs.copilotkit.ai/deepagents/shared-state/workflow-execution) | `/shared-state/workflow-execution` | — | ❌ Broken | Upstream duplicate of the page above |

**Totals:** 13 ✅ Working · 2 ⚠️ Partial · 0 📄 Reference · 1 ❌ Broken.

The same table is rendered in-app at `/status`, generated from `frontend/src/lib/nav-config.ts` — that file is the single source of truth for routes, statuses and doc links, so this table and the app cannot drift apart.

---

## 9. Known issues / doc-vs-implementation discrepancies

Every item was checked against the installed packages, and the runtime ones were reproduced against a live run.

### Blocking — the doc's code cannot work

**1. `copilotkit.a2ui` has different function names.**
[fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema) calls four helpers that are not in `copilotkit` 0.1.94:

| Page | Actual |
|---|---|
| `a2ui.surface_update(id, schema)` | `a2ui.update_components(id, schema)` |
| `a2ui.data_model_update(id, data)` | `a2ui.update_data_model(id, data)` |
| `a2ui.begin_rendering(id, "root")` | `a2ui.create_surface(id, catalog_id)` |
| `a2ui.render(operations=…, action_handlers=…)` | `a2ui.render(operations=…)` — no `action_handlers` |

`create_surface` is not a rename of `begin_rendering`: it carries the catalog id and must come *first*. Implemented on the real API in `backend/src/a2ui_fixed.py`, with the mapping in its docstring.

**2. A2UI buttons cannot do anything.**
The agent-side half (`action_handlers=`) does not exist (above); the frontend escape hatch [advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced) offers — `useA2UIActionHandler`, `resolveDeclaredOps`, `defaultActionOrchestrator` — is not exported by `@copilotkit/react-core` 1.66.2 either. Both routes say so. `createA2UIMessageRenderer` and `a2uiDefaultTheme` *are* exported, so the "custom orchestrator" snippet is half-real.

**3. `enabled` has no `eventValue`, and `event.value` is a string.**
[interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)'s "Condition UI executions" section destructures `enabled: ({ eventValue }) => …`. The predicate receives the whole event, `{ name, value }`, so `eventValue` is `undefined` and neither handler ever fires. Separately, a LangGraph `interrupt()` reaches the browser as the legacy `on_interrupt` custom event with its value **serialised** — the wire carries `"value": "{\"type\":\"approval\",…}"` — so `event.value.type` is `undefined` on a string. Both confirmed on a live run; `payloadOf` in the demo handles it. The page's *first* section is fine: it passes a plain string, so `event.value` really is that string.

**4. The dark-mode CSS is invalid.**
[styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling) prints `.dark .a2ui-surface, @media (prefers-color-scheme: dark) { … }`. An at-rule cannot appear in a selector list; browsers discard the whole rule, so dark mode silently does nothing. Split into two rules in `frontend/src/a2ui/theme.css`.

**5. `useDefaultRenderTool` render props have no `args`.**
[tool-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering) destructures `{ name, args, status, result }`. The prop is `parameters` — as it is in the page's own `useRenderTool` snippet directly above. Reading `args` returns `undefined`, silently.

**6. Predictions need `<CopilotKit>`, not `<CopilotKitProvider>`.**
Not stated on any page, and the worst failure mode here because it is completely silent. The backend emits a `PredictState` custom event; the *browser* applies it by watching `TOOL_CALL_ARGS` and calling `agent.setState`. Nothing appears in any `STATE_SNAPSHOT` on the wire — verified. That subscriber lives in `CopilotListeners`, which `<CopilotKit>` mounts and `<CopilotKitProvider>` does not. With the bare provider the event arrives, nobody listens, the panel stays empty, and no error is logged anywhere.

### Incomplete — the doc omits something needed to run

**7. No page shows how custom state reaches a Deep Agent.**
[frontend-tools](https://docs.copilotkit.ai/deepagents/frontend-tools), [state-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering), both shared-state pages and [predictive-state-updates](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates) each define a `CopilotKitState` subclass and then build an agent that never references it. `create_deep_agent` has no `state=` parameter. The only documented route in is an `AgentMiddleware` carrying `state_schema`, which the interrupt-based page uses for its own purposes — so every one of those agents here wraps its state class in a one-line middleware.

**8. `state-rendering` never calls its own coroutine.**
It prints `emit_research_progress(state, config)` and stops, saying only that it belongs "inside a custom tool or middleware hook". A `@tool` is the one place a prebuilt Deep Agent gets a `RunnableConfig`, so that is where it went. Two further things the page does not mention: emitted state is a *prediction* and is overwritten when the node returns (its own list would flash and vanish), and a tool returning a `Command` must include a `ToolMessage` with an injected `tool_call_id` or LangChain rejects the update outright.

**9. Writing state does not make the model see it.**
Both shared-state pages say the agent "reads `state["language"]` … as it runs", but nothing puts the value in the prompt, so the toggle changes state the LLM never sees and the reply stays in English. The fix is `CopilotKitMiddleware(expose_state=["language"])` — real API in `copilotkit` 0.1.94, off by default, mentioned on neither page.

**10. `setState` replaces, it does not merge.**
`AbstractAgent.setState` assigns `this.state = structuredClone(newState)`. The write page's one-key `agent.setState({ language })` therefore discards every other key, including `copilotkit`, which is where frontend tools live. Harmless on this agent, a data-loss bug on a richer one. Spread `agent.state` first.

**11. `Literal[...] = "english"` is not a default.**
`CopilotKitState` is a `dict` subclass; the assignment is a class attribute that LangGraph never applies. Without help the key is absent and you are looking at the `??` fallback in the component, not agent state. Seeded in `before_agent` here.

**12. The A2UI schemas and catalog are never shown.**
[fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema) says to design `flight_schema.json` in the A2UI Composer and never prints one; [dynamic-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema) writes `a2ui={{ catalog: myCatalog }}` and links to a "Bring Your Own Catalog" page that resolves outside the Deep Agents tree. Both were supplied for this repo, as were the shadcn-style primitives the [advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced) renderers import — that file is marked `⚠ SELF-DEFINED` at the top.

**13. Neither custom-graph variant of predictive-state-updates is complete in Python.**
Both show a bare node with no `StateGraph`, no `add_node`, no `compile`. The manual-emission one also omits the model call and the return, returns `Command[Literal["cpk_action_node", …]]` naming a node that appears nowhere on the page, and uses `asyncio`, `Command`, `Literal` and `RunnableConfig` without importing any of them.

**Both are live here anyway**, because the missing half is on the *same page's TypeScript tab*, which prints the annotation, wiring and `compile` in full. So each graph is the Python tab's node body inside the TypeScript tab's scaffolding — two tabs of one page, no third source. The unreachable `cpk_action_node` is dropped from the signature, since the graph goes straight to `END` exactly as the TypeScript one does.

Two further notes. The tool-emission variant binds `state["copilotkit"]["actions"]` straight into `bind_tools` as though those were LangChain tools; its TypeScript tab wraps them in `convertActionsToDynamicStructuredTools` first, and nothing in the Python package does that conversion — harmless here only because no frontend tools are registered against that graph. And it needs no `ToolNode`: the node routes to `END` on both paths, so the tool is never executed and the model's *argument* is the payload.

**14. The Python LangGraph API rejects a checkpointer; the JS one does not.**
The TypeScript tab compiles both custom graphs with a `MemorySaver`. Do the same in Python and the dev server refuses to start: *"Your graph 'graph' … includes a custom checkpointer … With LangGraph API, persistence is handled automatically by the platform … please remove the custom checkpointer."* It is a hard `ValueError` at graph-load time, not a warning. Both graphs here therefore call `workflow.compile()` bare and let the server provide persistence. The JS dev server accepts the same `MemorySaver` without complaint.

### Upstream page bugs

**15. `workflow-execution` serves the wrong page.**
`/deepagents/shared-state/workflow-execution` returns [state-inputs-outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) byte for byte — same subtitle, prose, code and closing snippet. Only the `h1` differs, and even the subtitle describes the *other* page's topic. Both fetched as raw markdown and compared. Marked ❌ Broken rather than guessed at.

**16. `state-inputs-outputs` uses the deprecated LangGraph spelling.**
`StateGraph(OverallState, input=…, output=…)`. Still accepted in LangGraph 1.2.10, but it warns: *"`input` is deprecated and will be removed. Please use `input_schema` instead."* The implementation here uses `input_schema=` / `output_schema=`. The snippet also imports nothing it uses, switches from `list[str]` to `List[str]` midway, and never fills in `resources` — the field the whole page is about — leaving `# ...add the rest of the agent implementation` where it would be written. An absent key proves nothing if the node never sets it, so `answer_node` records what it actually sent to the model.

**17. `useRenderToolCall` is not the hook the prose means.**
[tool-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering) names it three times as the counterpart to `useDefaultRenderTool`. It is a real export, but a different hook — no arguments, returns a function that renders a given tool call from renderers already registered. The one meant is `useRenderTool`, which the page's own snippets use.

**18. `frontend-tools` repeats itself and links elsewhere.**
Its Step 1 links to `/langgraph/quickstart` rather than the Deep Agents one, and Steps 4–5 repeat "What is this?", "When should I use this?" and the whole `useFrontendTool` snippet verbatim.

**19. Broken anchors on `advanced`.**
Links to `./fixed-schema#adding-interactivity-action-handlers` (no such anchor — the section is "Action handler details") and `./fixed-schema-streaming#…` (page does not exist).

**20. Model ids vary across pages.**
`openai:gpt-4o` on Quickstart and Tool Rendering, `gpt-5.4` on Dynamic Schema A2UI and Predictive State Updates, `gpt-4` inside the tool-emission snippet. Every agent here reads `OPENAI_MODEL` instead, defaulting to `gpt-4o`.

**21. The Quickstart installs a package it never uses.**
Its install line is `npm install @copilotkit/react-ui @copilotkit/react-core @copilotkit/runtime`, but every import it then writes is from `@copilotkit/react-core/v2`. `@copilotkit/react-ui` is the v1 UI package; nothing here imports it and it is not installed.

---

## 10. Troubleshooting

The Deep Agents doc tree has **no** Troubleshooting section as of 2026-08-06 — no Common Issues, migration or error-debugging pages. What follows is this repo's own symptom list, from actually running it.

| Symptom | Cause | Fix |
|---|---|---|
| `Failed to create thread: HTTP 422: Invalid thread ID: must be a UUID` | Something posted a non-UUID `threadId`. The browser always generates one; scripted clients often don't. | Use `crypto.randomUUID()`. |
| Chat shows an error banner; agent server log is silent | The runtime cannot reach `:8123`. | Is `langgraph dev` running? `curl http://localhost:8123/ok`. Check `LANGGRAPH_DEPLOYMENT_URL`. |
| Agent runs but every reply is an auth error | `OPENAI_API_KEY` missing. | It goes in **`backend/.env`**, not `frontend/.env.local`. `langgraph.json` points at `.env` next to it. |
| A route 500s with "Agent … not found" | Graph id mismatch. | `frontend/src/lib/agents.ts` must list the same ids as `backend/langgraph.json`. |
| Predictive State Updates panel never fills | Root provider is `<CopilotKitProvider>`. | Use `<CopilotKit>` — see §9 item 6. Fails silently. |
| Shared-state toggle flips but the agent ignores it | `expose_state` not set. | `CopilotKitMiddleware(expose_state=["language"])` — see §9 item 9. |
| A2UI surface renders empty | `catalogId` mismatch, or a generated schema with no `id: "root"`. | Fixed schema: `CATALOG_ID` in `backend/src/a2ui_fixed.py` must equal the one in `catalog.ts`. Dynamic: try a stronger `OPENAI_MODEL`. |
| Tool renders as the default bubble | Renderer name ≠ Python tool name. | They must match exactly. |
| `Expected to have a matching ToolMessage in Command.update` | A tool returned a `Command` without one. | Include a `ToolMessage` with an injected `tool_call_id` — see `backend/src/state_rendering.py`. |
| Unexpected `✓ write_todos` / `✓ ls` rows in chat | Not a bug. `create_deep_agent` installs planning and filesystem tools; the catch-all renderer draws them. | — |
| Input/Output Schemas shows `question` or `resources` as present | `input_schema=` / `output_schema=` missing from the `StateGraph` call, so the whole of `OverallState` is returned. | Both belong on the constructor — see `backend/src/state_inputs_outputs.py`. |
| Graph edits don't take effect | `langgraph dev` watches files but a syntax error aborts the reload. | Check the server log. |

---

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 15 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than 250 KB of rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline and report the whole corpus as rewritten on the next run. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level | Trigger |
|---|---|
| **High** | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code |
| **Low** | other prose |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run *after* a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged, so a change from six weeks ago still shows if nothing has happened since.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run and shown on `/`, `/status` and `/doc-sync`. There is no hand-maintained date to keep in step with it.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored derived data.

---

## 11. Project structure

```
deepagents/
├── CLAUDE.md
├── README.md
├── .env.example                      both env blocks, annotated
├── .gitignore
│
├── backend/                          Python — the agents
│   ├── pyproject.toml                deps + langgraph-cli in the dev group
│   ├── langgraph.json                10 graph ids → module:attribute
│   ├── main.py                       sample_agent (the Quickstart, verbatim)
│   └── src/
│       ├── shared.py                 MODEL / OPENAI_MODEL, read by every agent
│       ├── tool_rendering.py         tool_rendering_agent
│       ├── state_rendering.py        state_rendering_agent
│       ├── interrupt_based.py        interrupt_agent + interrupt_multi_agent
│       ├── frontend_tools.py         frontend_tools_agent
│       ├── shared_state.py           shared_state_agent (read + write routes)
│       ├── predictive_state.py       predictive_state_agent      (prebuilt)
│       ├── predictive_state_manual.py predictive_manual_graph    ← StateGraph
│       ├── predictive_state_tool.py   predictive_tool_graph      ← StateGraph
│       ├── a2ui_fixed.py             a2ui_fixed_agent
│       ├── a2ui_dynamic.py           a2ui_dynamic_agent
│       ├── state_inputs_outputs.py   state_io_graph — a StateGraph, not a Deep Agent
│       └── a2ui_schemas/             flight_schema.json, booked_schema.json
│
└── frontend/                         Next.js App Router
    └── src/
        ├── lib/
        │   ├── nav-config.ts         ← single source of truth: routes, statuses, doc links
        │   ├── agents.ts             graph ids, deployment URL
        │   └── source.ts             reads repo files at render time
        ├── a2ui/theme.css            the Styling page's theme, imported at the root
        ├── components/               harness chrome + a2ui-progress.tsx
        ├── hooks/use-a2ui-progress.tsx
        └── app/
            ├── layout.tsx            providers + chrome + theme import
            ├── page.tsx              Introduction
            ├── status/               the QA table
            ├── api/
            │   ├── copilotkit/route.ts               all 10 graphs, A2UI off for fixed-schema
            │   └── copilotkit-a2ui-dynamic/route.ts  dynamic-schema only, injection on
            └── <doc-path>/
                ├── page.tsx          notes, source, discrepancies, Try it
                └── demo-chat/page.tsx   the chrome-free live surface
```

Every route's `page.tsx` renders its source with `<SourceCode file="…">`, which reads the file off disk on the server at render time. What a route shows is therefore always what actually runs — it cannot drift into a re-typed approximation.

---

## 12. References

Grouped the way the doc nav groups them.

**Getting Started**
- [Introduction](https://docs.copilotkit.ai/deepagents)
- [Quickstart](https://docs.copilotkit.ai/deepagents/quickstart)

**Generative UI**
- [Tool Rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering)
- [State Rendering](https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering)
- [Your Components · Interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)
- [A2UI · Fixed Schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema)
- [A2UI · Dynamic Schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema)
- [A2UI · Styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling)
- [A2UI · Advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced)

**App Control**
- [Frontend Tools](https://docs.copilotkit.ai/deepagents/frontend-tools)

**Shared State**
- [Reading agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read)
- [Writing agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write)
- [Predictive State Updates — prebuilt](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt)
- [Predictive State Updates — custom graph, manual emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission)
- [Predictive State Updates — custom graph, tool emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission)
- [Input/Output Schemas](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs)
- [Workflow Execution](https://docs.copilotkit.ai/deepagents/shared-state/workflow-execution)

**Not covered by this repo.** The Deep Agents sidebar also lists Human in the Loop, and an Intelligence Platform group (Rich Threads, Headless Threads, Thread & History Lifecycle, Synchronize Thread History, and four premium pages). Those were outside the scope requested for this build. Every page listed above is implemented or explicitly accounted for.
