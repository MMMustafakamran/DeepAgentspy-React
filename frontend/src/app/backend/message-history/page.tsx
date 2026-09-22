import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// "Trim an agent you construct yourself", verbatim. Quoted, not mounted: the
// agent URL is a placeholder and `YourApp` is never defined.
const SELF_MANAGED_SNIPPET = `import { HttpAgent } from "@ag-ui/client";
import { CopilotKit } from "@copilotkit/react-core/v2";
import { lastTurnOnly, TrimHistoryMiddleware } from "./trim-history";

const supportAgent = new HttpAgent({ url: "https://agents.example.com/support" });
supportAgent.use(new TrimHistoryMiddleware(lastTurnOnly));

<CopilotKit selfManagedAgents={{ "support-agent": supportAgent }}>
  <YourApp />
</CopilotKit>;`;

// Observed 2026-09-22 with curl against /api/copilotkit-trimmed and
// /api/copilotkit on a live `langgraph dev`. Answers are the concatenated
// TEXT_MESSAGE_CONTENT deltas, verbatim.
const OBSERVED = `One run, transcript: "My name is Sam. Just say ok." / "Ok." / "What is my name? If you do not know, say UNKNOWN."
  /api/copilotkit-trimmed  agent default       RUN_ERROR "Cannot read properties of undefined (reading 'toString')"  (2/2)
  /api/copilotkit-trimmed  agent sample_agent  UNKNOWN  (3/3)
  /api/copilotkit          agent sample_agent  Sam      (3/3)

Two runs on one threadId, trimmed runtime, sample_agent
  run 1  (first user message only)   Ok
  run 2  (all three messages)         Sam      (3/3)`;

const DIR = "frontend/src/app/api/copilotkit-trimmed/[[...slug]]";

export default function Page() {
  return (
    <>
      <RouteHeader path="/backend/message-history" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          CopilotKit forwards the whole transcript on every run. For an agent
          that stores its own history that is a second copy, and the page shows
          three ways to forward less: a <code>messageFilter</code> prop on the
          provider, an AG-UI middleware attached inside the runtime, and the same
          middleware on an agent you construct yourself.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["My name is Sam.", "What is my name?"]}
            expect="On both tabs the second answer is Sam. Observed 2026-09-22: across two runs on one thread the trimmed runtime answered Sam 3/3, because LangGraph's checkpointer already holds the first turn. Trimming only shows when the history is not stored: one run carrying the whole transcript answered UNKNOWN through /api/copilotkit-trimmed and Sam through /api/copilotkit, 3/3 each (curl, see below)."
            fail="The Runtime middleware tab errors or never answers: /api/copilotkit-trimmed could not reach langgraph dev on :8123."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="messageFilter does not exist in any published release">
        The page&apos;s first and recommended recipe,{" "}
        <code>messageFilter=&#123;(messages) =&gt; messages.slice(-1)&#125;</code>{" "}
        on <code>&lt;CopilotKit&gt;</code>, is not a prop on{" "}
        <code>@copilotkit/react-core</code> 1.71.0 (installed) or 1.73.0 (the
        latest on npm, published 2026-09-19). It is a type error, and at runtime
        an ignored prop, so none of what the page says it does (trimming the
        request body, repairing split tool-call pairs, re-applying across agent
        replacement) happens. The demo mounts it verbatim under a{" "}
        <code>@ts-expect-error</code>, so the typecheck fails the day a release
        adds it.
      </Callout>

      <Callout tone="warn" title="The runtime snippet assumes an AG-UI endpoint this integration does not serve">
        The page builds its agent as{" "}
        <code>new HttpAgent(&#123; url: process.env.AGENT_URL! &#125;)</code>.
        An <code>HttpAgent</code> posts AG-UI to a URL; this backend is{" "}
        <code>langgraph dev</code>, which speaks the LangGraph Platform API and
        is reached with <code>LangGraphAgent</code>, as the Deep Agents
        Quickstart does. The page never says what <code>AGENT_URL</code> is, and
        there is nothing here to point it at, so the route keeps the line
        verbatim and leaves it unset. Run, the page&apos;s <code>default</code>{" "}
        agent returns{" "}
        <code>RUN_ERROR &quot;Cannot read properties of undefined (reading &apos;toString&apos;)&quot;</code>
        . The page&apos;s own claim that <code>.use()</code> is on{" "}
        <code>AbstractAgent</code> &ldquo;so this works for any agent&rdquo;
        does hold: the same middleware on the Quickstart&apos;s{" "}
        <code>LangGraphAgent</code> (<code>sample_agent</code>, marked NOT FROM
        THE PAGE) trims as described.
      </Callout>

      <Callout tone="info" title="The middleware works as published">
        <code>trim-history.ts</code> compiles on <code>@ag-ui/client</code>{" "}
        0.0.59 and the page&apos;s own check passes (
        <code>trim-history: forwarded only the answered call, next to its result</code>
        ). The check script&apos;s line{" "}
        <code>answers.add(trimmedParallel[i].toolCallId)</code> is a TS2339 error
        as published, because the loop condition does not narrow the element it
        reads again. It runs; it does not typecheck.
      </Callout>

      <Callout tone="success" title="On Deep Agents, trimming is safe because the checkpointer keeps the history">
        This is the case the page is written for. LangGraph checkpoints every
        thread, so the first turn is already on the server when the second run
        arrives with only the last user message. Observed 2026-09-22:
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {OBSERVED}
        </pre>
        <p className="mt-2">
          The single-run rows prove the middleware really drops messages: with
          no stored history, the trimmed agent never sees the name. The
          two-run rows prove that on a real thread nothing is lost. One caveat
          on the control: the curl transcript&apos;s <code>Ok.</code> carried an
          id the server had never issued, and the untrimmed runtime stored it
          as a second AI message beside the model&apos;s own reply; the trimmed
          thread held exactly four messages. That duplicate is a property of the
          hand-built transcript, not something a browser session was seen to
          do. The <code>RUN_STARTED</code> event&apos;s <code>input</code> still
          echoes all three messages on the trimmed runtime: the middleware
          rewrites what the agent receives, not what the event reports.
        </p>
      </Callout>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/backend/message-history/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Trim inside the runtime" description="The page's route, mounted at /api/copilotkit-trimmed.">
        <SourceCode file={`${DIR}/route.ts`} />
      </Panel>

      <Panel title="Write a filter for middleware" description="trim-history.ts, verbatim.">
        <SourceCode file={`${DIR}/trim-history.ts`} />
      </Panel>

      <Panel
        title="Trim an agent you construct yourself"
        description="Quoted, not mounted. selfManagedAgents is Enterprise Intelligence tier."
      >
        <CodeBlock filename="app/page.tsx" language="tsx" code={SELF_MANAGED_SNIPPET} />
      </Panel>
    </>
  );
}
