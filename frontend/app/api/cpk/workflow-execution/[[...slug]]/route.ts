// Quickstart "Setup Copilot Runtime" (Deep Agent tab), verbatim, except:
// HARNESS: graphId "state_io_harness" (the page's own agent) instead of "sample_agent", and basePath
// "/api/cpk/workflow-execution", so each doc page gets its own runtime while the frontend keeps the doc's
// agent id "sample_agent".
import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const runtime = new CopilotRuntime({
    agents: {
        sample_agent: new LangGraphAgent({
            deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
            graphId: "state_io_imports", // HARNESS: verbatim + imports only (FINDINGS.md #16); state_io_harness = model fixed
            langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
        }),
    },
    // [!code highlight:8]
    intelligence: new CopilotKitIntelligence({
      apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
    }),
    // Threads are per-user. Without this, every visitor shares one history.
    identifyUser: (request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/cpk/workflow-execution", // HARNESS
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
