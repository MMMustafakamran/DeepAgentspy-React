import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const TSC_OUTPUT = `$ tsc --noEmit        # both files with the @ts-expect-error lines removed
src/app/intelligence/learned-skills/built-in-agent-classic.ts(6,3): error TS2353:
  Object literal may only specify known properties, and 'learnedSkills' does not
  exist in type 'BuiltInAgentConfiguration'.
src/app/intelligence/learned-skills/built-in-agent-factory.ts(11,3): error TS2353:
  Object literal may only specify known properties, and 'learnedSkills' does not
  exist in type 'BuiltInAgentClassicConfig | BuiltInAgentAISDKFactoryConfig'.
src/app/intelligence/learned-skills/built-in-agent-factory.ts(12,35): error TS2339:
  Property 'learnedSkills' does not exist on type 'AgentFactoryContext'.
src/app/intelligence/learned-skills/built-in-agent-factory.ts(3,3): error TS2724:
  '"@copilotkit/runtime/v2"' has no exported member named
  'BuiltInAgentFactoryContext'. Did you mean 'AgentFactoryContext'?

installed @copilotkit/runtime 1.71.0 (frontend/package.json declares ^1.69.0)
learnedSkills absent from 1.71.0 and 1.72.0; first present in 1.73.0 (19 Sep 2026)`;

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
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The 2026-09-21 sync added a sixth row to the adapter table,{" "}
          <strong>BuiltInAgent</strong>, whose package is{" "}
          <code>@copilotkit/runtime/v2</code>, the one this repo already
          installs. Both of its snippets are here verbatim, and both fail to
          compile on the installed runtime; see below.
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

      <Callout tone="warn" title="BuiltInAgent has no learnedSkills on the shipped runtime">
        <p>
          <code>learnedSkills</code> is on no <code>BuiltInAgent</code> config
          in <code>@copilotkit/runtime</code> 1.71.0, the version installed
          here, and none in 1.72.0 either. It first appears in 1.73.0, published
          2026-09-19, two days before this page went live with it. The page
          states exact dependency ranges for every framework adapter below this
          row (LangChain <code>&gt;=1.2.16,&lt;2</code>, Mastra{" "}
          <code>&gt;=1.0.0,&lt;2</code>, ADK <code>&gt;=1.17,&lt;2</code>, .NET
          9) and no version at all for the one adapter that is a CopilotKit
          package.
        </p>
        <p className="mt-2">
          Factory mode fails twice over: the config option is unknown, and the
          factory argument the page describes is not there either. &ldquo;Every
          factory receives a <code>learnedSkills</code> object&rdquo;: on this
          version <code>AgentFactoryContext</code> has no such property, so{" "}
          <code>learnedSkills.catalog</code> and{" "}
          <code>learnedSkills.tools</code> have nothing to read. The page also
          tells you to import <code>BuiltInAgentFactoryContext</code>, which is
          not an export; <code>tsc</code> suggests{" "}
          <code>AgentFactoryContext</code>, which is the type the installed
          factory argument actually has.
        </p>
        <p className="mt-2">
          The factory snippet imports <code>ai</code> and{" "}
          <code>@ai-sdk/openai</code> with no install step anywhere on the page.
          Neither is in this repo&apos;s <code>frontend/package.json</code>;
          they resolve only because <code>@copilotkit/runtime</code> depends on
          them and npm hoists them.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="warn" title="The Python adapter this page names is not published">
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
        BuiltInAgent, LangGraph, Mastra, Google ADK and Microsoft Agent
        Framework. Agno is not on it at all, and the only Microsoft Agent
        Framework entry is{" "}
        <code>CopilotKit.Intelligence.AgentFramework</code>, a .NET 9 package,
        under a section whose backend is Python. Deep Agents is the one flavour
        of the three with a nominally matching framework adapter, and that is
        the one that 404s. The BuiltInAgent row added on 2026-09-21 is the only
        one that belongs to no framework at all: it is CopilotKit&apos;s own
        runtime-side agent, so it replaces the Deep Agent rather than attaching
        to it.
      </Callout>

      <Callout tone="warn" title="The read-tools rule now has two opposite halves">
        Before this sync the section read &ldquo;Both tools remain registered
        even when the snapshot is empty&rdquo;. It now reads &ldquo;The
        framework adapters keep both tools registered even when the snapshot is
        empty. BuiltInAgent omits both tools for an empty snapshot; its factory
        receives <code>tools: {"{}"}</code>.&rdquo; So whether a reserved tool
        name exists on an empty container depends on which row of the table you
        took, and the page reserves both names globally either way.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Everything past installation: the freshness window and shared refresh,
        per-invocation snapshot pinning, <code>latest</code> versus an exact{" "}
        <code>CPK_INTELLIGENCE_SKILLS_REVISION</code>, revocation blocking new
        invocations, the stale-snapshot fallback, and the read-only status
        fields (<code>initialized</code>, <code>revision</code>,{" "}
        <code>lastCheckedAt</code>, <code>stale</code>, <code>lastError</code>).
        All of it needs the adapter plus a provisioned Learning container with
        published skills. Nothing here says whether any of it works. The same
        goes for the dashboard half the new opening callout adds: checking that{" "}
        <strong>Skill delivery</strong> shows enabled in the container&apos;s{" "}
        <strong>Skills</strong> tab, and the{" "}
        <strong>Set up skill delivery</strong> prompt it tells you to copy into
        a coding agent. Both are behind a login this harness does not have.
      </Callout>

      <Panel
        title="The BuiltInAgent snippets"
        description="Both published blocks, verbatim, with the compiler errors acknowledged in place. Imported by nothing."
      >
        <SourceCode file="frontend/src/app/intelligence/learned-skills/built-in-agent-classic.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/intelligence/learned-skills/built-in-agent-factory.ts" />
        </div>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/learned-skills/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
