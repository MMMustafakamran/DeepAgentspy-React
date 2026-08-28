"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The Writing agent state demo, against the graph the doc page is missing a line of.
 *
 * Same arrangement as the sibling under `in-app-agent-read/fixed`: the React is
 * the failing route's React, and the only difference is `AGENT_ID` pointing at
 * `shared_state_fixed_agent` (`src/shared_state_fixed.py` = `src/shared_state.py`
 * plus `CopilotKitMiddleware(expose_state=["language"])`).
 *
 * `agent.runAgent()` is here and not next door on purpose. The doc page's own
 * "Advanced Usage" section shows it, but the reported defect is about the plain
 * `setState` path, so the failing route stays as the page prints it and the
 * extra button lives on this side of the pair.
 */
const AGENT_ID = "shared_state_fixed_agent";

function YourMainContent() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
  });

  const language = (agent.state.language as string) ?? "Not set";

  const toggleLanguage = () => {
    agent.setState({ language: language === "english" ? "spanish" : "english" });
  };

  const toggleAndRun = () => {
    toggleLanguage();
    void agent.runAgent();
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Your main content
      </h1>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        Language: <strong>{language}</strong>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={toggleLanguage}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
        >
          Toggle Language
        </button>
        <button
          onClick={toggleAndRun}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
        >
          Toggle + re-run agent
        </button>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {JSON.stringify(agent.state, null, 2)}
      </pre>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-write"
      subtitle={`with expose_state · graph: ${AGENT_ID}`}
    >
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        <YourMainContent />
        <div className="min-h-0 border-t border-slate-200 md:border-l md:border-t-0 dark:border-slate-800">
          <CopilotChat agentId={AGENT_ID} className="h-full" />
        </div>
      </div>
    </DemoFrame>
  );
}
