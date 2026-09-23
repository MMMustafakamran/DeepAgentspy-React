/**
 * The nav, the route headers, the status page and the README status table all
 * read from here, so a doc page and its implementation status are described
 * exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/deepagents.
 * `agentId` is the graph id in `backend/langgraph.json` that the route drives;
 * routes without one are reference-only and have no agent.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/deepagents";

export type RouteStatus = "working" | "partial" | "reference" | "broken" | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  /** Path under docs.copilotkit.ai, including any query the page needs. */
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  /** Present but absent from the doc sidebar as of DOC_SYNC_DATE. */
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Extra graph ids the route's demo can switch between. */
  extraAgentIds?: string[];
  /** Graph id in backend/langgraph.json, when the route drives one. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/deepagents",
        summary: "What this harness covers and how the pieces fit together.",
        status: "reference",
        statusNote: "Landing page — orientation and the live graph roster.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Quickstart",
        docPath: "/deepagents/quickstart",
        summary:
          "create_deep_agent with one Python tool, served by the LangGraph dev server and reached through a CopilotRuntime route.",
        status: "working",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool_rendering_agent",
        title: "Tool Rendering",
        docPath: "/deepagents/generative-ui/tool-rendering",
        summary:
          "A backend @tool call rendered as a custom component with useRenderTool, plus useDefaultRenderTool as the catch-all.",
        status: "working",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        agentId: "state_rendering_agent",
        title: "State Rendering",
        docPath: "/deepagents/generative-ui/state-rendering",
        summary:
          "A searches list pushed with copilotkit_emit_state and read live in the app through useAgent.",
        status: "working",
        statusNote:
          "The page shows the emit coroutine but not what calls it; the tool wrapper here is written to the shape the page describes.",
      },
      {
        path: "/generative-ui/your-components/interrupt-based",
        hasDemo: true,
        agentId: "interrupt_agent",
        title: "Interrupt-based HITL",
        docPath: "/deepagents/generative-ui/your-components/interrupt-based",
        summary:
          "LangGraph interrupt() inside an AgentMiddleware.before_model hook, answered in the browser by useInterrupt.",
        status: "working",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui_fixed_agent",
        title: "A2UI · Fixed Schema",
        docPath: "/deepagents/generative-ui/a2ui/fixed-schema",
        summary:
          "A component tree authored as JSON up front; the tool supplies only the data and returns an a2ui_operations container.",
        status: "partial",
        statusNote:
          "Runs, but on a different a2ui API than the page prints, and the Book button is inert — the SDK has no action_handlers.",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "a2ui_dynamic_agent",
        title: "A2UI · Dynamic Schema",
        docPath: "/deepagents/generative-ui/a2ui/dynamic-schema",
        summary:
          "A secondary LLM writes the schema and the data; the backend contributes nothing but CopilotKitMiddleware.",
        status: "working",
      },
      {
        path: "/generative-ui/a2ui/styling",
        hasDemo: true,
        agentId: "a2ui_dynamic_agent",
        title: "A2UI · Styling",
        docPath: "/deepagents/generative-ui/a2ui/styling",
        summary:
          "The .a2ui-surface CSS custom properties, applied to the dynamic-schema surface so the effect is visible.",
        status: "working",
      },
      {
        path: "/generative-ui/a2ui/advanced",
        hasDemo: true,
        agentId: "a2ui_dynamic_agent",
        title: "A2UI · Advanced",
        docPath: "/deepagents/generative-ui/a2ui/advanced",
        summary:
          "A custom render_a2ui progress renderer replacing the built-in skeleton, plus the action-handler APIs the page documents.",
        status: "partial",
        statusNote:
          "The progress renderer works. The action-handler half of the page calls exports that react-core 1.66.2 does not have.",
      },
      {
        path: "/generative-ui/frontend-cards",
        hasDemo: true,
        title: "Frontend-Driven Cards",
        docPath: "/deepagents/generative-ui/frontend-cards",
        summary:
          "A card pushed into the transcript from frontend code as a `role: \"activity\"` message, which the agent never receives.",
        status: "broken",
        statusNote:
          "As published, the bare `useAgent()` and `<CopilotChat />` target the agent id `default`, which a Deep Agents runtime does not register — `useAgent()` throws once `/info` answers and the route renders no chat. With the Quickstart's `agent=\"sample_agent\"` added to the provider, the page's central claim holds (the run payload carries no `activity`) — see the route page.",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/markdown",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Markdown Rendering",
        docPath: "/deepagents/custom-look-and-feel/markdown",
        summary:
          "The markdownRenderer slot on CopilotChatAssistantMessage: a Streamdown components map, a class string, or a component replacing the renderer outright.",
        status: "partial",
        statusNote:
          "The slot mechanics are exactly as documented, read out of the shipped 1.71.0 bundle, and the custom-tag claim produces the page's exact TS2353. What fails: all three published blocks are a bare `<CopilotChat>` with no agent id, so they ask for `default` and throw on a Deep Agents runtime (the Frontend-Driven Cards defect again); none carries `use client`; and the headline `components` example styles with `.my-link` / `.my-heading`, which the page never defines. Built 2026-09-21 and not yet driven — the demo's probe is what checks the prop claims against the rendered HTML.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend_tools_agent",
        title: "Frontend Tools",
        docPath: "/deepagents/frontend-tools",
        summary:
          "A tool registered with useFrontendTool that executes in the browser when the agent calls it.",
        status: "working",
      },
      {
        path: "/webmcp",
        title: "WebMCP",
        docPath: "/deepagents/webmcp",
        summary:
          "Publishing an existing frontend tool to document.modelContext so WebMCP-aware browser agents can discover and call it.",
        status: "not-started",
        statusNote:
          "Tracked for drift only — no demo yet. The page’s own verification steps need Chrome 149+ with the WebMCP origin trial or chrome://flags/#enable-webmcp-testing, and CopilotKit no-ops wherever document.modelContext is absent, so there is nothing a headless Chromium run can show.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        title: "Governed Actions",
        docPath: "/deepagents/human-in-the-loop/governed-actions",
        summary:
          "Gating a side-effecting agent action behind an approval card, via useInterrupt or useHumanInTheLoop.",
        status: "working",
        hasDemo: true,
        statusNote:
          "The tool-call variant, with the page's schema unchanged — `z.record(z.unknown())` is valid on this repo's zod 3. The `useInterrupt` variant needs a backend that pauses a run and attaches `interrupt.metadata.action`, which no agent here does.",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state/in-app-agent-read",
        hasDemo: true,
        agentId: "shared_state_agent",
        title: "Reading agent state",
        docPath: "/deepagents/shared-state/in-app-agent-read",
        summary: "Reading the agent's language field in your own UI through useAgent.",
        status: "working",
      },
      {
        path: "/shared-state/in-app-agent-write",
        hasDemo: true,
        agentId: "shared_state_agent",
        title: "Writing agent state",
        docPath: "/deepagents/shared-state/in-app-agent-write",
        summary:
          "Writing that same field back with agent.setState, then re-running with agent.runAgent.",
        status: "working",
        statusNote:
          "Needs CopilotKitMiddleware(expose_state=[...]) for the model to see the write; neither page mentions it.",
      },
      {
        path: "/shared-state/predictive-state-updates",
        hasDemo: true,
        agentId: "predictive_state_agent",
        extraAgentIds: ["predictive_manual_graph", "predictive_tool_graph"],
        title: "Predictive State Updates",
        docPath: "/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt",
        summary:
          "All three of the page's variants running side by side: the prebuilt middleware, and both custom graphs.",
        status: "working",
        statusNote:
          "All three are live. The Python tabs give the node bodies; the graph wiring comes from the same page's TypeScript tabs.",
      },
      {
        path: "/shared-state/state-inputs-outputs",
        hasDemo: true,
        agentId: "state_io_graph",
        title: "Input/Output Schemas",
        docPath: "/deepagents/shared-state/state-inputs-outputs",
        summary:
          "Splitting agent state into what the frontend may send, what it gets back, and what stays internal.",
        status: "working",
        statusNote:
          "The only route here that is a hand-built StateGraph rather than a Deep Agent — which is what the page itself calls for.",
      },
      {
        path: "/shared-state/workflow-execution",
        title: "Workflow Execution",
        docPath: "/deepagents/shared-state/workflow-execution",
        summary:
          "Listed separately in the nav, but the page currently serves the Input/Output Schemas content verbatim.",
        status: "broken",
        statusNote:
          "Upstream duplicate — identical title, prose and code to state-inputs-outputs. Nothing here to implement.",
      },
    ],
  },
  {
    title: "Intelligence",
    routes: [
      {
        path: "/intelligence/memories",
        hasDemo: true,
        title: "User Memories",
        docPath: "/deepagents/intelligence/memories",
        summary:
          "Long-term memories per user or project, read and written from React with `useMemories`.",
        status: "broken",
        statusNote:
          "The React snippet's import was wrong until the 2026-09-21 sync and now reads `@copilotkit/react-core/v2`, so the page's file compiles and runs here. What remains: on the Quickstart's runtime no memory request is ever sent, the hook reports `isAvailable: true` over an empty list, and every memory route 404s unless the runtime is built with `memory: { access }`, which the page never mentions. That option needs an Intelligence key this harness does not have, so the second runtime answers 503.",
      },
      {
        path: "/intelligence/learned-skills",
        hasDemo: true,
        title: "Learned Skills",
        docPath: "/deepagents/intelligence/learned-skills",
        summary:
          "Putting one Learning container's published Skills in front of an agent through a framework-native adapter, with no CLI download and no restart.",
        status: "broken",
        statusNote:
          "Skill delivery: no row of the page's adapter table can be followed for this backend. Every Python package it names is 404 on PyPI, including the base client it says Python uses (unflagged, unlike the two adapters now marked pending release). The BuiltInAgent row's `learnedSkills` failed on runtime 1.71.0 (TS2353, TS2339, TS2724) and compiles on the 1.73.3 installed since 2026-09-23; the page still names no version, and BuiltInAgent replaces the Deep Agent rather than attaching to it. Every snippet now pins the placeholder revision `exact-revision-id`.",
      },
      {
        path: "/learning",
        hasDemo: true,
        title: "Automatic Learning",
        docPath: "/deepagents/learning",
        summary:
          "Routing selected Threads into a Learning container from the runtime, for Insights and reviewed Skills.",
        status: "broken",
        statusNote:
          "The page's runtime snippet is mounted verbatim at `/api/copilotkit-learning`. Its `apiKey: process.env.CPK_INTELLIGENCE_API_KEY!` throws at module load without a key, so the route 500s and neither agent answers. `agents` and `identifyUser` are undefined on the page; `getLearningContainerId` needs runtime 1.70+; dashboard and CLI steps are not exercised.",
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/threads/lifecycle",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Thread & History Lifecycle",
        docPath: "/deepagents/threads-lifecycle",
        summary:
          "How a threadId is minted, lost on remount, restored with setActiveThreadId, and made authoritative with a threadId prop.",
        status: "partial",
        statusNote:
          "The only Rich Threads page tracked here; the rest of the section stays in knownUnmapped. Runs on the runtime's InMemoryAgentRunner, whose connect() replays a thread's history for the life of the process. That is the page's \"persisting AgentRunner\" case; CopilotKit Intelligence and LangGraph's own checkpointer are not exercised. The page's `existingId` is never defined, so the demo supplies the first thread that held a conversation.",
      },
    ],
  },
  {
    title: "Backend",
    routes: [
      {
        path: "/backend/message-history",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Message history",
        docPath: "/deepagents/backend/message-history",
        summary:
          "Trimming the transcript forwarded to the agent: the page's middleware inside a second runtime, and its messageFilter prop.",
        status: "partial",
        statusNote:
          "The middleware and its check work as published, and on a LangGraph thread trimming loses nothing (the checkpointer holds the history). `messageFilter`, the page's recommended recipe, was not a prop on @copilotkit/react-core 1.71.0 or 1.73.0 (a type error that did nothing); it first ships in 1.73.1 and typechecks on the 1.73.3 installed since 2026-09-23, runtime effect not re-observed. The runtime snippet's `HttpAgent({ url: process.env.AGENT_URL! })` needs an AG-UI endpoint this backend does not serve; the demo runs the same middleware on the Quickstart's LangGraphAgent instead.",
      },
    ],
  },
  {
    title: "Cookbook",
    routes: [
      {
        path: "/cookbook/jev-generative-ui",
        title: "Jev: fast generative UI",
        docPath: "/deepagents/cookbook/jev-generative-ui",
        summary:
          "A workspace picker whose next control and candidate ranking come from Jev, TypeSafe's decision service, rendered through AG-UI as shared agent state.",
        status: "broken",
        statusNote:
          "Not runnable here and not faked. The decision layer needs `@typesafe-ai/sdk` (absent) and a TYPESAFE_API_KEY from a third-party vendor; the fallback needs `@langchain/openai` (absent). Every published TypeScript block is in the repo verbatim and typechecks on the installed 1.71.0, three minors below the page's 1.73.0 pin, and on zod 3 rather than the pinned zod 4. The prepared controls, their schemas and `readAction` are wired up for real on the route; the Jev decision is absent and labelled as absent. No demo and no recorder entry, because there is nothing to film that would not be a stand-in. Built 2026-09-21 and not yet opened in a browser.",
      },
    ],
  },
  {
    title: "Doc Sync",
    routes: [
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/deepagents",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
