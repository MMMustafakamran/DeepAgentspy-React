# CopilotKit + Deep Agents Test Suite

A navigable, working test harness for the CopilotKit ↔ Deep Agents (Python) integration — one route per doc page, each running the real thing.

| | |
|---|---|
| **Doc-sync date** | `syncedAt` in `doc-snapshot/manifest.json` is the only one, 2026-09-23 at the last sync |
| **Doc root tracked** | <https://docs.copilotkit.ai/deepagents> |
| **Language tab** | **Python** throughout. The TypeScript tabs are not implemented. |
| **Backend flavour** | LangGraph CLI (`langgraph.json`), not the FastAPI tab |
| **CopilotKit (npm)** | declared `^1.73.3` · lockfile 1.73.3 · installed 1.73.3 (`frontend/VERSIONS.md`) for `react-core`, `runtime` and `a2ui-renderer` alike. Upgraded 2026-09-23 from declared `^1.69.0` · lockfile 1.69.0 · installed 1.71.0; findings recorded before then name the version they were observed on |
| **CopilotKit (PyPI)** | `copilotkit` 0.1.94 |
| **Agent framework** | `deepagents` 0.7.4 · `langgraph-cli[inmem]` |
| **Frontend** | Next.js 16.3.0 · React 19.2.8 · TypeScript 5 · Tailwind 4 |
| **CI** | none |

---

## Overview

Deep Agents is LangChain's framework for long-horizon agents — `create_deep_agent` returns a compiled LangGraph graph with planning and virtual-filesystem tools already installed. CopilotKit connects one of those graphs to a React app over the AG-UI protocol, so the agent can render components, call browser-side tools, suspend for human input, and share state with your UI.

This repo implements most Deep Agents doc pages in that list as a live route, and tracks three more for drift without building a demo behind them (see §8). It is a QA tool, not a tutorial: each route shows what the page teaches actually running, alongside the repo's own source read off disk at render time, plus a plain statement of anywhere the page and the shipped packages disagree. Eighteen doc pages, sixteen routes (three doc URLs are query-string variants of one page), thirteen graphs — ten Deep Agents plus three hand-built `StateGraph`s, for the pages that are about LangGraph features `create_deep_agent` does not expose.

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

**`/`** — Introduction. Orientation and the live graph roster. Nothing to drive. Since 2026-09-21 the doc page carries a code block of its own, a `CopilotRuntime` route titled with the same filename the Quickstart uses and holding different code; both are printed side by side on the route, with the differences named. See §9 #28 and #29.

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

**`/generative-ui/frontend-cards`** — ❌ **Broken as published**, works with one prop the page never mentions. New upstream 2026-09-11. A card pushed into the transcript from frontend code as a `role: "activity"` message, which is stripped from every run. The demo has two tabs. **As published** is step 2's provider unchanged (`runtimeUrl` + `renderActivityMessages`); its bare `useAgent()` and `<CopilotChat />` ask for the agent id `default`, which a Deep Agents runtime does not register. *Try:* just open it. *What happens:* the chat paints, then `useAgent()` throws `Agent 'default' not found after runtime sync` as soon as `/info` answers (3/3), and the demo prints that error where the chat was. **+ agent="sample_agent"** adds the Quickstart's provider prop and nothing else. *Try:* click **Simulate: deployment finished**, then ask `Have you been shown any deployment card?` *Pass:* the card renders; the probe row reads `agent.messages = activity, user, assistant` and `run payload = user` (read off the request that left the browser); the agent says it saw no card. *Fail:* no card, or `activity` in the payload row. The three snippets are verbatim; step 3's `<DeploymentWatcher />` is mounted inside step 2's provider, which the page never says to do, and its `wss://example.com` socket never delivers, so the button fires the same `addMessage`. See §9 #22.

### Custom Look and Feel

**`/custom-look-and-feel/markdown`** → `sample_agent` — ⚠️ **Partial.** New upstream 2026-09-21. The `markdownRenderer` slot on `CopilotChatAssistantMessage`, reached from `<CopilotChat messageView={{ assistantMessage: { markdownRenderer } }} />`, in all three of the page's forms. The demo has five tabs and a probe that reads the rendered HTML rather than the library's own bookkeeping: the opening tag of the first `<a>`, the number of `[data-streamdown]` elements, the number of elements carrying a literal `node` attribute, and the number carrying the page's `.my-link` / `.my-heading`. **Page code, verbatim** is the published block with nothing added. *Try:* just open it. *Expect:* the chat paints, then throws `Agent 'default' not found after runtime sync` — the block carries no agent id, and Deep Agents registers no `default`, the same defect already reproduced on Frontend-Driven Cards. The other four tabs add `agentId="sample_agent"` and nothing else. **Not yet driven:** this route was built on 2026-09-21 and has no clip; the lines below are what the take should show. *Try:* `Reply in markdown. Include an "## Example" heading, a link to https://docs.copilotkit.ai/deepagents, and the literal text <reference-chip id="42">Doc 42</reference-chip>.` *Pass:* on **components map** the anchor row reads `<a href="…" target="_blank" rel="noopener noreferrer" class="my-link">` with no `data-streamdown`, and the `node` count is 0; on **no override** the same anchor carries `data-streamdown="link"` and Streamdown's classes; the reference-chip is plain text on every tab. *Fail:* a `node` count above 0, or a missing `rel`/`target` on the components tab. See §9 #32.

### Rich Threads

**`/threads/lifecycle`** → `sample_agent` — ⚠️ **Partial.** Tracked 2026-09-21; the only Rich Threads page this repo implements. One button per lifecycle claim on the page, with the chat's resolved state read back from its `CopilotChatConfigurationProvider`, including the id of the parent provider the root `<CopilotKit>` supplies. **Try:** send a message, press "Remount chat", then "Open conversation", "New chat", "Pin a threadId prop" and "New chat" again. **Pass:** the remount keeps the id, because it is inherited from the parent, and the chat empties; "Open conversation" flips `hasExplicitThreadId` to true and replays the messages from the runtime's `InMemoryAgentRunner`; with the id pinned, "New chat" changes nothing and the amber line shows the `Ignoring startNewThread()` warning; the pinned id survives a remount. **Fail:** the re-opened thread shows 0 messages (nothing replayed). See §9 #35.

### App Control

**`/frontend-tools`** → `frontend_tools_agent`
A tool whose body runs in the browser. The Python side defines no tool at all.
*Try:* `Say hello to Ada`
*Pass:* a browser `alert()` reading `Hello, Ada!`; dismiss it and a green line appears in the left panel; the agent then reports it said hello — that reply is the handler's return value.
*Fail:* the agent describing what it *would* do — the tool never reached it; check `CopilotKitMiddleware` is in the middleware list.

**`/webmcp`** — 🚧 **Tracked, not implemented.** The doc adds a `webmcp` flag to a frontend tool so browser agents can discover it through `document.modelContext`. Its own test procedure needs Chrome 149+ with the WebMCP origin trial (or `chrome://flags/#enable-webmcp-testing`) and Chrome's Model Context Tool Inspector; CopilotKit no-ops where `document.modelContext` is absent, so a demo here would register nothing and still look green.

**`/human-in-the-loop/governed-actions`** — ✅ **Working.** An approval card gating a side-effecting action. The run stops on the card, which shows the policy verdict, the reference that produced it, and the exact arguments; it proceeds only on approval. The `useHumanInTheLoop` variant is implemented; the `useInterrupt` variant is not, because it needs a backend that pauses a run and attaches `interrupt.metadata.action`, and no graph here does. The published schema goes in unchanged — `z.record(z.unknown())` is valid on this repo's zod 3, though it does not compile on the zod 4 that MsPy-react and AG2-react run. The `useEffect` that auto-resolves `allow` and `deny` omits `onApprove` and `onBlock` from its dependency array; kept as published, warning and all.

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

### Intelligence

