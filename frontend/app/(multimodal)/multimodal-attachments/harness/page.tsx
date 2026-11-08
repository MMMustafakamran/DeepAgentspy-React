"use client";
// HARNESS variant of the Quick start: agentId="my-agent" (not registered: "useAgent: Agent 'my-agent' not found")
// replaced by the Quickstart's agent (provider default sample_agent). Evidence only; the verbatim route stays broken.
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function Page() {
  return (
    <div style={{ height: "100vh" }}>
      <CopilotChat
        attachments={{ enabled: true }}
      />
    </div>
  );
}
