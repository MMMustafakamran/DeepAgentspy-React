"use client";
// Adopt from A2UI "After": generativeUI={{ ui: appUI }}.
// HARNESS: runtimeUrl "/api/cpk/cmp-from-a2ui" (Quickstart Deep Agent runtime, graph sample_agent) and
// agentId="sample_agent" from the Quickstart provider; the page's snippet has neither (its provider
// would look for an agent named "default").
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { appUI } from "./app-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/cmp-from-a2ui" agentId="sample_agent" generativeUI={{ ui: appUI }}>
      {children}
    </CopilotKitProvider>
  );
}
