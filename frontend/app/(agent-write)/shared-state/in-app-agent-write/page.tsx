"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write ("Use the useAgent hook to read and write state", verbatim)
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

// Example usage in a pseudo React component
function YourMainContent() {
  // [!code highlight:3]
  const { agent } = useAgent({
    agentId: "sample_agent",
  });

  const language = (agent.state.language as string) ?? "english";

  // ...

  const toggleLanguage = () => {
    agent.setState({ language: language === "english" ? "spanish" : "english" }); // [!code highlight]
  };

  // ...

  return (
    // style excluded for brevity
    <div>
      <h1>Your main content</h1>
      {/* [!code highlight:1] */}
      <p>Language: {language}</p>
      <button onClick={toggleLanguage}>Toggle Language</button>
    </div>
  );
}

export default function Page() { // HARNESS
  return (<main><YourMainContent /><CopilotSidebar defaultOpen={true} /></main>);
}
