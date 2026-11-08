"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS: runtimeUrl "/api/cpk/predictive-prebuilt" (this page's own runtime, see app/api/cpk/predictive-prebuilt).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/predictive-prebuilt" agentId="sample_agent" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
