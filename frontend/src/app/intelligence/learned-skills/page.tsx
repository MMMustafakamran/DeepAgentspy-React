import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const UV_RESOLVE = `$ uv pip install copilotkit-intelligence-langgraph

  × No solution found when resolving dependencies:
  ╰─▶ Because copilotkit-intelligence-langgraph was not found in the package
      registry and you require copilotkit-intelligence-langgraph, we can
      conclude that your requirements are unsatisfiable.

$ curl -o /dev/null -w '%{http_code}' https://pypi.org/pypi/copilotkit-intelligence-langgraph/json
404
$ curl -o /dev/null -w '%{http_code}' https://pypi.org/pypi/copilotkit-intelligence-runtime/json
404`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/intelligence/learned-skills" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Automatic learned skill delivery is meant to put one Learning
          container&apos;s published skills in front of an agent without a CLI
          download or a restart. A framework adapter adds an alphabetical
          catalog and two tools —{" "}
          <code>copilotkit_load_skill</code> and{" "}
          <code>copilotkit_read_skill_file</code> — and the model decides when
          to load a skill. For this repo the page names the LangGraph Python
          adapter, <code>copilotkit-intelligence-langgraph</code>, with{" "}
          <code>create_skill_registry_middleware</code> attached to a{" "}
          <code>create_agent</code> agent.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "List the skills you can load, then load the refund-policy skill and follow it.",
            ]}
            expect="The agent calls copilotkit_load_skill, reads SKILL.md, and answers following the published skill."
            fail="What actually happens: the agent answers from its own instructions. Neither tool exists, because the adapter the page names cannot be installed."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The adapter this page names is not published">
        Every Python package on the page&apos;s adapter table is absent from
        PyPI as of 2026-09-16 — <code>copilotkit-intelligence-langgraph</code>,{" "}
        <code>copilotkit-intelligence-adk</code>, and the base client the page
        says &ldquo;Python uses&rdquo;,{" "}
        <code>copilotkit-intelligence-runtime</code>. The TypeScript siblings{" "}
        <em>are</em> published (<code>@copilotkit/intelligence-langgraph</code>{" "}
        and <code>@copilotkit/intelligence-mastra</code>, both 1.71.2, published
        2026-09-14), so this is a Python-side gap rather than the whole feature
        being unreleased. The page states a dependency floor of LangChain{" "}
        <code>&gt;=1.2.16,&lt;2</code> and LangGraph <code>&gt;=1.1.10,&lt;2</code>{" "}
        for an adapter you cannot obtain.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {UV_RESOLVE}
        </pre>
      </Callout>

      <Callout tone="warn" title="“Deployment requirements” says the server side may not be there either">
        The page&apos;s own closing section: “The server migration and v1
        delivery endpoint must deploy before adapters rely on them. Each adapter
        also requires a published canonical client version with the
        learned-snapshot operation.” That is the page telling you the feature
        may not be live — but it is written as a deployment note at the bottom,
        not as a prerequisite at the top, and nothing earlier on the page is
        marked unavailable. A reader following it in order writes the middleware
        first and discovers the package does not exist.
      </Callout>

      <Callout tone="warn" title="Published under three sections, applicable to one">
        This page is served identically at{" "}
        <code>/deepagents/intelligence/learned-skills</code>,{" "}
        <code>/agno/…</code> and <code>/ms-agent-python/…</code> — byte-identical
        apart from the flavour in its own links. Its adapter table lists
        LangGraph, Mastra, Google ADK and Microsoft Agent Framework. Agno is not
        on it at all, and the only Microsoft Agent Framework entry is{" "}
        <code>CopilotKit.Intelligence.AgentFramework</code>, a .NET 9 package,
        under a section whose backend is Python. Deep Agents is the one flavour
        of the three with a nominally matching adapter, and that is the one that
        404s.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Everything past installation: the freshness window and shared refresh,
        per-invocation snapshot pinning, <code>latest</code> versus an exact{" "}
        <code>CPK_INTELLIGENCE_SKILLS_REVISION</code>, revocation blocking new
        invocations, the stale-snapshot fallback, and the read-only status
        fields (<code>initialized</code>, <code>revision</code>,{" "}
        <code>lastCheckedAt</code>, <code>stale</code>, <code>lastError</code>).
        All of it needs the adapter plus a provisioned Learning container with
        published skills. Nothing here says whether any of it works.
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/learned-skills/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
