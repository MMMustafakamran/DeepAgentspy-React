"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering ("Render state in the UI", verbatim)
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

function YourMainContent() {
  // [!code highlight:3]
  const { agent } = useAgent({
    agentId: "sample_agent",
  });

  const state = (agent.state ?? {}) as {
    searches?: { query: string; done: boolean }[];
  };
  const searches = state.searches ?? [];

  return (
    <div>
      {searches.map((search, index) => (
        <div key={index}>
          {search.done ? "✅" : "⏳"} {search.query}
        </div>
      ))}
    </div>
  );
}

export default function Page() { // HARNESS
  return (<main><h1>State rendering</h1><div id="state-panel"><YourMainContent /></div><CopilotSidebar defaultOpen={true} /></main>);
}
