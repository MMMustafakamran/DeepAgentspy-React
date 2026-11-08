"use client";
// Transports, Tool transport (verbatim): generativeUI={{ ui: standardUI }}.
// HARNESS: runtimeUrl "/api/cpk/cmp-transports" (Quickstart Deep Agent runtime, graph sample_agent) and
// agentId="sample_agent" from the Quickstart provider; the page's snippet has neither (its provider
// would look for an agent named "default").
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/cmp-transports" agentId="sample_agent" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}
