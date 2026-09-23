# Findings — DeepAgentspy-react

Numbers are stable (code references `FINDINGS.md #N`). ❌ open · ✅ resolved · ⚠️ partial · 🛠 harness note.
Current stack (2026-09-23): `@copilotkit/react-core`/`runtime`/`a2ui-renderer` declared `^1.73.3`, installed 1.73.3 (was `^1.69.0` / lock 1.69.0 / installed 1.71.0). `copilotkit` (PyPI) 0.1.94, `deepagents` 0.7.4, `langgraph-api` 0.12.0, Next 16.3.0, React 19.2.8. No `CPK_INTELLIGENCE_API_KEY`.

## Blocking — doc code cannot work

1. ❌ **`copilotkit.a2ui` names wrong** ([fixed-schema](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema), copilotkit 0.1.94): `surface_update`→`update_components`, `data_model_update`→`update_data_model`, `begin_rendering`→`create_surface(id, catalog_id)` (must come first), `render(action_handlers=)` has no `action_handlers`. Real API in `backend/src/a2ui_fixed.py`.
2. ❌ **A2UI buttons can't act**: no `action_handlers`; [advanced](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced)'s `useA2UIActionHandler`, `resolveDeclaredOps`, `defaultActionOrchestrator` not exported (react-core 1.66.2). `createA2UIMessageRenderer`, `a2uiDefaultTheme` do exist.
3. ❌ **`enabled: ({ eventValue })`** ([interrupt-based](https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based)): predicate gets `{ name, value }`, so `eventValue` is undefined and handlers never fire. LangGraph `interrupt()` arrives as `on_interrupt` with `value` **serialised as a string**, so `event.value.type` is undefined. Live-confirmed; still TS2339 ×2 on 1.73.3.
4. ❌ **Invalid dark-mode CSS** ([styling](https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/styling)): `.dark .a2ui-surface, @media (…) {}`; the at-rule in a selector list drops the whole rule. Split in `frontend/src/a2ui/theme.css`.
5. ❌ **`useDefaultRenderTool` has no `args`** ([tool-rendering](https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering)): the prop is `parameters` (as in the page's own `useRenderTool` snippet).
6. ❌ **Predictions need `<CopilotKit>`, not `<CopilotKitProvider>`**, and no page says so. The `PredictState` listener lives in `CopilotListeners`, which only `<CopilotKit>` mounts. Fails silently: no state, no error.

## Incomplete — doc omits a needed step

7. ❌ **No page shows custom state reaching a Deep Agent** (frontend-tools, state-rendering, shared-state ×2, predictive-state-updates): `create_deep_agent` has no `state=`; needs an `AgentMiddleware` with `state_schema`.
8. ❌ **state-rendering never calls `emit_research_progress`**: it needs a `@tool` (the only place with a `RunnableConfig`). Emitted state is a prediction, overwritten on node return. A `Command` needs a `ToolMessage` with `tool_call_id`.
9. ❌ **State written ≠ state seen**: needs `CopilotKitMiddleware(expose_state=["language"])` (off by default, on neither shared-state page).
10. ❌ **`setState` replaces, not merges**: one-key `setState({ language })` drops `copilotkit` (frontend tools). Spread `agent.state`.
11. ❌ **`Literal[...] = "english"` isn't a default** on a dict-subclass state. Seeded in `before_agent`.
12. ❌ **A2UI schemas/catalog never shown**: no `flight_schema.json`; the "Bring Your Own Catalog" link leaves the Deep Agents tree; the advanced primitives are self-defined (`⚠ SELF-DEFINED`).
13. ⚠️ **predictive-state-updates manual-emission (Python) is incomplete**: no graph/compile/imports; names the missing `cpk_action_node`. The tool-emission tab is complete since 30 Aug. Built from the same page's TS tab scaffolding. Python binds `state["copilotkit"]["actions"]` straight into `bind_tools` without conversion.
14. ❌ **Python snippet `compile(checkpointer=MemorySaver())` kills the server**: a hard `ValueError` at load (langgraph-api 0.12.0) takes all 15 graphs down. JS accepts it. Here `compile()` is called bare, the only non-verbatim line, because the failure can't be filmed.

## Upstream page bugs

15. ❌ **`workflow-execution` serves [state-inputs-outputs](https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs)** byte-for-byte (only the h1 differs).
16. ❌ **state-inputs-outputs uses deprecated `input=`/`output=`** (warns on LangGraph 1.2.10); imports nothing; mixes `list`/`List`; never fills `resources`.
17. ❌ **`useRenderToolCall` named where `useRenderTool` is meant** (tool-rendering, ×3).
18. ❌ **frontend-tools** links `/langgraph/quickstart`; Steps 4–5 repeat content and the snippet.
19. ❌ **Broken anchors on advanced**: `#adding-interactivity-action-handlers`, `./fixed-schema-streaming`.
20. ❌ **Model ids vary**: `openai:gpt-4o`, `gpt-5.4`, `gpt-4`. The harness uses `OPENAI_MODEL` (default gpt-4o).
21. ❌ **Quickstart installs unused `@copilotkit/react-ui`** (all imports are `react-core/v2`).

## Added upstream 2026-09-11 (verified on 1.71.0)

22. ❌ **[Frontend-Driven Cards](https://docs.copilotkit.ai/deepagents/generative-ui/frontend-cards) targets agent `default`** (Deep Agents registers `sample_agent`): `useAgent()` throws a plain `Error` and the route dies (3/3). Fix = `agent="sample_agent"`. Also: a card added pre-connect is silently dropped (3/3); `<DeploymentWatcher />` is never mounted; its `wss://example.com` URL 404s.
23. ⚠️ **[Memories](https://docs.copilotkit.ai/deepagents/intelligence/memories) fails silently off an Intelligence runtime.** The import was fixed 2026-09-21. No `/memories` request is sent; the list shows empty, not "unavailable"; `addMemory` says "Runtime URL is not configured". `/memories/*` 404s without `memory: { access }`, which is never mentioned. The agent claims it saved.
24. ❌ **[Learning](https://docs.copilotkit.ai/deepagents/learning) runtime throws at load without a key** (`apiKey is required`; the `!` hides it; the key isn't listed as a prereq): `/info` 500. Uses undefined `agents`, `identifyUser`. `getLearningContainerId` needs ≥1.70.

## Added upstream 2026-09-21

25. 🛠 **Harness deviation: the Learning selector isn't the page's.** `lib/learning-runtime.ts` returns the constant `"firstlearningtest"` (since 1e4a837) vs the page's `agentId === "expense-agent" ? "expense-review" : undefined`. Now declared and shown side by side. **Owner to decide whether to restore it.**
26. ✅ **Skill delivery BuiltInAgent `learnedSkills`**: resolved at 1.73.3; failed at 1.71.0/1.72.0 (TS2353, TS2339, TS2724 `BuiltInAgentFactoryContext`). First shipped in 1.73.0. The page pins every other adapter's version but not CopilotKit's. Still open: "every factory receives `learnedSkills`"; `ai`/`@ai-sdk/openai` imported with no install step; the Read-tools rule differs by row.
27. ⚠️ **Learning delivery steps point to an uninstallable adapter**: the framework list was removed 2026-09-23, but for Python it's LangGraph Python (404 on PyPI), so the env block configures nothing. The rest is dashboard-only (needs an account).
28. ❌ **Landing page vs Quickstart: same filename `app/api/copilotkit/[[...slug]]/route.ts`, different code**: the landing has no `intelligence`/`identifyUser`, uses unguarded `process.env.X!`, and adds `PATCH`/`DELETE`.
29. ❌ **Quickstart `touch app/api/copilotkit/route.ts`** contradicts its `[[...slug]]` titles. A plain route has no `/info`, so from core 1.70.2 it throws on a relative URL; both files together are rejected by Next.
30. ❌ **Two `.env` captions, different directories** (agent vs frontend), neither labelled. Mentions `COPILOTKIT_LICENSE_TOKEN` only to say you won't get one.
31. ✅🛠 **learned-skills route had no nav entry**: fixed.

## Tracked 2026-09-21 (1.71.0; zod 3.25.76, streamdown 1.6.11, @ag-ui 0.0.59)

32. ❌ **[Markdown Rendering](https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown)**: the mechanics are correct (the `rehype-harden` 1.1.8 link hardening holds), but it targets agent `default` (like #22), has no `"use client"`, `className="my-link"`/`my-heading` are undefined (no visible effect), and "drop `node`" triggers `no-unused-vars` ×4. The custom-tag example also gives unprinted TS7031. `streamdown` is transitive only. Asserted from the bundle and tsc; the route isn't recorded.
33. ❌ **[Jev](https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui)**: no Deep Agent anywhere; step 4 replaces the Deep Agents runtime route.
    - 6 of its 10 exact pins unmet (after the upgrade `@copilotkit/*` is 1.73.3 vs 1.73.0 pinned; zod 3.25.76 vs 4.6.5; `@langchain/core` 1.2.12 vs 1.2.11; `@typesafe-ai/sdk`, `@langchain/openai` absent); 5 undeclared; the 1.73.0 floor is unjustified.
    - Needs `TYPESAFE_API_KEY`; the `.catch(() => …)` hides every error as "Try again".
    - The optional half depends on #24/#26 and pins intelligence-langgraph 1.71.2.
    - `choosePanel` throws on a missing score even when irrelevant.
    - Harness: files relocated/renamed; `@ts-expect-error` on the 2 absent imports; `readAction` is duplicated.
34. 🛠 **markdown-rendering is in the `generative_ui` dispatch group** (the 10-input cap). Its `?tab=` effect is eslint-disabled.
35. ❌ **[Thread Lifecycle](https://docs.copilotkit.ai/deepagents/threads-lifecycle)**: `existingId` is undefined. "Re-mint on remount" is false under `<CopilotKit>` (inherits the parent threadId). The rest was observed working on 1.73.0.

## 2026-09-22 sync

36. ✅ **Inspector tabs "Rich Threads"/"Automatic Learning"**: resolved at web-inspector 1.73.1 (1.73.3 installed); failed on 1.71.0/1.73.0. The doc states no version.
37. ⚠️ **[Message history](https://docs.copilotkit.ai/deepagents/backend/message-history)**:
    - `messageFilter` is ✅ at type level from 1.73.1 (failed 1.71.0/1.73.0); its runtime effect is unverified.
    - ❌ The runtime recipe `new HttpAgent({ url: AGENT_URL })` has no AG-UI endpoint on Deep Agents (the `default` agent gives `RUN_ERROR`). `.use()` on `LangGraphAgent` works: trimmed gives `UNKNOWN` vs untrimmed `Sam` (3/3), and a checkpointed thread loses nothing.
    - The check script has TS2339. `selfManagedAgents` is quoted only.

## 2026-09-23 sync + 1.73.3 upgrade

38. ❌ **[Skill delivery](https://docs.copilotkit.ai/deepagents/intelligence/learned-skills)**:
    - `revision: "exact-revision-id"` is live in all 8 examples (the page says remove it).
    - `copilotkit-intelligence-runtime` is unflagged and 404 on PyPI (as are `-langgraph` and `-adk`).
    - The reuse block sets `apiUrl` without `wsUrl`, against the quickstart's "Set both, or set neither".
    - `intelligence-mastra`/`-langgraph` 1.71.2 hard-pin runtime 1.71.2. With 1.73.3 there's a nested copy and TS2322 `#private` (verified in a scratch project).
    - `npx tsx agent.mts` doesn't load `.env` (tsx 4.23.15).
    - The Mastra example prints nothing.
    - Placeholders are inconsistent (`your-project-key`/`cpk-...`, `support-learning`/`expense-review`).
39. ❌ **Automatic Learning recommends LangGraph Python** (404 on PyPI) with no warning. The CLI commands are now `npx copilotkit@latest login/project select/skills download` (not run).
40. ❌ **[Plans](https://docs.copilotkit.ai/deepagents/intelligence/plans) says the free Developer plan includes User Memory**, vs `403 MEMORY_NOT_ENTITLED` (reproduced on Agno-react).
41. ❌ **`/intelligence/connect-your-runtime` 404s with no redirect** (its 2nd move). The replacement `/intelligence/quickstart` is linked from 5 pages but untracked (`knownUnmapped`).
42. 🛠 **Typecheck baseline on 1.73.3**: only the 2 intended TS2339 errors from #3. The 4 unused `@ts-expect-error` were removed (#26, #37).
