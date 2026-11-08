"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read ("Use the useAgent Hook", verbatim)
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

function YourMainContent() {
  // [!code highlight:3]
  const { agent } = useAgent({
    agentId: "sample_agent",
  });

  const language = (agent.state.language as string) ?? "english";

  // ...

  return (
    // style excluded for brevity
    <div>
      <h1>Your main content</h1>
      {/* [!code highlight:1] */}
      <p>Language: {language}</p>
    </div>
  );
}

export default function Page() { // HARNESS
  return (<main><YourMainContent /><pre id="raw-state">{""}</pre><CopilotSidebar defaultOpen={true} /></main>);
}
