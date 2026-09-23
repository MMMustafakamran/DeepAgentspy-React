import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const TSC_OUTPUT = `$ tsc --noEmit        # 2026-09-23, both files verbatim, no @ts-expect-error
(no errors in built-in-agent-classic.ts or built-in-agent-factory.ts)

installed @copilotkit/runtime 1.73.3 (frontend/package.json declares ^1.73.3)

$ tsc --noEmit        # before the upgrade, @ts-expect-error lines removed
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

installed @copilotkit/runtime 1.71.0 (frontend/package.json declared ^1.69.0)
learnedSkills absent from 1.71.0 and 1.72.0; first present in 1.73.0 (19 Sep 2026)`;

const REUSE_TSC = `# scratch project outside this repo, the page's "Reuse an Intelligence SDK client" block verbatim
$ npm install @copilotkit/runtime@1.73.3 @copilotkit/intelligence-mastra@1.71.2 @mastra/core zod
$ npm ls @copilotkit/runtime
+-- @copilotkit/intelligence-mastra@1.71.2
| \`-- @copilotkit/runtime@1.71.2
\`-- @copilotkit/runtime@1.73.3
$ tsc --noEmit
reuse.mts(9,3): error TS2322: Type '.../node_modules/@copilotkit/runtime/.../client").CopilotKitIntelligence'
  is not assignable to type '.../node_modules/@copilotkit/intelligence-mastra/node_modules/
  @copilotkit/runtime/.../client").CopilotKitIntelligence'.
  Property '#private' in type 'CopilotKitIntelligence' refers to a different member that
  cannot be accessed from within type 'CopilotKitIntelligence'.

# same block, only the page's install line (runtime resolves to 1.71.2 alone): tsc exit 0`;

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
          Skill delivery is meant to put one Learning
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
          installs. Both of its snippets are here verbatim. They failed to
          compile on runtime 1.71.0 and compile on the 1.73.3 installed since
          2026-09-23; see below.
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

      <Callout tone="warn" title="BuiltInAgent learnedSkills: resolved at 1.73.3; failed at 1.71.0; the page states no minimum version">
        <p>
          <code>learnedSkills</code> is on no <code>BuiltInAgent</code> config
          in <code>@copilotkit/runtime</code> 1.71.0, the version installed
          here until 2026-09-23, and none in 1.72.0 either. It first appears in
          1.73.0, published 2026-09-19, two days before this page went live
          with it. This repo now declares <code>^1.73.3</code> and installs
          1.73.3, where both snippets and the{" "}
          <code>BuiltInAgentFactoryContext</code> import compile; the{" "}
          <code>@ts-expect-error</code> lines went unused and were removed. What
          remains is the page&apos;s silence: it states exact dependency ranges
          for every framework adapter below this row (LangChain{" "}
          <code>&gt;=1.2.16,&lt;2</code>, Mastra <code>&gt;=1.0.0,&lt;2</code>,
          ADK <code>&gt;=1.17,&lt;2</code>, .NET 9) and no version at all for
          the one adapter that is a CopilotKit package, so a reader on 1.72 or
          older gets the errors below with no hint why.
        </p>
        <p className="mt-2">
          On 1.71.0 factory mode failed twice over: the config option was
          unknown, and the factory argument the page describes was not there
          either. &ldquo;Every factory receives a <code>learnedSkills</code>{" "}
          object&rdquo;: on that version <code>AgentFactoryContext</code> had
          no such property, and <code>BuiltInAgentFactoryContext</code>, which
          the page tells you to import, was not an export.
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
        PyPI as of 2026-09-16, and still 404 on 2026-09-23 —{" "}
        <code>copilotkit-intelligence-langgraph</code>,{" "}
        <code>copilotkit-intelligence-adk</code>, and the base client the page
        says &ldquo;Python uses&rdquo;,{" "}
        <code>copilotkit-intelligence-runtime</code>. The TypeScript siblings{" "}
        <em>are</em> published (<code>@copilotkit/intelligence-langgraph</code>{" "}
        and <code>@copilotkit/intelligence-mastra</code>, both 1.71.2, published
        2026-09-14), so this is a Python-side gap rather than the whole feature
        being unreleased. The page states a dependency floor of LangChain{" "}
        <code>&gt;=1.2.16,&lt;2</code> and LangGraph <code>&gt;=1.1.10,&lt;2</code>{" "}
        for an adapter you cannot obtain. Since 2026-09-23 the LangGraph Python
        and ADK sections each carry a &ldquo;Python adapter pending
        release&rdquo; warning. The base client gets none: &ldquo;Python uses{" "}
        <code>copilotkit-intelligence-runtime</code>&rdquo; still reads as a
        dependency you can install, and it is also 404.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {UV_RESOLVE}
        </pre>
      </Callout>

      <Callout tone="warn" title="“Deployment requirements” says the server side may not be there either">
        The page&apos;s own closing section: “The server migration and v1
        delivery endpoint must deploy before adapters rely on them. Each adapter
        also requires a published canonical client version with the
        learned-snapshot operation.” That is the page telling you the feature
        may not be live, but it is written as a deployment note at the bottom,
        not as a prerequisite at the top. Since 2026-09-23 the page does flag
        two rows inline: LangGraph Python and Google ADK each open with a
        &ldquo;Python adapter pending release&rdquo; warning. Nothing marks
        the server side the same way: no row says whether the delivery
        endpoint is deployed, and the adapter table itself still lists both
        unpublished packages with no marker, so a reader choosing from the
        table only learns the package is missing once they reach that section.
      </Callout>

      <Callout tone="warn" title="Every snippet now ships a live placeholder revision pin">
        The 2026-09-23 sync turned the commented-out{" "}
        <code>{'// revision: "exact-revision-id"'}</code> into a live line
        in every example: both BuiltInAgent blocks, LangGraph Python and
        TypeScript, Mastra, ADK, .NET and the new client-reuse block. The page
        says to replace it with a published revision ID or remove it, and its
        &ldquo;Make sure delivery works&rdquo; section says to remove it, since
        a pinned adapter never picks up a newer revision. Pasted as printed,
        every example pins to a revision called <code>exact-revision-id</code>.
        Both BuiltInAgent files here carry it verbatim.
      </Callout>

      <Callout tone="warn" title="Reuse-a-client: apiUrl without wsUrl, and a client type from a different runtime">
        <p>
          The new &ldquo;Reuse an Intelligence SDK client&rdquo; block builds{" "}
          <code>new CopilotKitIntelligence(&#123; apiKey, apiUrl:
          process.env.INTELLIGENCE_API_URL &#125;)</code> and sets no{" "}
          <code>wsUrl</code>. The Intelligence quickstart
          (<code>/deepagents/intelligence/quickstart</code>) says of the same
          constructor: &ldquo;Set both, or set neither. [&hellip;] One URL alone
          leaves the other host on the cloud-hosted service.&rdquo; For a
          self-hosted reader, the only one who sets{" "}
          <code>INTELLIGENCE_API_URL</code>, the block does exactly that.
        </p>
        <p className="mt-2">
          <code>@copilotkit/intelligence-mastra</code> and{" "}
          <code>@copilotkit/intelligence-langgraph</code> are both still 1.71.2
          and each depends on <code>@copilotkit/runtime</code>{" "}
          <strong>1.71.2 exactly</strong> (<code>npm view</code>). An app
          already on a newer runtime therefore gets a second, nested copy, and
          the block&apos;s <code>client: intelligence</code> stops type-checking,
          because <code>CopilotKitIntelligence</code> has a private field.
          Verified in a scratch project outside this repo, nothing installed
          into the harness:
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {REUSE_TSC}
        </pre>
        <p className="mt-2">
          The block imports <code>@copilotkit/runtime/v2</code>, which neither
          adapter&apos;s install line lists; it compiles only when that import
          happens to resolve to the adapter&apos;s own 1.71.2.
        </p>
      </Callout>

      <Callout tone="warn" title="The runnable TypeScript examples: unstated .env step, a silent Mastra run, mixed placeholders">
        <p>
          LangGraph TypeScript and Mastra now say &ldquo;Save this example as{" "}
          <code>agent.mts</code>. Run it with <code>npx tsx agent.mts</code>
          &rdquo;, and the page says{" "}
          <code>npx copilotkit@latest project select</code> writes the project
          key (the Intelligence quickstart: &ldquo;writes it to{" "}
          <code>.env</code>&rdquo;). <code>tsx</code> does not load{" "}
          <code>.env</code>: with <code>FOO_FROM_DOTENV=1</code> in{" "}
          <code>.env</code>, <code>npx tsx</code> 4.23.15 on Node 26.7.0 prints{" "}
          <code>undefined</code>. So the key the CLI wrote never reaches the
          example unless the reader exports it or passes{" "}
          <code>--env-file=.env</code>, which the page never says.
        </p>
        <p className="mt-2">
          The Mastra example ends{" "}
          <code>const result = await agent.generate(&quot;Help with a
          refund.&quot;);</code> and never prints it. The LangGraph TypeScript
          one got a <code>console.log</code> in the same sync; Mastra did not,
          so the runnable example runs and shows nothing.
        </p>
        <p className="mt-2">
          Placeholders disagree within the page: &ldquo;Before you start&rdquo;
          exports{" "}
          <code>CPK_INTELLIGENCE_API_KEY=&quot;your-project-key&quot;</code> and{" "}
          <code>CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=&quot;support-learning&quot;</code>;
          &ldquo;Configure one container&rdquo; prints{" "}
          <code>CPK_INTELLIGENCE_API_KEY=cpk-...</code> and{" "}
          <code>CPK_INTELLIGENCE_LEARNING_CONTAINER_ID=expense-review</code>.
          Every code example uses <code>support-learning</code>.
        </p>
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
        description="Both published blocks, verbatim. They compile on the installed 1.73.3; the 1.71.0 errors are recorded in each file's header. Imported by nothing."
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
