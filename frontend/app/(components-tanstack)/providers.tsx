"use client";
// Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/components  "Try it" step 3 (app/providers.tsx)
// HARNESS: runtimeUrl "/api/cpk/components-tanstack" (step 2's route lives there in this harness)
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/cpk/components-tanstack" generativeUI={{ ui: standardUI }}>
      {children}
    </CopilotKitProvider>
  );
}
