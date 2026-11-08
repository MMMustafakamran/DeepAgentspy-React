// Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/mcp-apps (app/api/copilotkit/[[...slug]]/route.ts)
// HARNESS: basePath "/api/cpk/mcp-apps" (one runtime per doc page in this harness).
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph"; // [!code highlight]
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware"; // [!code highlight]

const agent = new LangGraphAgent({
  deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
  graphId: "sample_agent",
  langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
});

// [!code highlight:10]
agent.use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: "https://mcp.excalidraw.com",
        serverId: "excalidraw",
      },
    ],
  }),
);

const runtime = new CopilotRuntime({
  agents: { sample_agent: agent },
  runner: new InMemoryAgentRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/cpk/mcp-apps", // HARNESS
});

export const GET = handler;
export const POST = handler;
