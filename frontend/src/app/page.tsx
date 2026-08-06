import Link from "next/link";

import { RouteHeader, StatusBadge } from "@/components/route-header";
import { Callout, KeyValue, Panel } from "@/components/ui";
import { ALL_ROUTES, DOCS_ROOT, DOC_SYNC_DATE } from "@/lib/nav-config";
import { GRAPH_IDS, LANGGRAPH_DEPLOYMENT_URL } from "@/lib/agents";

const ROUTES_WITH_AGENTS = ALL_ROUTES.filter((r) => r.agentId);

export default function Page() {
  return (
    <>
      <RouteHeader path="/" />

      <Panel title="What this is">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A working implementation of every Deep Agents doc page listed in the
          nav, one route each. Each route pairs notes with the repo&apos;s own
          source
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Deep Agents is Python. The agents are LangGraph graphs built with{" "}
          <code>create_deep_agent</code>, served by the LangGraph dev server, and
          reached through a Next route running <code>CopilotRuntime</code>
        </p>
        <div className="mt-4">
          <KeyValue
            rows={[
              [
                "Doc root",
                <a
                  key="d"
                  href={DOCS_ROOT}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] underline underline-offset-4"
                >
                  {DOCS_ROOT}
                </a>,
              ],
              ["Agent server", <code key="u">{LANGGRAPH_DEPLOYMENT_URL}</code>],
              ["Graphs served", `${GRAPH_IDS.length}`],
            ]}
          />
        </div>
      </Panel>

      <Panel
        title="Graph roster"
        description="Every route that drives a real agent, and the langgraph.json graph id it addresses."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                <th className="pb-2 pr-4 font-medium">Route</th>
                <th className="pb-2 pr-4 font-medium">Graph id</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {ROUTES_WITH_AGENTS.map((route) => (
                <tr key={route.path}>
                  <td className="py-2.5 pr-4">
                    <Link
                      href={route.path}
                      className="text-[var(--accent)] underline underline-offset-4"
                    >
                      {route.title}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {route.agentId}
                  </td>
                  <td className="py-2.5">
                    <StatusBadge status={route.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Three routes have no agent: Input/Output Schemas, Workflow Execution,
          and the custom-graph half of Predictive State Updates. Their doc pages
          describe hand-built LangGraph <code>StateGraph</code>s rather than Deep
          Agents, and print them only in part — so they are notes, not demos.
        </p>
      </Panel>

      <Panel title="Nothing here is invented">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          No tool, hook or config on any route was made up. Everything traces to
          the doc page that route links to. Where a page omits something needed
          to make it run — a <code>create_deep_agent</code> call, a graph
          manifest, a schema JSON file — the gap is named on the route itself and
          in the repo README rather than quietly filled in.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Where a page is plainly wrong against the shipped packages, the route
          puts its code and this repo&apos;s side by side and says so.
        </p>
      </Panel>

      <Callout tone="info" title="Where to start">
        <p>
          <Link href="/quickstart" className="underline underline-offset-4">
            Quickstart
          </Link>{" "}
          proves the whole stack is connected in one message. If it streams a
          reply, every other route&apos;s plumbing is fine and anything you hit
          after that is about that page&apos;s feature.
        </p>
        <p className="mt-2">
          <Link href="/status" className="underline underline-offset-4">
            Status overview
          </Link>{" "}
          is the QA table:{" "}
          {ALL_ROUTES.filter((r) => r.status === "working").length} working,{" "}
          {ALL_ROUTES.filter((r) => r.status === "partial").length} partial,{" "}
          {ALL_ROUTES.filter((r) => r.status === "reference").length} reference,{" "}
          {ALL_ROUTES.filter((r) => r.status === "broken").length} broken.
        </p>
      </Callout>
    </>
  );
}