**`/intelligence/memories`** — ❌ **Broken as documented.** New upstream 2026-09-11. **Try:** **Save**, then `Please remember that I prefer concise status updates.`, then switch to the second runtime and **Save** again. **What happens:** the page's React snippet used not to compile (it imported `useMemories` from the package root); the 2026-09-21 sync fixed that to `@copilotkit/react-core/v2`, so the published file now runs here as published and the demo's corrected copy is gone. On the documented runtime — the Deep Agents Quickstart's, which is not an Intelligence runtime — no memory request ever leaves the browser: the hook reports `isAvailable: true`, the page's `MemoryList` renders an empty list instead of "Memory is not available", the save fails with "Runtime URL is not configured", and the agent says "Got it! I'll keep updates brief." The second runtime adds `memory: { access }`, which the page never mentions and without which every `/memories/*` route 404s even on an Intelligence runtime; it needs `CPK_INTELLIGENCE_API_KEY`, which this harness does not have, so it answers 503 and the platform side was not reached. See §9 #23.

**`/intelligence/learned-skills`** — ❌ **Broken as published.** New upstream 2026-09-15, restructured 2026-09-21. Automatic delivery of a Learning container's published Skills through a framework-native adapter. **Try:** just open it, then `List the skills you can load, then load the refund-policy skill and follow it.` **What happens:** the agent answers from its own instructions with no tool call, because no adapter is mounted and none can be. Every Python package on the page's table is 404 on PyPI; the BuiltInAgent row added on 2026-09-21 uses the package this repo does install; it did not typecheck on 1.71.0 and does on the 1.73.3 installed since 2026-09-23, but it would replace the Deep Agent rather than attach to it. Both BuiltInAgent snippets are in the repo verbatim (`built-in-agent-classic.ts`, `built-in-agent-factory.ts`), imported by nothing. See §9 #26 and #38.

**`/learning`** — ❌ **Broken without an Intelligence key.** New upstream 2026-09-11, new delivery and schedule sections 2026-09-21. The page's runtime snippet on its own mount at `/api/copilotkit-learning`, with `expense-agent` and `sample_agent` both on the Quickstart graph. The selector shipped here returns one container for both rather than the page's conditional, which is §9 #25. **Try:** on `expense-agent`, `Review this expense: $42 team lunch, receipt attached.`; then on `sample_agent`, `Say hello in five words.` **What happens:** neither can send. `apiKey: process.env.CPK_INTELLIGENCE_API_KEY!` throws "apiKey is required and cannot be blank" at module load, the route answers 500 (shown in the panel's last row), the provider sits in `error` and the send button never enables. Container assignment, and the dashboard/CLI half of the page (create a container, Run Learning, approve a Skill, `copilotkit skills download`), need a provisioned project and are not exercised. The 2026-09-21 sync added a **Set up automatic skill delivery** section and a **Choose the daily schedule** step on top of that: an agent-server environment block (`CPK_INTELLIGENCE_API_KEY`, `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review`) for an adapter this backend cannot install, and a dashboard schedule (15 eligible Threads, 02:00 UTC default) with no code in it at all. See §9 #24 and #27.

### Cookbook

