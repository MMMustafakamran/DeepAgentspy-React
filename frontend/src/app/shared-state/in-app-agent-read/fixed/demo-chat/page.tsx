"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The Reading agent state demo, against the graph the doc page is missing a line of.
 *
 * The React here is byte-for-byte the sibling at `../../demo-chat`. Only
 * `AGENT_ID` differs, and it points at `shared_state_fixed_agent` --
 * `src/shared_state_fixed.py`, which is `src/shared_state.py` plus
 * `CopilotKitMiddleware(expose_state=["language"])` and a middleware that seeds
 * the key on the first turn.
 *
 * That equality is the point. This route exists to be recorded immediately
 * after the failing one, and the only claim the pair makes is that nothing on
 * the frontend had to change. Edit this page and you have to make the same edit
 * next door, or the comparison stops being one.
 */
const AGENT_ID = "shared_state_fixed_agent";

function YourMainContent() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
  });

  const language = (agent.state.language as string) ?? "Not Set";

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Your main content
      </h1>
      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
        Language: <strong>{language}</strong>
      </p>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {JSON.stringify(agent.state, null, 2)}
      </pre>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-read"
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
