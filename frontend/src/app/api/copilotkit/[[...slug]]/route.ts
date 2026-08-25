import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import {
  A2UI_FIXED_GRAPH_ID,
  GRAPH_IDS,
  LANGGRAPH_DEPLOYMENT_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

// The Quickstart's Deep Agent runtime, widened from one graph to the whole
// manifest.
//
// The page registers a single `sample_agent: new LangGraphAgent({...})`. This
// harness has one graph per doc route, so every id in `langgraph.json` gets a
// `LangGraphAgent` pointed at the same dev server with its own `graphId`. The
// constructor arguments are otherwise exactly the page's.

const agents = Object.fromEntries(
  GRAPH_IDS.map((graphId) => [
    graphId,
    new LangGraphAgent({
      deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
      graphId,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  ]),
);

const runtime = new CopilotRuntime({
  agents,
  // A2UI, scoped to the fixed-schema agent with tool injection off. That agent
  // owns its own `search_flights` tool and returns the operations container
  // itself, so handing it a `generate_a2ui` tool as well would give the model
  // two ways to draw the same card. The middleware still detects the container
  // in the tool result and renders the surface.
  //
  // The dynamic-schema agent deliberately does not go through this runtime. It
  // has its own at /api/copilotkit-a2ui-dynamic, where injection has to stay
  // on — that is the whole mechanism of the Dynamic Schema page.
  runner: new InMemoryAgentRunner(),
  a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_GRAPH_ID] },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
