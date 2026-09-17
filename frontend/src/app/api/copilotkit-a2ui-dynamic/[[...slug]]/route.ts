import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import {
  A2UI_DYNAMIC_GRAPH_ID,
  LANGGRAPH_DEPLOYMENT_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

// A second runtime, for the three routes that drive the A2UI dynamic-schema
// agent: Dynamic Schema, Styling and Advanced.
//
// `injectA2UITool: true` is the Dynamic Schema page's whole subject, and it is
// why this needs its own endpoint: /api/copilotkit turns injection off for the
// fixed-schema agent, and the setting is per-runtime.
//
// Mounted as a catch-all `[[...slug]]` on the v2 handler, exactly like
// /api/copilotkit, rather than as a bare POST-only `route.ts`. That is not
// cosmetic. The client's transport detection probes `GET {runtimeUrl}/info`
// first and only falls back to a single-route POST envelope when that 404s. A
// POST-only mount therefore resolved to the single-route transport by accident
// -- nothing on these three pages is about that transport -- and from
// @copilotkit/core 1.70.2 that path throws before the agent ever runs:
// `createSingleRouteResourceRequest` builds `new URL(runtimeUrl)` with no base
// argument, which is a TypeError for a relative `runtimeUrl` like the one these
// pages pass. Serving `/info` keeps them on the REST transport they were always
// meant to use.

const runtime = new CopilotRuntime({
  agents: {
    [A2UI_DYNAMIC_GRAPH_ID]: new LangGraphAgent({
      deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
      graphId: A2UI_DYNAMIC_GRAPH_ID,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  },
  runner: new InMemoryAgentRunner(),
  a2ui: {
    injectA2UITool: true,
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-a2ui-dynamic",
});

export const GET = handler;
export const POST = handler;
