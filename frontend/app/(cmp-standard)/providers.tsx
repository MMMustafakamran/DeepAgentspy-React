"use client";
// Standard catalog: provider with the page's `appUI` from "Replace a component" (extends standardUI).
// HARNESS: runtimeUrl "/api/cpk/cmp-standard" (Quickstart Deep Agent runtime, graph sample_agent) and
// agentId="sample_agent" from the Quickstart provider; the page's snippet has neither (its provider
// would look for an agent named "default").
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { appUI } from "./app-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/cmp-standard" agentId="sample_agent" generativeUI={{ ui: appUI }}>
      {children}
    </CopilotKitProvider>
  );
}
