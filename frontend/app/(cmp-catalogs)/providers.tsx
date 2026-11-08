"use client";
// https://docs.copilotkit.ai/deepagents/generative-ui/components/catalogs: `<CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: shopUI }}>`
// HARNESS: runtimeUrl "/api/cpk/cmp-catalogs" (Quickstart Deep Agent runtime, graph sample_agent) and
// agentId="sample_agent" from the Quickstart provider; the page's snippet has neither (its provider
// would look for an agent named "default").
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { shopUI } from "./catalog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/cmp-catalogs" agentId="sample_agent" generativeUI={{ ui: shopUI }}>
      {children}
    </CopilotKitProvider>
  );
}
