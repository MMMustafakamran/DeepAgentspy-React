"use client";
// HARNESS: route that mounts the page's AgentTrigger and shows the agent's messages (the page has no UI for them)
import { useAgent, UseAgentUpdate } from "@copilotkit/react-core/v2";
import { AgentTrigger } from "./agent-trigger";

function Messages() {
  const { agent } = useAgent({ agentId: "sample_agent", updates: [UseAgentUpdate.OnMessagesChanged, UseAgentUpdate.OnRunStatusChanged] });
  return <div id="messages">{agent.messages.map((m) => <p key={m.id} data-role={m.role}><b>{m.role}:</b> {typeof m.content === "string" ? m.content : JSON.stringify(m.content)}</p>)}</div>;
}

export default function Page() {
  return <main><h1>Programmatic control</h1><AgentTrigger agentId="sample_agent" /><Messages /></main>;
}
