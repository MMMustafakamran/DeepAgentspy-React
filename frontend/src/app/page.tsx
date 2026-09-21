import Link from "next/link";

import { RouteHeader, StatusBadge } from "@/components/route-header";
import { Callout, CodeBlock, KeyValue, Panel } from "@/components/ui";
import { SourceCode } from "@/components/source-code";
import { ALL_ROUTES, DOCS_ROOT } from "@/lib/nav-config";
import { GRAPH_IDS, LANGGRAPH_DEPLOYMENT_URL } from "@/lib/agents";
import { DocDriftPanel } from "@/components/doc-drift-panel";

/** Dynamic: the doc-sync readouts below read the snapshot off disk. */
export const dynamic = "force-dynamic";

const ROUTES_WITH_AGENTS = ALL_ROUTES.filter((r) => r.agentId);

/**
 * The Introduction page's own code block, as published on 2026-09-21. Before
 * that sync the page carried no code at all: it was a `FrameworkOverview` of
 * demo links, videos and an architecture image, closed with a self-closing
 * tag. It now wraps this snippet, and its `connect.filename` names the same
 * path the block is titled with.
 */
const LANDING_ROUTE = `import { CopilotRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

const runtime = new CopilotRuntime({
  agents: {
    sample_agent: new LangGraphAgent({
      deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL!,
      graphId: "sample_agent",
      langsmithApiKey: process.env.LANGSMITH_API_KEY!,
    }),
  },
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;`;

/** The same file as the Quickstart's Deep Agent tab publishes it. */
const QUICKSTART_ROUTE = `const runtime = new CopilotRuntime({
    agents: {
        sample_agent: new LangGraphAgent({
            deploymentUrl: process.env.LANGGRAPH_DEPLOYMENT_URL || "http://localhost:8123",
            graphId: "sample_agent",
            langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
        }),
    },
    // [!code highlight:8]
    intelligence: new CopilotKitIntelligence({
      apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
    }),
    // Threads are per-user. Without this, every visitor shares one history.
    identifyUser: (request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
});

export const GET = handler;
export const POST = handler;`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/" />


      <DocDriftPanel />

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
                    {[route.agentId, ...(route.extraAgentIds ?? [])].join(", ")}
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

      <Panel
        title="The Introduction page now publishes a runtime route"
        description="Added 2026-09-21, and it is the same file the Quickstart publishes, with different contents."
      >
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The restructured landing page ends with a code block titled{" "}
          <code>app/api/copilotkit/[[...slug]]/route.ts</code>. So does the
          Quickstart&apos;s Deep Agent tab. The two blocks are not the same
          file, and nothing on either page says which one wins.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CodeBlock
            code={LANDING_ROUTE}
            language="ts"
            filename="/deepagents · app/api/copilotkit/[[...slug]]/route.ts"
          />
          <CodeBlock
            code={QUICKSTART_ROUTE}
            language="ts"
            filename="/deepagents/quickstart · same path, abridged"
          />
        </div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <li>
            The landing block has no <code>intelligence</code> and no{" "}
            <code>identifyUser</code>. Those are the two options the
            Quickstart <em>highlights</em>, and its own callout says dropping
            them falls back to SSE with an in-memory runner, which is the path
            this harness takes. The Introduction teaches the fallback as the
            default without saying that is what it is.
          </li>
          <li>
            <code>process.env.LANGGRAPH_DEPLOYMENT_URL!</code> and{" "}
            <code>process.env.LANGSMITH_API_KEY!</code> have no fallbacks here
            and both do on the Quickstart (<code>|| &quot;http://localhost:8123&quot;</code>{" "}
            and <code>|| &quot;&quot;</code>). A local <code>langgraph dev</code>{" "}
            needs no LangSmith key, so following the Introduction alone passes{" "}
            <code>undefined</code> under a type that promises a string, and
            nothing tells you the deployment URL had a default on the other
            page.
          </li>
          <li>
            The landing block exports <code>PATCH</code> and{" "}
            <code>DELETE</code>; the Quickstart&apos;s exports only{" "}
            <code>GET</code> and <code>POST</code>. Thread edit and delete
            reach the runtime on the first and 405 on the second.
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This repo keeps the Quickstart&apos;s version, widened to every graph
          in <code>langgraph.json</code>. That deviation is stated at the top
          of the file itself. Implementing both is not possible: one path, two
          published bodies.
        </p>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/api/copilotkit/[[...slug]]/route.ts" />
        </div>
      </Panel>

      <Callout tone="warn" title="The Quickstart still tells you to create the wrong file">
        <p>
          Its runtime step opens with{" "}
          <code>mkdir -p app/api/copilotkit &amp;&amp; touch
          app/api/copilotkit/route.ts</code>, then prints both of its code
          blocks under the title{" "}
          <code>app/api/copilotkit/[[...slug]]/route.ts</code>. The Introduction
          page&apos;s new block and its <code>connect.filename</code> agree with
          the titles, not with the shell line, so the shell line is now the only
          place in the section that names a plain <code>route.ts</code>.
        </p>
        <p className="mt-2">
          The two cannot both be followed. A plain <code>route.ts</code> serves
          no <code>/info</code>, so the client falls back to the single-route
          POST transport, and from <code>@copilotkit/core</code> 1.70.2 that
          path throws on a relative <code>runtimeUrl</code> before the agent
          runs; it is the mechanism this repo already documents on{" "}
          <code>/api/copilotkit-a2ui-dynamic</code>. Creating both files instead
          puts a plain route beside an optional catch-all in one segment, which
          Next.js rejects.
        </p>
      </Callout>

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
