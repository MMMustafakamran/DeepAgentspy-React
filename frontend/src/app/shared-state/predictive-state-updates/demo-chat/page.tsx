"use client";

import { CopilotChat, useAgent } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "predictive_state_agent";

//#region observe-predictions
/**
 * The page's `YourMainContent`, unchanged apart from styling.
 *
 * The rows fill in while the model is still writing the `step_progress_tool`
 * call. `StateStreamingMiddleware` parses the partial tool arguments as they
 * stream and writes each complete element of `steps` into `observed_steps`, so
 * this list grows one entry at a time before the tool has even been invoked.
 */
function YourMainContent() {
  const { agent } = useAgent({
    agentId: AGENT_ID,
  });

  const observedSteps = (agent.state.observed_steps as string[]) ?? [];

  return (
    <div className="flex h-full flex-col p-6">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
        Agent Progress
      </h1>

      {observedSteps.length > 0 ? (
        <div className="mt-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Steps
          </h3>
          <ul className="mt-2 space-y-2">
            {observedSteps.map((step, i) => (
              <li
                key={i}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
              >
                {step}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Empty. Give the agent a multi-step task.
        </p>
      )}

      <pre className="mt-auto overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        {JSON.stringify(observedSteps, null, 2)}
      </pre>
    </div>
  );
}
//#endregion

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/predictive-state-updates"
      subtitle={`prebuilt variant · graph: ${AGENT_ID}`}
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
