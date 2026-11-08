"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS: runtimeUrl "/api/cpk/multimodal" (this page's own runtime, see app/api/cpk/multimodal).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/multimodal" agentId="sample_agent" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