**`/cookbook/jev-generative-ui`** — ❌ **Not runnable here, and not stood in for.** New upstream 2026-09-21. A workspace picker whose next control and candidate ranking come from Jev, TypeSafe's decision service. The route carries every published TypeScript block verbatim; four of the six files are imported by nothing, compile, and cannot run. **Try:** open the route and use the two panel buttons, then press an option. **Not yet driven** — built 2026-09-21, no server was started for it; what follows is what it is wired to do. **Expect:** the prepared controls, `PanelSchema`/`StateSchema` and `readAction` all run for real — a clarification answer is rewritten to `I answered the workspace clarification: …`, a room selection sets `selectedId` and the note `Selected Quiet room. No booking was made.` — and the trail stops at `choosePanel`, which needs `@typesafe-ai/sdk` and a `TYPESAFE_API_KEY` from a third-party vendor. The comparison panel is in catalog order, labelled on screen as such, because the Jev fit scores that order it do not exist here. No demo and no recorder entry: there is nothing to film that would not be a stand-in for the decision layer. See §9 #33.

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
| [webmcp](https://docs.copilotkit.ai/deepagents/webmcp) | `/webmcp` | — | 🚧 Not started | Tracked for drift. Needs Chrome 149+ and the WebMCP origin trial |
| [human-in-the-loop/governed-actions](https://docs.copilotkit.ai/deepagents/human-in-the-loop/governed-actions) | `/human-in-the-loop/governed-actions` | `sample_agent` | ✅ Working | Tool-call variant. `useInterrupt` half needs a backend that pauses a run; published schema compiles unchanged on zod 3 |
| [shared-state/in-app-agent-read](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read) | `/shared-state/in-app-agent-read` | `shared_state_agent` | ✅ Working | `Literal[...] = "english"` is not a runtime default |
| [shared-state/in-app-agent-write](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write) | `/shared-state/in-app-agent-write` | `shared_state_agent` | ✅ Working | Needs `expose_state`, which neither page mentions |
| [.../predictive-state-updates?agent-type=prebuilt](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt) | `/shared-state/predictive-state-updates` | `predictive_state_agent` | ✅ Working | Requires `<CopilotKit>`, not `<CopilotKitProvider>` |
| [...&state-emission=manual-emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission) | same route, tab 2 | `predictive_manual_graph` | ✅ Working | Node body from the Python tab; graph wiring from the same page's TS tab |
| [...&state-emission=tool-emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission) | same route, tab 3 | `predictive_tool_graph` | ✅ Working | Python snippet is near-complete; only the state class and graph were missing |
| [shared-state/state-inputs-outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs) | `/shared-state/state-inputs-outputs` | `state_io_graph` | ✅ Working | Custom `StateGraph`, not a Deep Agent — the page calls for exactly that |
| [shared-state/workflow-execution](https://docs.copilotkit.ai/deepagents/shared-state/workflow-execution) | `/shared-state/workflow-execution` | — | ❌ Broken | Upstream duplicate of the page above |
| [generative-ui/frontend-cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards) | `/generative-ui/frontend-cards` | `sample_agent` | ❌ Broken | New 2026-09-11. As published `useAgent()` targets `default`, which Deep Agents does not register, and throws; with the Quickstart's `agent` prop the card renders and never reaches the agent. Pre-connect cards silently lost — §9 #22 |
| [intelligence/memories](https://docs.copilotkit.ai/deepagents/intelligence/memories) | `/intelligence/memories` | `sample_agent` | ❌ Broken | New 2026-09-11. Import path fixed upstream 2026-09-21; on the Quickstart runtime the hook still reports available over an empty list and never sends a request; `memory: { access }` undocumented — §9 #23 |
| [intelligence/learned-skills](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills) | `/intelligence/learned-skills` | `sample_agent` | ❌ Broken | New 2026-09-15. Every Python adapter 404s on PyPI; the BuiltInAgent row added 2026-09-21 needs runtime 1.73.0, which the page does not name (compiles here since the 2026-09-23 upgrade to 1.73.3) — §9 #26, #38 |
| [learning](https://docs.copilotkit.ai/deepagents/learning) | `/learning` | `sample_agent` | ❌ Broken | New 2026-09-11. Page's runtime throws at load without `CPK_INTELLIGENCE_API_KEY` (route 500); `agents`/`identifyUser` undefined; needs runtime 1.70+ — §9 #24, #25, #27 |
| [custom-look-and-feel/markdown](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown) | `/custom-look-and-feel/markdown` | `sample_agent` | ⚠️ Partial | New 2026-09-21. All three blocks ask for the agent id `default` and throw; none carries `use client`; the headline example styles with classes the page never defines. With `agentId` added every claim about the props holds, read off the rendered HTML — §9 #32 |
| [cookbook/jev-generative-ui](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui) | `/cookbook/jev-generative-ui` | — | ❌ Broken | New 2026-09-21. Needs `@typesafe-ai/sdk` + a TypeSafe vendor key and `@langchain/openai`, none of which exist here; pins ten exact versions, six unmet. Every block typechecks on the installed 1.71.0 anyway. No demo, no recorder entry — §9 #33 |
| [threads-lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle) | `/threads/lifecycle` | `sample_agent` | ⚠️ Partial | Tracked 2026-09-21. Mint, replay, switch and the prop-controlled no-op observed; the remount keeps the id under `<CopilotKit>`, contrary to the page's warning; `existingId` undefined — §9 #35 |

**Totals:** 14 ✅ Working · 4 ⚠️ Partial · 0 📄 Reference · 6 ❌ Broken · 1 🚧 Not started.

**Tracked without a demo.** The 🚧 row and the Jev cookbook row carry a route, a nav entry and a snapshot so drift is watched, but there is no `/demo-chat` behind them and the recorder does not touch them. `npm run drift` therefore lists three `[no-recorder]` coverage gaps: `/webmcp`, `/shared-state/workflow-execution` and `/cookbook/jev-generative-ui`. All three are deliberate, and each one's reason is on its own route page and in §7. The rest of `/deepagents/intelligence/` is the old `/deepagents/premium/` set under a new prefix and stays in `doc-snapshot/manifest.json`’s `knownUnmapped` list. So do the Rich Threads pages other than `/deepagents/threads-lifecycle`.

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

**13. The manual-emission variant of predictive-state-updates is not complete in Python.**
It shows a bare node with no `StateGraph`, no `add_node`, no `compile`, omits the model call and the return, returns `Command[Literal["cpk_action_node", …]]` naming a node that appears nowhere on the page, and uses `asyncio`, `Command`, `Literal` and `RunnableConfig` without importing any of them.

*Narrowed on 30 Aug.* This used to read "neither variant". The tool-emission tab was rewritten that day and is now complete on its own — imports, `AgentState`, tool, node, router, `StateGraph` and `compile` all printed — so only the manual-emission tab is still missing its scaffolding. The rewrite introduced a separate, worse problem; see item 14.

**Both are live here anyway**, because the missing half is on the *same page's TypeScript tab*, which prints the annotation, wiring and `compile` in full. So each graph is the Python tab's node body inside the TypeScript tab's scaffolding — two tabs of one page, no third source. The unreachable `cpk_action_node` is dropped from the signature, since the graph goes straight to `END` exactly as the TypeScript one does.

One further note. The tool-emission variant binds `state["copilotkit"]["actions"]` straight into `bind_tools` as though those were LangChain tools; its TypeScript tab wraps them in `convertActionsToDynamicStructuredTools` first, and nothing in the Python package does that conversion — harmless here only because no frontend tools are registered against that graph.

The "it needs no `ToolNode`" note that used to sit here is gone: since 30 Aug the tool takes a `ToolRuntime` and returns a `Command`, so it really executes, and the page now wires a real `ToolNode` with a `route_after_chat` conditional edge to run it.

**14. The Python LangGraph API rejects a checkpointer; the JS one does not — and since 30 Aug the Python tab tells you to use one.**
This used to require cross-reading: the *TypeScript* tab compiled both custom graphs with a `MemorySaver` and the Python tabs simply omitted the `compile`. The 30 Aug rewrite of the tool-emission tab ends its own Python snippet with `graph = workflow.compile(checkpointer=MemorySaver())`, so the published Python now fails as published. Do it and the dev server refuses to start: *"Your graph 'graph' … includes a custom checkpointer … With LangGraph API, persistence is handled automatically by the platform … please remove the custom checkpointer."* It is a hard `ValueError` at graph-load time, not a warning — and it is not scoped to the offending graph. Startup aborts for the whole application, so all fifteen graphs in `langgraph.json` go down together and *every* route in this harness becomes unreachable, not just predictive-state-updates. Verified against `langgraph-api` 0.12.0.

Both graphs here therefore call `workflow.compile()` bare and let the server provide persistence. That is the one line of the otherwise-verbatim 30 Aug snippet that is not reproduced: this repo keeps broken pages broken so a clip can show the defect, but a defect that stops the server booting cannot be filmed — it only removes every clip. The JS dev server accepts the same `MemorySaver` without complaint.

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

### New upstream 2026-09-11

Three pages identical under every framework prefix. Verified against `@copilotkit/react-core` and `@copilotkit/runtime` **1.71.0** (what CI resolved then; the lockfile pinned 1.69.0 until the 2026-09-23 upgrade to 1.73.3), a live `langgraph dev`, and an OpenAI key. This harness has **no** `CPK_INTELLIGENCE_API_KEY`, locally or in CI.

**22. Frontend-Driven Cards: the published code targets an agent called `default`, which Deep Agents does not have.**
[Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards) step 2's provider sets only `runtimeUrl` and `renderActivityMessages`; step 3's `useAgent()` and step 2's `<CopilotChat />` pass no agent id, so both resolve to `"default"`. The Deep Agents runtime registers its LangGraph graphs by graph id — the Quickstart's is `sample_agent` — so once `/info` answers, `useAgent()` throws `Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit). Known agents: [sample_agent, …]`. It is a plain `Error`, not a `CopilotKitError`, so the provider's own error boundary rethrows it and the route goes down (3/3 loads, ~150 ms after `/info`). The demo wraps that tab in a harness error boundary to print the message. Adding the Quickstart's `agent="sample_agent"` to the provider is the only change needed: then the central claim holds — with a card in the transcript the request to `/agent/sample_agent/run` carried only `user`, and the agent said it had been shown no card. Two further findings on that working tab: a card added before the runtime connects goes to a provisional agent (`isReady: false`) and is silently dropped when the real one replaces it (3/3 with `/info` held back 4 s), which the page never warns about; and step 3's `<DeploymentWatcher />` is never mounted by step 2, while its `wss://example.com/deployments` placeholder 404s the handshake.

**23. Memories & Recall: on the Deep Agents runtime memory fails silently.** *(The import half of this item was fixed upstream on 2026-09-21.)*
[Memories & Recall](https://docs.copilotkit.ai/deepagents/intelligence/memories) used to import `useMemories` from `@copilotkit/react-core`, which has no such export on 1.69.0 or 1.71.0; it ships from `/v2`. That was TS2305 plus a knock-on TS7006, and a Turbopack compile error for any route importing it. The published line now reads `@copilotkit/react-core/v2`, so `memory-list.tsx` is the page's file unmodified, it compiles, and the demo imports it instead of carrying a corrected copy. The rest of this item stands. On the Quickstart's runtime (not an Intelligence runtime) the client memory store never gets a context, because on 1.71.0 it only does when `/info` advertises an Intelligence socket. So no `/memories` request is ever sent, `isAvailable` stays `true`, the page's component renders an empty list instead of its "Memory is not available" branch, and `addMemory` fails with "Runtime URL is not configured" — about a URL that is configured. The page never says memory needs an Intelligence runtime. Even on one, every `/memories/*` route 404s unless `CopilotRuntime` gets `memory: { access }` (or the deprecated `exposeMemoryRoutes`), a secure default present on 1.69.0 and 1.71.0 alike that the page never mentions; `curl /api/copilotkit/memories` → 404 here. The mount that adds it needs an Intelligence key and answers 503 without one, so entitlement behaviour (Agno-react saw `403 MEMORY_NOT_ENTITLED`) was not reproduced here. `realtimeStatus` stayed `connecting`. The agent answers "Got it! I'll keep updates brief." to a memory request it cannot fulfil.

**24. Learning: the runtime snippet throws at load without a key, and leans on two undefined identifiers.**
[Learning](https://docs.copilotkit.ai/deepagents/learning)'s `new CopilotKitIntelligence({ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!, … })` throws "CopilotKitIntelligence `apiKey` is required and cannot be blank" at import time when the key is absent; the `!` hides that from the type checker, and the page never names the key as a prerequisite. Mounted here on its own route, `/api/copilotkit-learning/info` answers 500, the provider sits in `error`, and neither `expense-agent` nor `sample_agent` can send. Mounted on a shared runtime it would take down every chat. The snippet also uses `agents` and `identifyUser` without defining them (supplied in `lib/learning-runtime.ts`, marked), and `getLearningContainerId` does not exist before runtime 1.70 — on 1.69.0 (this repo's lockfile until 2026-09-23; now declared `^1.73.3`, installed 1.73.3) only the `ɵlearning` option exists, which the page's prompt tells you not to use. Container assignment itself (Agno-react, with a key, found that the example container `expense-review` not existing makes every run on the assigned agent fail with "Failed to initialize thread") was not reachable here.

### New upstream 2026-09-21

Five pages moved: the landing page, Quickstart, Memories & Recall, Learning and Skill delivery (then titled "Automatic learned skill delivery"). Verified against `@copilotkit/runtime` and `@copilotkit/react-core` **1.71.0 installed** (`frontend/package.json` declares `^1.69.0`; `frontend/package-lock.json` pins 1.69.0; `frontend/VERSIONS.md` records 1.71.0 as what the last run resolved), `ai` **6.0.244** and `@ai-sdk/openai` **3.0.90** (both present only as transitive deps of `@copilotkit/runtime`, neither declared), Next **16.3.0**, React **19.2.8**, `copilotkit` (PyPI) **0.1.94**, `deepagents` **0.7.4**. This harness has **no** `CPK_INTELLIGENCE_API_KEY`, locally or in CI.

**25. Harness deviation, previously undeclared: the Learning selector shipped here is not the page's.**
Not a doc bug: a silent fix in this repo, recorded now rather than reverted. [Learning](https://docs.copilotkit.ai/deepagents/learning) publishes `getLearningContainerId: ({ agentId }) => agentId === "expense-agent" ? "expense-review" : undefined`. `frontend/src/lib/learning-runtime.ts` has returned the constant `"firstlearningtest"` for every agent since 1e4a837, with no comment above it, no note in that commit and no entry here, while the file's own header still called the block verbatim. The demo's panel printed the published return values over it, so the recorded take asserted an assignment the code does not make. Both are fixed: the header and an inline comment now quote the published selector, and the panel prints the page's value and this runtime's side by side. The behaviour is unchanged because the container name is an account-scoped choice this harness cannot second-guess. **Whoever owns the recording project should decide whether to restore the published selector.** Consequence while it stands: the agent-conditional branch the page is teaching is never exercised, and `sample_agent`, which the page leaves unassigned, is assigned here.

**26. Skill delivery: the one adapter whose package exists does not compile.** *Resolved at 1.73.3; failed at 1.71.0; the doc states no minimum version.*

*Re-verified 2026-09-23 after upgrading to `@copilotkit/runtime` **1.73.3** (declared `^1.73.3`): both snippets, updated to the 2026-09-23 text, and the `BuiltInAgentFactoryContext` import typecheck, so `tsc` flagged the three `@ts-expect-error` lines as unused and they were removed. Nothing below is withdrawn: it is what a reader on 1.72 or older still gets, with no version on the page to tell them why. `ai` 6.0.244 and `@ai-sdk/openai` 3.0.90 are still transitive only.*

[Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills) gained a **BuiltInAgent** row on 2026-09-21, packaged as `@copilotkit/runtime/v2`, the package this repo installs, and the only row not requiring a 404 PyPI download (see the rest of that page's table, still absent as of 2026-09-16). It does not typecheck against the installed 1.71.0:

```
built-in-agent-classic.ts(6,3): error TS2353: Object literal may only specify known properties,
  and 'learnedSkills' does not exist in type 'BuiltInAgentConfiguration'.
built-in-agent-factory.ts(11,3): error TS2353: … does not exist in type
  'BuiltInAgentClassicConfig | BuiltInAgentAISDKFactoryConfig'.
built-in-agent-factory.ts(12,35): error TS2339: Property 'learnedSkills' does not exist on
  type 'AgentFactoryContext'.
built-in-agent-factory.ts(3,3): error TS2724: '"@copilotkit/runtime/v2"' has no exported member
  named 'BuiltInAgentFactoryContext'. Did you mean 'AgentFactoryContext'?
```

`learnedSkills` is absent from 1.71.0 and 1.72.0 and first appears in **1.73.0**, published 2026-09-19, two days before the page went live with it. The page states exact dependency ranges for every framework adapter below this row (LangChain `>=1.2.16,<2`, Mastra `>=1.0.0,<2`, `google-adk>=1.17,<2`, .NET 9) and no version at all for the CopilotKit one. Three further defects in the same section: the prose says "Every factory receives a `learnedSkills` object" when no factory context carries it on the shipped version; it tells you to import `BuiltInAgentFactoryContext`, which is not an export (`tsc` suggests `AgentFactoryContext`, which is the type the factory argument really has); and the factory snippet imports `ai` and `@ai-sdk/openai` with no install step anywhere on the page. Both snippets are in the repo verbatim, imported by nothing, errors acknowledged in place. The same sync also split the "Read tools" rule in two: framework adapters keep both tools registered on an empty snapshot, BuiltInAgent omits them, so whether a reserved tool name exists depends on which row you took.

**27. Learning's new delivery steps point at an adapter this backend cannot install.**
The 2026-09-21 sync replaced Learning's one-line pointer to learned-skills with a three-step **Set up automatic skill delivery** section (retitled **Set up skill delivery** on 2026-09-23). Step 2 prints an **Agent server environment** block (`CPK_INTELLIGENCE_API_KEY`, `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review`) and sends you to the framework adapter examples for "LangGraph Python, LangGraph TypeScript, Mastra, Google ADK, or Microsoft Agent Framework", a list that omitted BuiltInAgent, the only row of that table with a CopilotKit package. *(2026-09-23: that list is gone. Step 2 now says "Pick the adapter for the agent you already run.", and a new "Collect runs and deliver Skills" section names BuiltInAgent among the adapters the delivery guide "also covers". The omission is fixed; the rest of this item stands, and see #38 for what the new section recommends.)* For a Deep Agents backend the named adapter is the Python one, which is 404 on PyPI, so the environment block configures nothing and step 3's "Verify delivery in a new invocation" has nothing to verify. The step's own links resolve: `#native-setup`, `#configure-one-container` and `#deployment-requirements` all exist on the target page. Everything else the section adds is dashboard-only: the **Skill delivery** toggle, **Set up skill delivery**, **Edit schedule**, **Next scheduled run**, **Start manual run now**, **Analysis results**, the 15-eligible-Thread threshold and the 02:00 UTC default. All of it needs a provisioned project and a login this harness does not have. Two of the three new troubleshooting rows are about that surface.

**28. The Introduction page and the Quickstart publish the same filename with different code.**
Since 2026-09-21 [the landing page](https://docs.copilotkit.ai/deepagents) ends with a code block titled `app/api/copilotkit/[[...slug]]/route.ts`, and its `connect.filename` names the same path. The [Quickstart](https://docs.copilotkit.ai/deepagents/quickstart)'s Deep Agent tab titles its block identically and contains something else. Three differences, none acknowledged on either page: the landing version has no `intelligence` and no `identifyUser` (the two options the Quickstart *highlights*, and whose removal its own callout describes as the SSE fallback, so the Introduction teaches the fallback as the default without saying so); it writes `process.env.LANGGRAPH_DEPLOYMENT_URL!` and `process.env.LANGSMITH_API_KEY!` where the Quickstart defaults both (`|| "http://localhost:8123"`, `|| ""`), so following the Introduction alone passes `undefined` under a type that promises a string, which a local `langgraph dev` (no LangSmith key needed) hits immediately; and it exports `PATCH` and `DELETE`, which the Quickstart's does not. This repo keeps the Quickstart's version widened to every graph in `langgraph.json`, stated at the top of that file; both blocks are printed side by side on `/`. One path, two published bodies, no way to implement both.

**29. The Quickstart still tells you to create a file its own code blocks contradict.**
Its runtime step opens with `mkdir -p app/api/copilotkit && touch app/api/copilotkit/route.ts` and then prints both tabs under the title `app/api/copilotkit/[[...slug]]/route.ts`. The landing page's new block and `connect.filename` agree with the titles, leaving the shell line as the only place in the section naming a plain `route.ts`. The two cannot both be followed: a plain `route.ts` serves no `/info`, so the client falls back to the single-route POST transport, and from `@copilotkit/core` 1.70.2 that path throws on a relative `runtimeUrl` before the agent runs (the mechanism already documented in this repo on `/api/copilotkit-a2ui-dynamic`); creating both files instead puts a plain route beside an optional catch-all in one Next.js segment, which Next rejects. *(Checked against the unchanged text of this sync's snapshot, and not new in it, recorded now because the landing page made the section's filename explicit.)*

**30. The Quickstart's two `.env` files have the same caption and different homes.**
Step 6, "Configure your environment", says to create a `.env` **in your agent directory** holding `OPENAI_API_KEY`. The runtime step now prints a second block also captioned `.env`, holding `CPK_INTELLIGENCE_API_KEY`, which belongs to the **frontend app** three steps and one `cd` later. Before this sync that block was captioned `.env.local`, which at least distinguished it. Nothing in either caption says which directory. Put the project key in the agent's `.env` and the Next runtime never reads it, silently. The step also stopped telling you to write the key at all and now says to run `npx copilotkit@latest project select`, which needs an Intelligence account and was not run here. Step 1, renamed from "Create a free account" to "Set up CopilotKit Intelligence", now states that managed setup "does not issue `COPILOTKIT_LICENSE_TOKEN`", a variable named nowhere else on the page, so the only thing a first-time reader learns about it is that they will not get one.

**31. Harness gap, now closed: the learned-skills route had no nav entry.**
`/intelligence/learned-skills` was added in 2fe4933 with a route, a demo and a recorder entry, but was never registered in `frontend/src/lib/nav-config.ts`. Its `RouteHeader` therefore rendered "No nav entry registered for /intelligence/learned-skills" instead of a title, status badge and doc link; it was absent from the sidebar, from `/status` and from every table in this README. Neither the drift gate nor `check-page-coverage.mjs` looks at the nav, so both stayed green. Registered now, and the §7, §8 and §12 entries added.

### Tracked 2026-09-21: two pages live upstream, tracked nowhere

Both were in the sitemap and in no manifest, so the harness had no route, no recorder entry and no diff for either. Snapshotted, added to `doc-snapshot/manifest.json` and implemented on the same day. Verified against **@copilotkit/react-core** and **@copilotkit/runtime** 1.71.0 installed (`frontend/package.json` declares `^1.69.0`), **zod** 3.25.76, **streamdown** 1.6.11, **@ag-ui/client** and **@ag-ui/core** 0.0.59, **rxjs** 7.8.1, **@langchain/core** 1.2.10, Next **16.3.0**, React **19.2.8**. `@typesafe-ai/sdk` and `@langchain/openai` are absent and were not installed. This harness has **no** `TYPESAFE_API_KEY` and **no** `CPK_INTELLIGENCE_API_KEY`.

**32. Markdown Rendering: correct about everything except how to run it.**
[Markdown Rendering](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown) was live upstream and tracked nowhere in this repo until 2026-09-21. Its subject checks out in full. Read out of the shipped `@copilotkit/react-core` **1.71.0** bundle: a string slot value is `twMerge`d onto the renderer's own `className`; a component slot is created with the bound props and nothing else, and those props are exactly `{ content: message.content || "" }`; an object slot is spread over the default renderer, which forwards everything but `content` to `<Streamdown>`. The link-hardening claim holds too, by a route the page does not mention — `target="_blank" rel="noopener noreferrer"` comes from `rehype-harden` **1.1.8**, one of Streamdown's default rehype plugins, which writes them onto the tree, so an override that spreads its props keeps them (Streamdown's own `MarkdownA` hardcodes the weaker `rel="noreferrer"` and is overwritten by the same spread). `Components` in **streamdown 1.6.11** is keyed by `keyof JSX.IntrinsicElements`, so the custom-tag example produces precisely the `TS2353 … '"reference-chip"' does not exist in type 'Components'` the page prints. Four things are wrong with it as a set of instructions:

- **All three blocks target an agent called `default`.** Each is a bare `<CopilotChat>` carrying only `messageView`, so `agentId ?? config ?? provider ?? DEFAULT_AGENT_ID` resolves to `"default"` and `useAgent` throws once `/info` answers. This is §9 #22 on a second page: the Deep Agents Quickstart registers its graphs by graph id (`sample_agent`) and has no `default`. Adding `agentId="sample_agent"` is the only change the rest of the page needs, and the page never mentions an agent id at all.
- **No block carries `"use client"`.** Each is titled `page.tsx` and passes inline arrow functions to a client component; under the App Router that file is a Server Component and the render is refused.
- **The headline example changes nothing you can see.** `components` is what the page says to reach for first, and its example sets `className="my-link"` and `className="my-heading"`. Neither class is defined anywhere on the page, and in a Tailwind project — which the `text-sm leading-7` example two sections later assumes — neither matches a utility. Followed exactly, it replaces two working components with two that carry no styling at all.
- **"Drop `node`" is a lint warning in a stock Next project.** The advice is right (spread `node` and the renderer writes `node="[object Object]"` into the document) but destructuring a name and never using it is what `@typescript-eslint/no-unused-vars` reports, and the config `eslint-config-next` ships with does report it: `'node' is defined but never used`, once per overridden tag. Four of them here. The snippet is shipped unchanged and the warnings stand.

**What was and was not executed.** Everything above is either read out of the shipped packages or produced by `tsc` / `eslint`. No dev server and no `langgraph dev` were started for this item, so the `default`-agent throw is asserted from the resolution path in the 1.71.0 bundle plus the identical defect already reproduced 3/3 on `/generative-ui/frontend-cards`, not from a run of this route; the same goes for the Server Component refusal. The route's five demo tabs and its probe have not been driven, and no clip exists yet. The probe rows in §7 are what the take should show, not what it did show.

Two smaller ones. The page's custom-tag example raises a second error it does not print, `TS7031: Binding element 'children' implicitly has an 'any' type`, because an unknown key carries no contextual type. And `streamdown` is not a dependency of this repo at all — it is reachable only because `@copilotkit/react-core` hoists it — so the page's core mechanism rests on a package a reader's `package.json` never names. Checked against **@copilotkit/react-core 1.71.0** installed (declared `^1.69.0`), **streamdown 1.6.11** (undeclared, transitive), **rehype-harden 1.1.8** (undeclared, transitive), Next **16.3.0**, React **19.2.8**.

**33. Jev: fast generative UI — a cookbook recipe under `/deepagents` that uses no Deep Agent, pinned to versions this repo does not have, gated on a third-party vendor key.**
[Jev: fast generative UI](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui) was live upstream and tracked nowhere in this repo until 2026-09-21. Nothing was installed and no version was bumped to assess it. Every published TypeScript block is in the repo verbatim under `frontend/src/app/cookbook/jev-generative-ui/`, four of them imported by nothing, and the whole set typechecks.

- **The install line pins ten exact versions; six are not met here.** *(Re-checked 2026-09-23 after the upgrade: the three `@copilotkit/*` pins of 1.73.0 now meet **1.73.3** installed, declared `^1.73.3`, still not the exact pin; `@langchain/core` is now **1.2.12**, still not 1.2.11; every block still typechecks. Still six unmet.)* `@copilotkit/core@1.73.0`, `@copilotkit/react-core@1.73.0`, `@copilotkit/runtime@1.73.0` against **1.71.0** installed (`frontend/package.json` declared `^1.69.0`); `zod@4.6.5` against **3.25.76** installed (declared `^3.25.76`), a major version; `@langchain/core@1.2.11` against **1.2.10**; `@typesafe-ai/sdk@0.6.0` and `@langchain/openai@1.5.13` **absent**. Three do match exactly — `@ag-ui/client@0.0.59`, `@ag-ui/core@0.0.59`, `rxjs@7.8.1` — which is what makes the AG-UI half worth compiling: it is being checked against precisely the AG-UI the recipe asks for. **Five of the ten are undeclared here**, present only as transitive dependencies of `@copilotkit/*`: `@copilotkit/core`, both `@ag-ui/*`, `rxjs` and `@langchain/core`. And the 1.73.0 floor is never justified — every block, including the runtime registration and the whole of `app/page.tsx`, typechecks on 1.71.0, so a reader cannot tell whether the pin is a requirement or the author's lockfile.
- **It needs a vendor key, and the recipe's own error handling hides that it is missing.** `TYPESAFE_API_KEY` comes from TypeSafe through their quickstart, not from CopilotKit. The last step is "Start your development server and open the page", with no check that either key is set. The published `run` wrapper catches every error with a parameterless `.catch(() => …)`, discards it, and emits a fixed `RUN_ERROR` reading "The picker could not finish. Try again." A missing key, an unreachable vendor and a genuine bug are one sentence, and "Try again" is advice that can never work.
- **Nothing in the recipe is a Deep Agent.** "Deep Agents", "LangGraph" and "Python" appear nowhere in the body. The agent is a hand-written TypeScript `AbstractAgent` inside the Next app, and step 4 replaces `app/api/copilotkit/[[...slug]]/route.ts` — the file the Deep Agents Quickstart tells you to create pointing at `langgraph dev` — with one registering `new PickerAgent()` and reaching no backend. This harness runs a Python backend on `:8123`, so **the recipe's stack is not reachable from this integration at all**: there is no step connecting the two and the page never says one is needed. Following it inside a Deep Agents project means deleting the integration the section documents.
- **The shared-state claim is accurate and beside the point.** The opening callout says "This recipe renders [shared agent state](/deepagents/shared-state)", and on the React side it does: `useAgent({ agentId: "picker" })` then `agent.state` is what `/shared-state/in-app-agent-read` teaches and this repo has working. It does not contradict those pages, it bypasses them — shared state under `/deepagents` is a Python concern (the state class on the graph, `CopilotKitMiddleware(expose_state=[…])`, `copilotkit_emit_state`), and none of it exists in an agent that emits its own `STATE_SNAPSHOT` from TypeScript. So the one prerequisite this repo found missing from both shared-state pages, `expose_state`, is silently irrelevant here, and `StateSchema` is zod-enforced on both ends of the wire, which those pages never do. The callout's other link, `/deepagents/concepts/generative-ui-overview`, resolves (200) but is tracked nowhere here and sits on the acknowledged-unmapped list.
- **The optional half rests on three things already filed as broken.** "Optional: improve decisions and UI with Automatic Learning" routes through [Learning](https://docs.copilotkit.ai/deepagents/learning) (§9 #24, ❌ here), [Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills) (§9 #26, ❌ here) and `/deepagents/intelligence/quickstart` (a page this repo deleted its route for and does not track). It also says to install `@copilotkit/intelligence-langgraph@1.71.2` "alongside the pinned stack above" — a 1.71.2 pin beside three 1.73.0 pins from the same package family, with no note that they differ.
- **Smaller ambiguities.** `choosePanel` validates every candidate fit score and throws on a missing one *before* checking whether the control was `agent`, so on the branch where Jev says the prepared controls do not apply, an absent score still kills the run and the user gets the generic `RUN_ERROR` above. `respond` passes a hardcoded `[]` for `publishedGuidance`, a parameter threaded through three functions and always empty until the optional section replaces it. And both multi-block files are syntactically incomplete until their last block is pasted, so no block on the page can be checked on its own — the page says so, which makes it stated rather than hidden, not absent.

**Harness deviations on this route, all declared in the files as well.** Every published block keeps its content; what changed is where the files live and what imports them. The recipe's `lib/*.ts` and `app/page.tsx` are under the route instead (this is one app across twenty-three doc pages), so the relative import specifiers differ; `runtime-route.ts` and `picker-page.tsx` are deliberately not named `route.ts`/`page.tsx`, because as published they would replace this repo's own runtime and mount a form whose every submit fails; and `@ts-expect-error` sits on exactly the two import lines whose packages are absent, which is also the assertion that they are (installing either makes `tsc` fail on an unused directive). One real duplication: `readAction` exists twice, verbatim in `picker-agent.ts` where the page puts it and again in `read-action.ts` so it can actually run, because two *other* functions in that file need the absent packages. If the page's version changes, both change.

**34. Harness note: the new Markdown Rendering recorder entry is in the `generative_ui` dispatch group.**
Not a doc bug. `markdown-rendering` is a Custom Look and Feel page and belongs in a group of its own in `ci/lib/pages.mjs`. It cannot have one: six groups plus `pages`, `use_lockfile`, `run_mode` and `custom_args` is already exactly GitHub's ten-input `workflow_dispatch` cap, so a seventh checkbox means dropping an existing input. Recorded here because a page filed under the wrong checkbox is the kind of thing that looks like a mistake later. Also on the same route: the `?tab=` effect in its demo carries an `eslint-disable-next-line react-hooks/set-state-in-effect`, where the identical effect in `frontend-cards/demo-chat` leaves the rule firing — silenced rather than adding a third copy of an error this repo already has two of.

---

**35. Thread & History Lifecycle: the switch snippet's `existingId` is never defined, and the remount warning does not hold under `<CopilotKit>`**

[Thread & History Lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle) publishes `ThreadControls` calling `config?.setActiveThreadId(existingId, { explicit: true })`. `existingId` appears nowhere else on the page, and nothing says where an app gets the id of a conversation worth re-opening. The demo supplies the first thread that held a conversation, as a prop, with `!` because the button stays disabled until one exists; both handler calls are otherwise the page's text, and the published lines are quoted above them in `frontend/src/app/threads/lifecycle/demo-chat/page.tsx`.

The page's warning "Auto-minted ids are stable across re-renders, but re-mint on remount" is stated unconditionally. Under the v2 `<CopilotKit>` wrapper, which this repo's providers use, there is always a parent id, so a remount does not re-mint and the warning describes something that does not happen. The page lists the precedence rule that explains it but never connects the two, so a reader who remounts to "start a new conversation" gets the same `threadId` back with an empty view.

The rest of the client lifecycle was observed by the recorder on CI-resolved `@copilotkit/react-core` 1.73.0 (declared `^1.69.0`), with the runtime on `InMemoryAgentRunner`: an auto id with `hasExplicitThreadId` false; a remount *keeping* the id, because this app's root `<CopilotKit>` supplies a parent `CopilotChatConfigurationProvider` and the chat inherits its `threadId` (the page's precedence rule 3), while the conversation still leaves the screen, since an inherited id is not explicit and nothing replays it; `setActiveThreadId(id, { explicit: true })` returning to the first thread and replaying both of its messages from the runner's `connect()`; `startNewThread()` minting a fresh non-explicit id; and, with a `threadId` prop pinned, `startNewThread()` changing nothing and logging `[CopilotKit] Ignoring startNewThread(): threadId is controlled via the threadId prop on CopilotChatConfigurationProvider.`, with the pinned id surviving a remount. Not exercised: `identifyUser` and Intelligence scoping, the headless first-message path, and the framework checkpointer layer.

### Findings from the 2026-09-22 sync

Four pages moved, all renames: Learning is now "Automatic Learning", Memories & Recall is now "User Memories", and Quickstart's Inspector check says "Rich Threads" where it said "Threads". No code block changed; the nav titles and recorder names here follow the new names (clip filenames are unchanged). Two pages were new upstream: `/deepagents/backend/message-history` is now tracked and built (#37), and `/deepagents/intelligence/self-hosting-ecs` is acknowledged in `sitemap.knownUnmapped` beside the self-hosting page it sits next to. Versions: `@copilotkit/react-core` and `@copilotkit/runtime` **installed 1.71.0, declared `^1.69.0`**; `@copilotkit/web-inspector` **installed 1.71.0, not declared** (transitive); latest on npm **1.73.0**.

**36. Two pages now send you to Inspector tabs that do not exist** *Resolved at 1.73.1; failed at 1.71.0 and 1.73.0; the doc states no minimum version.*

*Re-verified 2026-09-23: `@copilotkit/web-inspector` 1.73.1, 1.73.2 and the installed **1.73.3** (transitive, not declared) label the tabs `label: "Rich Threads"` and `label: "Automatic Learning"`, read from the package and the published tarballs; 1.73.0 still says `Threads` and `Learning`. The text below is what was observed on 1.71.0.*

[Quickstart](https://docs.copilotkit.ai/deepagents/quickstart)'s verification step now says to open **Rich Threads** in Inspector, and [Automatic Learning](https://docs.copilotkit.ai/deepagents/learning)'s callout says to go to **Automatic Learning**. The Inspector still labels those tabs `Threads` and `Learning`: `label: "Threads"` and `label: "Learning"` in `@copilotkit/web-inspector` 1.71.0 (installed) and in 1.73.0 (latest on npm, read from the tarball). The live [/deepagents/inspector](https://docs.copilotkit.ai/deepagents/inspector) page (untracked here) has already switched to **Rich Threads** and **Automatic Learning** throughout, while the `/agno` and `/ms-agent-python` copies of the same page still say **Threads** and **Learning** (checked 2026-09-22). So the rename runs ahead of the product, and is applied unevenly across integrations.

**37. Message history: the recommended recipe is a prop no release has, and the runtime recipe needs an endpoint Deep Agents does not serve** *The `messageFilter` half: resolved at 1.73.3 (type level); failed at 1.71.0 and 1.73.0; the doc states no minimum version.*

*Re-verified 2026-09-23 after upgrading to `@copilotkit/react-core` **1.73.3** (declared `^1.73.3`): `messageFilter` is declared on `<CopilotKit>` from **1.73.1** (published 2026-09-22), not in 1.73.0, read from the published tarballs. `tsc` flagged the demo's `@ts-expect-error` as unused, as the text below predicted, and it was removed. The prop's runtime behaviour (request body trimmed, tool-call pairs repaired) has not been re-observed here. The runtime-recipe half of this item is unchanged.*

[Message history](https://docs.copilotkit.ai/deepagents/backend/message-history) is new, and identical to the `/agno` copy apart from links. Its first recipe, which it calls the one "most applications need", is `messageFilter={(messages) => messages.slice(-1)}` on `<CopilotKit>`. No published `@copilotkit/react-core` declares it: not the installed **1.71.0** (declared `^1.69.0`) and not **1.73.0**, the latest on npm (published 2026-09-19); no file under `node_modules/@copilotkit` or `node_modules/@ag-ui` mentions `messageFilter`. So it is a type error and, at runtime, an ignored prop, and everything the page says it does (shrinking the request body, repairing split tool-call pairs, surviving agent replacement) does not happen. It is mounted verbatim on the demo's second tab under a `@ts-expect-error`, so the typecheck fails the day a release ships it. The middleware half works: `trim-history.ts` compiles on `@ag-ui/client` **0.0.59** (not declared; transitive), and the page's own check script prints `trim-history: forwarded only the answered call, next to its result`. The check script's `answers.add(trimmedParallel[i].toolCallId)` is `TS2339` as published, because the loop condition narrows `trimmedParallel[i]?.role` and not the element read again (acknowledged in place). The `selfManagedAgents` recipe is quoted, not mounted: its agent URL is a placeholder.

The runtime recipe is `new HttpAgent({ url: process.env.AGENT_URL! })`, which assumes an AG-UI HTTP endpoint. This integration has none: `langgraph dev` on `:8123` speaks the LangGraph Platform API, reached with `LangGraphAgent`, as the Deep Agents Quickstart does. The page never says what `AGENT_URL` is and there is nothing here to point it at, so `/api/copilotkit-trimmed` keeps the line verbatim, leaves the variable unset, and its `default` agent fails. The page's own claim that `.use()` is on `AbstractAgent` "so this works for any agent" does hold: the route also registers the Quickstart's `LangGraphAgent` as `sample_agent` with the same `TrimHistoryMiddleware(lastTurnOnly)` (marked NOT FROM THE PAGE), and that is what the demo's runtime tab talks to.

**Observed 2026-09-22 with curl on a live `langgraph dev`** (answers are the concatenated text deltas, verbatim). One run carrying *My name is Sam. Just say ok.* / *Ok.* / *What is my name? If you do not know, say UNKNOWN.*: the trimmed runtime's `default` agent returned `RUN_ERROR` `"Cannot read properties of undefined (reading 'toString')"` (2/2); its `sample_agent` answered `UNKNOWN` (3/3); the untrimmed `/api/copilotkit` `sample_agent` answered `Sam` (3/3). So the middleware really drops the earlier turns. Two runs on one threadId through the trimmed runtime, the first carrying only the first user message and the second all three: `Ok`, then `Sam` (3/3). LangGraph's checkpointer holds the first turn, so on a real thread trimming loses nothing, which is the case the page is written for (it names a LangGraph checkpointer among its history-keeping backends). Two side notes. On the untrimmed two-run control the thread ended up with the transcript's `Ok.` stored as a second AI message beside the model's own reply, while the trimmed thread held exactly four messages; the curl transcript's assistant id was one the server never issued, so this is a property of the hand-built transcript, not something a browser session was seen to do. And the `RUN_STARTED` event's `input` still echoes all three messages on the trimmed runtime: the middleware rewrites what the agent receives, not what the event reports. The browser tabs have not been driven. The route is in `SKIP_RECORDING` by owner instruction until recording is turned on.

### Findings from the 2026-09-23 sync and the 1.73.3 upgrade

Seven pages moved: Skill delivery (retitled from "Automatic learned skill delivery" and largely rewritten), Automatic Learning, User Memories, Quickstart, Thread & History Lifecycle, Message history and Jev. `/deepagents/intelligence/analytics`, `/intelligence/channels` and `/intelligence/plans` are new upstream and acknowledged in `sitemap.knownUnmapped` as reference-only (nothing to record); `/deepagents/intelligence/connect-your-runtime` was removed from that list because it now 404s. On the same day `@copilotkit/*` was upgraded: **declared `^1.73.3` · lockfile 1.73.3 · installed 1.73.3** for `react-core`, `runtime` and `a2ui-renderer` (was declared `^1.69.0` · lockfile 1.69.0 · installed 1.71.0); transitive `@copilotkit/core`, `shared` and `web-inspector` 1.73.3; `ai` 6.0.244, `@ai-sdk/openai` 3.0.90, `@ag-ui/client` 0.0.59, `@langchain/core` 1.2.12 (all transitive); Next **16.3.0**, React **19.2.8**; `copilotkit` (PyPI) 0.1.94 and `deepagents` 0.7.4 untouched. Resolved by the upgrade and marked in place: #26 (BuiltInAgent `learnedSkills`), #36 (Inspector tab labels) and the `messageFilter` half of #37. This harness still has **no** `CPK_INTELLIGENCE_API_KEY`.

**38. Skill delivery: every snippet pins a placeholder revision, and the new setup text has holes.**
- **`revision: "exact-revision-id"` is live in every example.** Until this sync the BuiltInAgent block carried it commented out; now all eight code examples (both BuiltInAgent modes, LangGraph Python and TypeScript, Mastra, ADK, .NET and the new client-reuse block) set it as an active line. The page says to replace it with a published ID or remove it, and its own "Make sure delivery works" section says to remove it because a pinned adapter never moves. Pasted as printed, every example pins to a revision named `exact-revision-id`. The BuiltInAgent files here carry it verbatim.
- **The base Python client is unflagged and 404.** LangGraph Python and Google ADK now open with a "Python adapter pending release" callout. "Python uses `copilotkit-intelligence-runtime`" gets none, and that package is also 404 on PyPI (re-checked 2026-09-23, as are `copilotkit-intelligence-langgraph` and `copilotkit-intelligence-adk`). The adapter table still lists both unpublished adapters with no marker.
- **"Reuse an Intelligence SDK client" sets `apiUrl` without `wsUrl`.** Its `new CopilotKitIntelligence({ apiKey, apiUrl: process.env.INTELLIGENCE_API_URL })` contradicts the [Intelligence quickstart](https://docs.copilotkit.ai/deepagents/intelligence/quickstart): "`apiUrl` and `wsUrl` default to the cloud-hosted service. Set both, or set neither. […] One URL alone leaves the other host on the cloud-hosted service." Only a self-hosted reader sets `INTELLIGENCE_API_URL`, so the block does exactly what the quickstart warns against, for exactly the reader it applies to.
- **The TypeScript adapters hard-pin an older runtime, and the reuse block breaks on a newer one.** `@copilotkit/intelligence-mastra` and `@copilotkit/intelligence-langgraph` are both still **1.71.2** (latest on npm) and each depends on `@copilotkit/runtime` **1.71.2 exactly**, not a range (`npm view`). Verified in a scratch project outside this repo (nothing installed into the harness): with `@copilotkit/runtime@1.73.3` beside `@copilotkit/intelligence-mastra@1.71.2`, npm nests a second runtime 1.71.2 under the adapter, and the page's reuse block fails `tsc` with `TS2322 … CopilotKitIntelligence is not assignable to type … CopilotKitIntelligence. Property '#private' … refers to a different member`. With only the page's Mastra install line, the one runtime is 1.71.2 and it compiles (exit 0). So an app already on the runtime the BuiltInAgent row needs (1.73.0+) cannot pass its client to the framework adapters, and the block imports `@copilotkit/runtime/v2` without either install line listing it. The page says nothing about runtime versions for these adapters. Jev's "install `@copilotkit/intelligence-langgraph@1.71.2` alongside" three `@1.73.0` pins (#33) runs into the same nested copy.
- **`npx tsx agent.mts` does not read the key the page tells you to write.** LangGraph TypeScript and Mastra now say to save `agent.mts` and run `npx tsx agent.mts`; the page says `npx copilotkit@latest project select` writes the project key, and the Intelligence quickstart says it "writes it to `.env`". `tsx` does not load `.env`: with `FOO_FROM_DOTENV=1` in `.env`, `npx tsx` 4.23.15 on Node 26.7.0 printed `undefined`. So the example runs without the key unless the reader exports it or adds `--env-file=.env`. That step is not written anywhere.
- **The runnable Mastra example never prints its result.** It ends `const result = await agent.generate("Help with a refund.");`. The LangGraph TypeScript example gained `console.log(result.messages.at(-1)?.content);` in the same sync; Mastra did not, so "Run it with `npx tsx agent.mts`" runs and shows nothing.
- **Placeholders disagree on one page, and with Learning.** "Before you start" exports `CPK_INTELLIGENCE_API_KEY="your-project-key"` and `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID="support-learning"`; "Configure one container" prints `CPK_INTELLIGENCE_API_KEY=cpk-...` and `CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review`; every code example uses `support-learning`. Learning's environment block (now `cpk-...`) uses `expense-review`.

**39. Automatic Learning now recommends the one adapter this page's readers cannot install.**
The new "Collect runs and deliver Skills" section says "For agent setup, use the Mastra, LangGraph TypeScript, or LangGraph Python example", and step 2 of "Set up skill delivery" now says "Pick the adapter for the agent you already run." For a Deep Agents (Python) reader both lead to LangGraph Python, whose package `copilotkit-intelligence-langgraph` is 404 on PyPI and which Skill delivery itself now marks "pending release". Learning carries no such warning. The CLI fallback block also changed from `copilotkit project select` / `copilotkit skills download …` to `npx copilotkit@latest login`, `project select`, `skills download expense-review --output ./learned-skills`; not run here (no Intelligence account).

**40. Plans: "Developer … includes User Memory", while an org on it gets `403 MEMORY_NOT_ENTITLED`.**
The new, untracked [Plans](https://docs.copilotkit.ai/deepagents/intelligence/plans) page says "Every organization starts on **Developer**, which is free and includes Rich Threads, User Memory, Automatic Learning, and Product Analytics." The org this QA effort records against answers `403 MEMORY_NOT_ENTITLED` (reproduced on Agno-react with a key; not reproducible here without one, see #23). User Memories still describes cloud-hosted memory as "resolved per organization from that organization's effective entitlement", so either the plan page overstates Developer or entitlement is not following the plan. Plans is reference-only and acknowledged in `knownUnmapped`, not tracked.

**41. `/deepagents/intelligence/connect-your-runtime` was removed without a redirect, and its replacement is untracked.**
Quickstart's SSE-fallback callout and Thread & History Lifecycle now link `[Connect your runtime to Intelligence](/deepagents/intelligence/quickstart)`; the old URL answers **404** directly (no 3xx, checked 2026-09-23). It had itself replaced `/deepagents/premium/connect-your-runtime`, so this is the second move of the same link, and anyone holding either old URL lands on nothing. The link text still says "Connect your runtime to Intelligence" for a page titled "Connect Intelligence in 5 minutes". `/deepagents/intelligence/quickstart` is now load-bearing: Quickstart, Thread & History Lifecycle, User Memories, Automatic Learning and Jev all send readers there, and it is the source of the "Set both, or set neither" rule #38 relies on. It is in `sitemap.knownUnmapped` (a route for it was deleted earlier), so no drift on it is detected. Noted here; not tracked, by instruction.

**42. Harness: typecheck baseline after the upgrade.**
Not a doc bug. `tsc --noEmit` in `frontend/` still reports the two intended `TS2339 eventValue` errors in `generative-ui/your-components/interrupt-based/demo-chat/page.tsx` (the page's snippet, kept failing as the finding in compile form, unchanged on 1.73.3). The four `@ts-expect-error` directives the upgrade made unused (three in learned-skills, one in message-history) were removed and their findings marked resolved above; no other directive went unused.

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

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 18 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

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

## Automated recording and the daily QA report

`autorecorder/` records one demo video per doc page — read the doc, show the
code in a simulated VS Code, then drive the live feature — and `ci/` runs the
whole thing: drift check, dependency install, both servers, the recordings, and
the report they are evidence for.

```bash
npm run automate           # everything, from a cold checkout
npm run automate:issues    # only the pages with a known defect
npm run record -- --list   # what is registered
npm run record:doctor      # is the recorder's config still valid?
```

The pipeline is documented in [`ci/README.md`](ci/README.md); the recorder in
[`autorecorder/README.md`](autorecorder/README.md).

### Pages that are supposed to fail

Twelve routes are on the QA report as broken, and their clips exist to **show**
that rather than to work around it. Each declares a `knownIssue` in
`autorecorder/config/pages.config.ts`, and that one object drives three things:
the run reports `[ISSUE]` instead of `[PASS]` (and still exits 0, so a dozen
documented defects do not turn the nightly red), the recorder types the report
into a simulated Notepad at the end of the clip, and `ci/build-report.mjs`
renders it into `DOCUMENTED_REPORT.md`. The sentence on screen and the row that
reaches a manager are the same string, written once.

`[ISSUE]` means the page is on the known-issues list and recorded cleanly. It
does **not** mean the defect was confirmed today — nothing automated can
establish that. Watch the clip before sending the report on.

### Paired routes

Most of these defects are an absence — a label that never changes, a list that
stays empty — and a clip of an absence invites one question: was the demo just
wired up wrong? The answer has to be on screen, so where the fix is known the
route is paired:

| Doc's code, verbatim | Same page, with the omitted line |
|---|---|
| `/shared-state/in-app-agent-read` | `/shared-state/in-app-agent-read/fixed` |
| `/shared-state/in-app-agent-write` | `/shared-state/in-app-agent-write/fixed` |

The `/fixed` routes differ from their siblings by exactly one thing: they
address `shared_state_fixed_agent` (`backend/src/shared_state_fixed.py`), which
is `shared_state.py` plus `CopilotKitMiddleware(expose_state=["language"])` and
a middleware that seeds the key on the first turn. Both omissions are §9 item 9
below. Keep those files diffable — the value of the pair is that nothing else
differs.

Only pair a route where the fix is genuinely known. Two of these defects have no
established fix; a `/fixed` route that quietly did something else would be worse
evidence than no pair at all.

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
            │   ├── copilotkit/[[...slug]]/route.ts   all graphs, A2UI off for fixed-schema
            │   ├── copilotkit-a2ui-dynamic/[[...slug]]/route.ts  dynamic-schema only, injection on
            │   ├── copilotkit-learning/[[...slug]]/route.ts      the Learning page's runtime
            │   └── copilotkit-memory/[[...slug]]/route.ts        memory: { access }, the undocumented option
            ├── cookbook/jev-generative-ui/            every published block, four of them compiled and unmounted
            │   ├── workspaces.ts · read-action.ts     the two that run
            │   ├── choose-panel.ts · picker-agent.ts  need @typesafe-ai/sdk and @langchain/openai
            │   ├── runtime-route.ts · picker-page.tsx deliberately not route.ts / page.tsx
            │   └── prepared-controls.tsx              the live half, Jev absent and labelled absent
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
- [Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards)

**Custom Look and Feel**
- [Markdown Rendering](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown)

**Rich Threads**
- [Thread & History Lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle)

**Cookbook**
- [Jev: fast generative UI](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui) — tracked and compiled; not runnable without a TypeSafe vendor key

**Intelligence**
- [Memories & Recall](https://docs.copilotkit.ai/deepagents/intelligence/memories)
- [Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills)
- [Learning](https://docs.copilotkit.ai/deepagents/learning)

**App Control**
- [Frontend Tools](https://docs.copilotkit.ai/deepagents/frontend-tools)
- [WebMCP](https://docs.copilotkit.ai/deepagents/webmcp) — tracked for drift only
- [Governed Actions](https://docs.copilotkit.ai/deepagents/human-in-the-loop/governed-actions) — tool-call variant implemented; the `useInterrupt` variant is not

**Shared State**
- [Reading agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read)
- [Writing agent state](https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write)
- [Predictive State Updates — prebuilt](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt)
- [Predictive State Updates — custom graph, manual emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission)
- [Predictive State Updates — custom graph, tool emission](https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission)
- [Input/Output Schemas](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs)
- [Workflow Execution](https://docs.copilotkit.ai/deepagents/shared-state/workflow-execution)

**Not covered by this repo.** The Deep Agents sidebar also lists Human in the Loop, and an Intelligence Platform group (Rich Threads, Headless Threads, Thread & History Lifecycle, Synchronize Thread History, and four premium pages). Those were outside the scope requested for this build. Every page listed above is implemented or explicitly accounted for.
