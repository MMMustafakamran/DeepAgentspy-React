import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

import {
  A2UI_DYNAMIC_GRAPH_ID,
  LANGGRAPH_DEPLOYMENT_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

// A second runtime, for the three routes that drive the A2UI dynamic-schema
// agent: Dynamic Schema, Styling and Advanced.
//
// Note the absence of an `a2ui` block. That is the Dynamic Schema page's point:
// passing a catalog to the provider is enough to turn A2UI on and inject
// `generate_a2ui`, so the runtime needs no configuration. It has to be its own
// endpoint because /api/copilotkit turns injection off for the fixed-schema
// agent, and that setting is per-runtime.
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    [A2UI_DYNAMIC_GRAPH_ID]: new LangGraphAgent({
      deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
      graphId: A2UI_DYNAMIC_GRAPH_ID,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  },
  a2ui: {
    injectA2UITool: true,
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-a2ui-dynamic",
  });

  return handleRequest(req);
};
