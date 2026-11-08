"use client";
// Quickstart "Configure CopilotKit Provider", verbatim except runtimeUrl.
// HARNESS: runtimeUrl "/api/cpk/state-streaming" (this page's own runtime, see app/api/cpk/state-streaming).

import { CopilotKitProvider } from "@copilotkit/react-core/v2";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/state-streaming" agentId="shared-state-streaming" useSingleEndpoint={false}>
      {children}
    </CopilotKitProvider>
  );
}
