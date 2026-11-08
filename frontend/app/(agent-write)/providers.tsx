"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS: runtimeUrl "/api/cpk/agent-write" (this page's own runtime, see app/api/cpk/agent-write).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/agent-write" agentId="sample_agent" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
