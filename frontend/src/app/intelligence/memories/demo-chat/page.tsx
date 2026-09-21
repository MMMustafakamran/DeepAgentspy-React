"use client";

import {
  CopilotChat,
  CopilotKitProvider,
  useMemories,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { MemoryList } from "../memory-list";

/**
 * Memories & Recall, against this repo's two relevant runtimes.
 *
 * Left panel: the page's `MemoryList`, imported from `../memory-list.tsx`,
 * which is the page's file verbatim. It used to be a second copy here with the
 * import path corrected, because the published one did not compile; the
 * 2026-09-21 sync fixed the import upstream, so the copy is gone and the demo
 * runs the published component itself.
 *
 * Right panel: the hook's other fields, which the page names but its component
 * does not show (`realtimeStatus`, `error`), plus a save. The page teaches saving
 * over REST and MCP only; the hook's `addMemory` is the React route it does not
 * mention. The content and kind are the page's own curl example.
 *
 * The two runtimes:
 *
 *   documented     `/api/copilotkit` through the app-wide provider — the Deep
 *                  Agents Quickstart's runtime, which the page adds nothing to.
 *                  It has no `intelligence` and no `memory` option.
 *   memory-access  `/api/copilotkit-memory` — an Intelligence runtime with the
 *                  `memory: { access }` option the page never mentions. It needs
 *                  `CPK_INTELLIGENCE_API_KEY`; this harness has none, so it
 *                  answers 503 and the hook reports what a client sees then.
 *
 * The chat under the panels is harness code and names this repo's Quickstart
 * graph (`sample_agent`): the app-wide provider has no `default` agent to fall
 * back to.
 */

function MemoryProbe() {
  const { memories, isLoading, isAvailable, realtimeStatus, error, addMemory, refresh } =
    useMemories();
  const [saveResult, setSaveResult] = useState<string | null>(null);

  async function saveExample() {
    setSaveResult("saving…");
    try {
      // [3] memories: save the page's example memory
      const saved = await addMemory({
        content: "Prefers concise status updates.",
        kind: "operational",
      });
      setSaveResult(`saved · id ${saved.id}`);
    } catch (e) {
      setSaveResult(`failed · ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const rows: [string, string][] = [
    ["isAvailable", String(isAvailable)],
    ["isLoading", String(isLoading)],
    ["realtimeStatus", realtimeStatus],
    ["memories", String(memories.length)],
    ["error", error ? error.message : "null"],
  ];

  return (
    <div>
      <table data-testid="memory-probe" className="w-full text-left text-xs">
        <tbody className="font-mono">
          {rows.map(([k, v]) => (
            <tr key={k} className="border-t border-slate-200 first:border-0 dark:border-slate-800">
              <th className="w-36 py-1 pr-3 font-medium text-slate-500">{k}</th>
              <td data-testid={`memory-${k}`} className="py-1 break-all">
                {v}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="memory-save"
          onClick={() => void saveExample()}
          className="rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)]"
        >
          Save “Prefers concise status updates.”
        </button>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
        >
          Refresh
        </button>
      </div>
      {saveResult && (
        <p data-testid="memory-save-result" className="mt-2 font-mono text-xs break-all">
          {saveResult}
        </p>
      )}
    </div>
  );
}

const RUNTIMES = {
  documented: {
    label: "As documented · /api/copilotkit",
    url: "/api/copilotkit",
  },
  "memory-access": {
    label: "With memory.access · /api/copilotkit-memory",
    url: "/api/copilotkit-memory",
  },
} as const;
type RuntimeKey = keyof typeof RUNTIMES;

function Panels({ runtime }: { runtime: RuntimeKey }) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-slate-200 px-3 pt-3 text-xs text-slate-500 dark:border-slate-800">
        <p data-testid="memory-runtime" className="font-mono">
          runtime {RUNTIMES[runtime].url}
        </p>
        <div className="grid gap-4 py-3 text-sm md:grid-cols-2">
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              MemoryList (the page&apos;s file)
            </h2>
            <div data-testid="memory-list">
              <MemoryList />
            </div>
          </section>
          <section>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              useMemories()
            </h2>
            <MemoryProbe />
          </section>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <CopilotChat agentId="sample_agent" />
      </div>
    </div>
  );
}

export default function Page() {
  const [runtime, setRuntime] = useState<RuntimeKey>("documented");

  return (
    <DemoFrame parentPath="/intelligence/memories" subtitle="useMemories · two runtimes">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {(Object.keys(RUNTIMES) as RuntimeKey[]).map((key) => (
            <button
              key={key}
              type="button"
              data-testid={`memory-runtime-${key}`}
              onClick={() => setRuntime(key)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                key === runtime
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {RUNTIMES[key].label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {runtime === "documented" ? (
            // The app-wide provider, pointed at /api/copilotkit.
            <Panels key={runtime} runtime={runtime} />
          ) : (
            <CopilotKitProvider
              key={runtime}
              runtimeUrl="/api/copilotkit-memory"
              headers={{ "x-copilotkit-user-id": "demo-user" }}
            >
              <Panels runtime={runtime} />
            </CopilotKitProvider>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
