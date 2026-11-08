"use client";
// Verbatim provider: https://docs.copilotkit.ai/deepagents/generative-ui/components/theming
// HARNESS: runtimeUrl "/api/cpk/cmp-theming" + agentId="sample_agent" (Quickstart Deep Agent).
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/cpk/cmp-theming"
      agentId="sample_agent"
      generativeUI={{
        ui: standardUI,
        theme: {
          "--a2ui-color-accent": "#d97706",
          "--a2ui-font-family": "Inter, sans-serif",
          "--a2ui-radius-md": "10px",
        },
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
