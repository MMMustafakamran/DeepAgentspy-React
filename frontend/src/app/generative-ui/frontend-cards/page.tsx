import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const THROWN = `useAgent: Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit).
Known agents: [sample_agent, tool_rendering_agent, state_rendering_agent, interrupt_agent, …]
Verify your runtime /info and/or agents__unsafe_dev_only.`;

const TIMELINE = `  ~0.6s  SSR paint: chat visible · useAgent() → "default" · isReady false · runtime disconnected
  ~2.7s  GET /api/copilotkit/info → 200
  ~2.9s  useAgent() throws (above) → the provider's subtree is gone        (3 of 3 warm loads)`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/frontend-cards" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A card your app puts in the chat on its own — a job finished, a
          socket pushed something — with no agent turn behind it. It is a
          message with <code>role: &quot;activity&quot;</code>: the transcript
          renders it through a registered renderer, and it is stripped from
          every run request, so the model never sees it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "On “As published”: just wait two seconds.",
              "On “+ agent=\"sample_agent\"”: click “Simulate: deployment finished”, then ask: Have you been shown any deployment card?",
            ]}
            expect="Per the page, the first tab would already work. What happens: the first tab throws and shows the error; on the second the card appears, the probe reads agent.messages = activity, user, assistant and run payload = user, and the agent says it saw no card."
            fail="The second tab's card never renders, or its payload row lists activity (the agent received it)."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="As published, the route crashes: there is no `default` agent">
        Step 2&apos;s provider has only <code>runtimeUrl</code> and{" "}
        <code>renderActivityMessages</code>; step 3&apos;s{" "}
        <code>useAgent()</code> and step 2&apos;s <code>&lt;CopilotChat /&gt;</code>{" "}
        pass no agent id, so both resolve to <code>&quot;default&quot;</code>. A
        Deep Agents runtime registers its LangGraph graphs by graph id — the
        Quickstart&apos;s is <code>sample_agent</code> — and has no{" "}
        <code>default</code>. The chat paints, then{" "}
        <code>useAgent()</code> throws the moment <code>/info</code> answers.
        On react-core 1.71.0 the error is not a <code>CopilotKitError</code>,
        so the provider&apos;s own error boundary rethrows it and, without the
        harness boundary this demo adds, it takes the whole route down. The
        page is byte-identical under every framework prefix and never mentions
        the agent id at all.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {THROWN}
        </pre>
        <pre className="mt-2 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TIMELINE}
        </pre>
      </Callout>

      <Callout tone="success" title="With the Quickstart's `agent` prop, the central claim holds">
        The second tab is step 2&apos;s provider plus{" "}
        <code>agent=&quot;sample_agent&quot;</code> — the prop the Deep Agents
        Quickstart puts on its own provider, and not from this page. Checked
        against the request that actually left the browser, not the
        library&apos;s own bookkeeping: with a card in the transcript, the run
        payload to <code>/agent/sample_agent/run</code> carried only{" "}
        <code>user</code>, and the agent answered &quot;I haven&apos;t been
        shown any deployment card in this conversation.&quot; Runtime and
        react-core 1.71.0 (this repo&apos;s lockfile pins 1.69.0).
      </Callout>

      <Callout tone="warn" title="A card added before the runtime connects is silently lost">
        Until <code>/info</code> answers, <code>useAgent()</code> returns a
        provisional agent (<code>isReady: false</code>). <code>addMessage</code>{" "}
        on it succeeds and even updates <code>agent.messages</code> — and when
        the real agent replaces it a moment later, the card is gone, with no
        error anywhere. Reproduced 3 of 3 on the second tab by clicking with{" "}
        <code>/info</code> held back 4&nbsp;s. The page&apos;s warning is about
        agents you construct yourself; it never mentions <code>isReady</code>,
        which is the only thing that tells you a socket event arriving at
        startup will be dropped.
      </Callout>

      <Callout tone="warn" title="Step 3 is never wired to step 2">
        Step 2&apos;s <code>Page</code> renders <code>&lt;CopilotChat /&gt;</code>{" "}
        and nothing else; step 3 builds <code>&lt;DeploymentWatcher /&gt;</code>{" "}
        and never says where it goes. It has to be under the provider for{" "}
        <code>useAgent()</code> to work — this route mounts it there. And its
        socket is <code>wss://example.com/deployments</code>, a placeholder that
        404s the handshake, so mounted as published it never adds a card. The
        demo&apos;s button calls the same <code>addMessage</code>, which the page
        names as an equivalent trigger.
      </Callout>

      <Panel title="Source">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/frontend-cards/event-card.tsx" },
            { file: "frontend/src/app/generative-ui/frontend-cards/deployment-watcher.tsx" },
          ]}
        />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/generative-ui/frontend-cards/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
