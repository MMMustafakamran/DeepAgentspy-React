"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "state_io_graph";

//#region io-panel
/**
 * The page's frontend half, with the input side added.
 *
 * The page only shows the read: `agent.state.answer`. To see the split you
 * also have to write the other side, so the form below sets `question` and
 * runs the graph. What matters is what comes back:
 *
 *   question   written here, never returned  — not in OutputState
 *   answer     returned                      — in OutputState
 *   resources  never seen at all             — internal to OverallState
 */
function InputOutputPanel() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
  });

  // The UI is the source of truth for `question`: the graph does not send it
  // back, so if this component forgot it, it would be gone.
  const [question, setQuestion] = useState("Why is the sky blue?");
  const [running, setRunning] = useState(false);

  const answer = agent.state.answer as string | undefined;
  const returnedQuestion = agent.state.question as string | undefined;
  const returnedResources = agent.state.resources as string[] | undefined;

  const ask = async () => {
    setRunning(true);
    try {
      agent.setState({ ...agent.state, question });
      await agent.runAgent();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div>
        <label
          htmlFor="question"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          question · input only
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
          />
          <button
            onClick={ask}
            disabled={running}
            className="shrink-0 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {running ? "Running…" : "Ask"}
          </button>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        <Row
          label="question"
          verdict={returnedQuestion === undefined ? "absent" : "present"}
          expected="absent"
          note="In InputState, not OutputState — accepted, never returned."
          value={returnedQuestion}
        />
        <Row
          label="answer"
          verdict={answer === undefined ? "absent" : "present"}
          expected="present"
          note="In OutputState — this is the one field that comes back."
          value={answer}
        />
        <Row
          label="resources"
          verdict={returnedResources === undefined ? "absent" : "present"}
          expected="absent"
          note="Only in OverallState — internal to the graph, never on the wire."
          value={returnedResources ? JSON.stringify(returnedResources) : undefined}
        />
      </dl>

      <div className="mt-auto">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          agent.state — everything the browser actually has
        </p>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {JSON.stringify(
            // `messages` is on both schemas and would drown out the three
            // fields this route is about.
            Object.fromEntries(
              Object.entries(agent.state).filter(([k]) => k !== "messages"),
            ),
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}

function Row({
  label,
  verdict,
  expected,
  note,
  value,
}: {
  label: string;
  verdict: "present" | "absent";
  expected: "present" | "absent";
  note: string;
  value?: string;
}) {
  const ok = verdict === expected;
  return (
    <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <dt className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
          {label}
        </dt>
        <span
          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
            ok
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
              : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200"
          }`}
        >
          {verdict} · expected {expected}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
      {value !== undefined && (
        <p className="mt-2 break-words text-sm text-slate-700 dark:text-slate-300">
          {value}
        </p>
      )}
    </div>
  );
}
//#endregion

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/state-inputs-outputs"
      subtitle={`custom StateGraph · ${AGENT_ID}`}
    >
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        <InputOutputPanel />
        <div className="min-h-0 border-t border-slate-200 md:border-l md:border-t-0 dark:border-slate-800">
          <CopilotChat agentId={AGENT_ID} className="h-full" />
        </div>
      </div>
    </DemoFrame>
  );
}
