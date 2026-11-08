"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/multimodal-attachments ("Quick start", verbatim)
import { CopilotChat } from "@copilotkit/react-core/v2";

export default function Page() { // HARNESS: route wrapper
  return (
    <div style={{ height: "100vh" }}>
<CopilotChat
  agentId="my-agent"
  attachments={{ enabled: true }} // [!code highlight]
/>
    </div>
  );
}
