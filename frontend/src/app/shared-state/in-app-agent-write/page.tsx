import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_SET_STATE = `// the page
agent.setState({ language: language === "english" ? "spanish" : "english" });

// here
agent.setState({
  ...agent.state,
  language: language === "english" ? "spanish" : "english",
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-write" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The other direction of{" "}
          <Link
            href="/shared-state/in-app-agent-read"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Reading agent state
          </Link>{" "}
          — the two doc pages print identical Python and share one agent here.{" "}
          <code>agent.setState</code> writes from the app; the value travels with
          the next run.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two buttons, because the page has two variants. <strong>Toggle
          Language</strong> writes and waits — nothing happens until you send a
          message. <strong>Toggle + runAgent()</strong> is the page&apos;s
          &ldquo;Advanced Usage&rdquo; section: it starts a run immediately, and
          the agent replies in the new language without you typing anything.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Tell me a fun fact about octopuses",
              "(then hit Toggle Language and ask again)",
            ]}
            expect={
              <>
                First answer in English. Toggle to <code>spanish</code>, ask
                again, and the second answer is in Spanish — the panel and the
                JSON dump both show the new value. <strong>Toggle +
                runAgent()</strong> produces a fresh reply on its own, no typing.
              </>
            }
            fail="The label flips but the agent keeps answering in English. That means the write landed but the model never saw it — check `expose_state` on CopilotKitMiddleware."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-write/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="Shared with the Reading route."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/shared_state.py", region: "agent-state" },
            { file: "backend/src/shared_state.py", region: "agent" },
          ]}
        />
      </Panel>

      {/* <Callout tone="warn" title="Writing state is not the same as the model seeing it">
        <p>
          This is the gap that makes the page&apos;s own demo fail as written.{" "}
          <code>setState</code> puts <code>language</code> on the agent, and the
          agent can read it in tools and hooks — but nothing puts it in front of
          the LLM, so the reply stays in English no matter what the toggle says.
        </p>
        <p className="mt-2">
          The fix is{" "}
          <code>CopilotKitMiddleware(expose_state=[&quot;language&quot;])</code>,
          which serialises the named keys into the system message on every model
          call. It is real API in <code>copilotkit 0.1.94</code> and defaults to
          off — deliberately, so state is not leaked into prompts by accident.
          Neither Shared State page mentions it exists.
        </p>
      </Callout>

      <Callout tone="warn" title="setState replaces, it does not merge">
        <div className="mt-2">
          <CodeBlock code={DOC_SET_STATE} language="tsx" />
        </div>
        <p className="mt-3">
          <code>AbstractAgent.setState</code> assigns:{" "}
          <code>this.state = structuredClone(newState)</code>. The page&apos;s
          one-key object therefore discards every other key the agent had —
          including <code>copilotkit</code>, which is where frontend tools live.
          Spreading <code>agent.state</code> first keeps them. On this agent the
          difference is invisible because <code>language</code> is the only field
          that matters; on a richer one it is a data-loss bug.
        </p>
      </Callout>

      <Callout tone="info" title="agent.runAgent takes no arguments here">
        <p>
          The page calls <code>agent.runAgent()</code> bare and that is correct —
          it picks up the state you just wrote because{" "}
          <code>prepareRunAgentInput</code> reads <code>this.state</code> at call
          time. There is no need to pass the new value through.
        </p>
      </Callout> */}
    </>
  );
}
