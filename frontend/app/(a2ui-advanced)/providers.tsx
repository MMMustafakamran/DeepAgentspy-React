"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS (A2UI Advanced builds on the Dynamic Schema setup, so it reuses that runtime): runtimeUrl "/api/cpk/a2ui-dynamic" (this page's own runtime, see app/api/cpk/a2ui-dynamic).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/a2ui-dynamic" agentId="sample_agent" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
