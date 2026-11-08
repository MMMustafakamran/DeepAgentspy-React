"use client";
// https://docs.copilotkit.ai/deepagents/generative-ui/components  "Already have CopilotKit running? Do step 3 only."
// Step 3 app/providers.tsx verbatim, except:
// HARNESS: runtimeUrl "/api/cpk/components-deep" (the Quickstart Deep Agent runtime, graph sample_agent)
// and agentId="sample_agent" kept from the Quickstart provider (the reader's existing app).
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/components-deep" agentId="sample_agent" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}
