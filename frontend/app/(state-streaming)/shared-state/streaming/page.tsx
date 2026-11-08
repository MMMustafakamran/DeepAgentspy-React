"use client";
// https://docs.copilotkit.ai/deepagents/shared-state/streaming — the page shows only a fragment of
// src/app/demos/shared-state-streaming/page.tsx (the useAgent call, verbatim below; no imports, no JSX).
// HARNESS: imports, the component around it, and the rendering of agent.state.document / agent.isRunning.
import { useAgent, UseAgentUpdate, CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS

function Doc() { // HARNESS
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });
  return (<div><h1>State streaming {agent.isRunning ? "LIVE" : "done"}</h1><pre id="doc" style={{ whiteSpace: "pre-wrap" }}>{String((agent.state as any)?.document ?? "")}</pre></div>); // HARNESS
}

export default function Page() { // HARNESS
  return (<main><Doc /><CopilotSidebar defaultOpen={true} /></main>);
}
