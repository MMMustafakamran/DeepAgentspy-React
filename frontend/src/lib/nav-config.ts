/**
 * The nav, the route headers, the status page and the README status table all
 * read from here, so a doc page and its implementation status are described
 * exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/deepagents.
 * `agentId` is the graph id in `backend/langgraph.json` that the route drives;
 * routes without one are reference-only and have no agent.
 */

export const DOC_SYNC_DATE = "2026-08-06";
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
        title: "Predictive State Updates",
        docPath: "/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt",
        summary:
          "StateStreamingMiddleware streaming a tool argument into state as the model writes it, plus the two custom-graph variants.",
        status: "partial",
        statusNote:
          "The prebuilt variant is live. Both custom-graph variants are reference-only — the page only sketches the graph.",
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
