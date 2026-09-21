import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads/lifecycle" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every lifecycle claim on the page, one button each, with the chat&apos;s
          real resolved state read back after every step: the auto-minted{" "}
          <code>threadId</code>, a remount re-minting it, re-opening the first
          thread with <code>setActiveThreadId(id, {"{"} explicit: true {"}"})</code>{" "}
          and watching its history replay, <code>startNewThread()</code>, then a
          pinned <code>threadId</code> prop that makes both setters no-op and
          survives a remount. A ledger keeps every id the chat has been on, so a
          re-mint reads as a before and after.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say hello in one short sentence."]}
            expect="Remount gives a new id and an empty chat. Open conversation returns to the first id with its messages replayed. With a threadId pinned, New chat changes nothing and the amber line shows the Ignoring startNewThread() warning."
            fail="Open conversation returns to the id but the message count stays at 0: nothing replayed, so the runtime's store is not answering connect()."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/threads/lifecycle/demo-chat/page.tsx" },
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
          ]}
          note={
            <>
              The chat sits inside a <code>CopilotChatConfigurationProvider</code>;{" "}
              <code>&lt;CopilotChat&gt;</code> inherits its{" "}
              <code>threadId</code>, and the panel reads the same provider with{" "}
              <code>useCopilotChatConfiguration()</code>, so the readouts are the
              chat&apos;s own state. History replays because the runtime runs on{" "}
              <code>InMemoryAgentRunner</code>, whose <code>connect()</code>{" "}
              replays a thread&apos;s events: the page&apos;s &ldquo;persisting
              AgentRunner&rdquo; case, for the life of the process.
            </>
          }
        />
      </Panel>

      <Panel title="Pick one source of truth">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>setActiveThreadId</code> and <code>startNewThread</code> both
          no-op with a console warning when the <code>threadId</code> is
          prop-controlled. The demo shows both halves: until you press{" "}
          <em>Pin a threadId prop</em> it passes none and the setters drive the
          chat; after, the same <em>New chat</em> button does nothing, and the
          only evidence is the warning the demo surfaces on screen.
        </p>
      </Panel>

      <Callout tone="warn" title="The page's switch snippet uses an id it never defines">
        <code>ThreadControls</code> calls{" "}
        <code>config?.setActiveThreadId(existingId, {"{"} explicit: true {"}"})</code>,
        and <code>existingId</code> appears nowhere else on the page. The demo
        supplies the first thread that held a conversation. See README section 9.
      </Callout>

      <Callout tone="info" title="Two layers, one id">
        The page separates CopilotKit&apos;s threads from the framework&apos;s own
        persistence, and for a Deep Agent that framework is LangGraph. Its
        checkpointer receives the same <code>threadId</code> as the AG-UI thread
        id, but it is not what restores this chat: the runtime&apos;s runner is.
        Nothing here reads LangGraph&apos;s checkpoint store.
      </Callout>

      <Callout tone="premium" title="Not exercised here">
        Server-side replay through CopilotKit Intelligence, the{" "}
        <code>identifyUser</code> contract, and the rest of the Rich Threads
        section. This is the only Threads page this repo tracks; the others stay
        in <code>knownUnmapped</code>.
      </Callout>
    </>
  );
}
