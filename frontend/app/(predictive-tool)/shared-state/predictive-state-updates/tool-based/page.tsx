"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates ("Observe the predictions", verbatim)
import { useAgent } from '@copilotkit/react-core/v2'; // [!code highlight]
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

const YourMainContent = () => {
    // [!code highlight:3]
    const { agent } = useAgent({
        agentId: "sample_agent",
    });

    const observedSteps = (agent.state.observed_steps as string[]) ?? [];

    return (
        <div>
            <h1>Agent Progress</h1>
            {observedSteps.length > 0 && (
                <div>
                    <h3>Steps:</h3>
                    <ul>
                        {observedSteps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default function Page() { // HARNESS
  return (<main><YourMainContent /><CopilotSidebar defaultOpen={true} /></main>);
}
