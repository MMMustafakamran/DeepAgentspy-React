"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS: runtimeUrl "/api/cpk/governed-actions" (this page's own runtime, see app/api/cpk/governed-actions).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/governed-actions" agentId="sample_agent" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
