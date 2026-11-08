"use client";
// Markdown mode "Turn it on" (verbatim): generativeUI={{ ui: standardUI, transport: "markdown" }}.
// HARNESS: runtimeUrl "/api/cpk/cmp-markdown-mode" (Quickstart Deep Agent runtime, graph sample_agent) and
// agentId="sample_agent" from the Quickstart provider; the page's snippet has neither (its provider
// would look for an agent named "default").
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/cmp-markdown-mode" agentId="sample_agent" generativeUI={{ ui: standardUI, transport: "markdown" }}>
      {children}
    </CopilotKitProvider>
  );
}
