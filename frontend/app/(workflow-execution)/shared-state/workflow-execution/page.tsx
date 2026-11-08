"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs ("Give it a try!", verbatim inside a component)
import { useAgent } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

function Answer() { // HARNESS: the snippet is bare hook calls; wrapped in a component
const { agent } = useAgent({
  agentId: "sample_agent",
});

const answer = agent.state.answer as string;
console.log(answer) // You can expect seeing "answer" change, while the others are not returned from the agent
  return <div><h1>Input/Output Schemas</h1><p>answer: <span id="answer">{String(answer ?? "")}</span></p><pre id="state">{JSON.stringify(Object.keys(agent.state ?? {}))}</pre></div>; // HARNESS
}

export default function Page() { // HARNESS
  return (<main><Answer /><CopilotSidebar defaultOpen={true} /></main>);
}
