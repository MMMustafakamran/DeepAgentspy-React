"use client";
// HARNESS: same page, but on the runtime with the Excalidraw URL corrected to /mcp.
import { CopilotKitProvider, CopilotSidebar } from "@copilotkit/react-core/v2";
export default function Page() {
  return (<CopilotKitProvider runtimeUrl="/api/cpk/mcp-apps-harness" agentId="sample_agent" useSingleEndpoint={false}><main><h1>MCP Apps (harness URL)</h1><CopilotSidebar defaultOpen={true} /></main></CopilotKitProvider>);
}
