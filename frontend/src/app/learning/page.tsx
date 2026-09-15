import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const SERVER_LOG = `GET  /api/copilotkit-learning/info   → 500
POST /api/copilotkit-learning        → 500   (single-route fallback)

⨯ Error: CopilotKitIntelligence \`apiKey\` is required and cannot be blank. It is the
  CopilotKit Intelligence project API key, normally read from the CPK_INTELLIGENCE_API_KEY
  environment variable. Run \`copilotkit project select\` to provision one for your project.

Client: runtime connection "error" · agent ready false · send button disabled on both tabs`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/learning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Learning groups Threads from one kind of work into a container,
          analyzes completed runs into Insights, and proposes Skills you review
          and publish. The only code the page asks for is one runtime callback,{" "}
          <code>getLearningContainerId</code>, that decides which container a
          new Thread joins. This route mounts that runtime verbatim at{" "}
          <code>/api/copilotkit-learning</code> with one agent it assigns
          (<code>expense-agent</code>) and one it does not
          (<code>sample_agent</code>, the Deep Agents Quickstart&apos;s id), both
          on the Quickstart graph.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "On expense-agent: Review this expense: $42 team lunch, receipt attached.",
              "On sample_agent: Say hello in five words.",
            ]}
            expect="Both agents answer; expense-agent's Thread shows up in the expense-review container in the dashboard."
            fail="What actually happens here: neither tab can send — the page's runtime fails at load without an Intelligence key. See below."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Without an Intelligence key the page's runtime does not load">
        <code>apiKey: process.env.CPK_INTELLIGENCE_API_KEY!</code> — the{" "}
        <code>!</code> tells the type checker the key is there, and the page
        never says it has to be. This harness has no key, locally or in CI, so
        the constructor throws at import time, the route answers 500, the
        provider lands in <code>error</code>, and the chat on either tab never
        enables its send button. Mounted anywhere shared, the same line would
        take down every chat on that runtime; here it is isolated on its own
        route. The page names the Intelligence Quickstart as a prerequisite
        only implicitly.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SERVER_LOG}
        </pre>
      </Callout>

      <Callout tone="warn" title="The snippet leans on two things it never defines">
        <code>new CopilotRuntime({"{ agents, intelligence, identifyUser }"})</code>{" "}
        — <code>agents</code> and <code>identifyUser</code> appear nowhere else
        on the page. They are supplied in <code>lib/learning-runtime.ts</code>,
        above the verbatim block, and marked as this harness&apos;s. For Deep
        Agents, <code>agents</code> means <code>LangGraphAgent</code>s keyed by
        the id the selector tests — <code>expense-agent</code> is not a graph id
        this backend has, so it is mapped onto the Quickstart graph.
      </Callout>

      <Callout tone="warn" title="No version floor">
        <code>getLearningContainerId</code> exists on{" "}
        <code>CopilotKitIntelligence</code> from runtime 1.70; on the 1.69.0
        this repo&apos;s lockfile pins, the option is a type error (1.69.0 has
        only the <code>ɵlearning</code> runtime option). The page names no
        version, and its coding-agent prompt tells you not to use the
        deprecated <code>ɵlearning</code> option without saying that is what
        older runtimes have instead.
      </Callout>

      <Callout tone="info" title="Automatic skill delivery is documented elsewhere">
        The 2026-09-15 sync added a line pointing at{" "}
        <code>/deepagents/intelligence/learned-skills</code> for &ldquo;automatic
        learned skill delivery&rdquo; through a framework-native adapter, and
        reframes the CLI workflow below as the manual/offline path. That page is
        new, is not in this repo&apos;s snapshot, and has no route here — the
        adapter it describes is untested, so nothing on this route exercises the
        automatic path.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Container assignment itself (what happens when a Thread is routed to{" "}
        <code>expense-review</code>, and whether a container that does not
        exist breaks the run), creating a container, Run Learning, reviewing
        Insights, approving a Skill, and <code>copilotkit skills download</code>{" "}
        all need a provisioned Intelligence project and a dashboard login this
        harness does not have. They are not on the clip, and nothing here says
        whether they work.
      </Callout>

      <Panel title="Source">
        <SourceCode file="frontend/src/lib/learning-runtime.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/learning/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
