import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          UI outside the chat that tracks the agent while it is still working. A
          Deep Agent&apos;s state normally only reaches the frontend when a node
          finishes; <code>copilotkit_emit_state</code> pushes it mid-node, so a
          three-second task shows three steps completing rather than one long
          spinner.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The panel on the left of the demo is the page&apos;s{" "}
          <code>YourMainContent</code>: one <code>useAgent</code> call, then
          ordinary React over <code>agent.state.searches</code>. It re-renders on
          its own because <code>agent.state</code> is reactive.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Research the history of the espresso machine",
              "Look into why the sky is blue",
            ]}
            expect={
              <>
                Three rows appear at once, all ⏳, then flip to ✅ one per
                second. They stay on screen after the reply lands — the JSON
                dump at the bottom shows the persisted list.
              </>
            }
            fail="Rows that appear and then vanish mean the emitted state was never returned by the node. Rows that all appear ✅ at once mean the deltas were batched rather than streamed."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent, in the page's three parts"
        description="State, the emit coroutine, and the glue the page leaves out."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/state_rendering.py", region: "agent-state" },
            { file: "backend/src/state_rendering.py", region: "emit-state" },
            { file: "backend/src/state_rendering.py", region: "glue" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="What the page leaves out">
        <p>
          The page prints <code>AgentState</code> and{" "}
          <code>emit_research_progress</code> and stops. Neither is attached to
          anything — the prose says only that the coroutine belongs
          &ldquo;inside a custom tool or middleware hook where you have access to
          state and config&rdquo;. Two decisions follow from that, and both are
          in the <code>glue</code> block above rather than hidden:
        </p>
        <p className="mt-2">
          <strong>1. The state needs a carrier.</strong>{" "}
          <code>create_deep_agent</code> has no <code>state=</code> parameter, so{" "}
          <code>AgentState</code> is attached through an{" "}
          <code>AgentMiddleware</code> with{" "}
          <code>state_schema = AgentState</code>. That is the mechanism the
          Interrupt-based page documents for exactly this, so it is used here.
        </p>
        <p className="mt-2">
          <strong>2. The coroutine needs a caller.</strong> A{" "}
          <code>@tool</code> is the one place in a prebuilt Deep Agent that gets
          handed a <code>RunnableConfig</code>, and{" "}
          <code>copilotkit_emit_state</code> needs one. So a <code>research</code>{" "}
          tool calls it. This is the page&apos;s own first suggestion, made
          concrete.
        </p>
      </Callout>

      <Callout tone="info" title="Emitted state is a prediction">
        <p>
          <code>copilotkit_emit_state</code> streams a value to the frontend; it
          does not write it into the graph. When the node returns, whatever it
          returns becomes the state, and anything only emitted is lost — the
          rows would appear and then vanish. The Predictive State Updates page
          says this outright; this page does not, even though its example has
          the same problem. The <code>research</code> tool therefore returns a{" "}
          <code>Command(update=...)</code> carrying the final list.
        </p>
      </Callout>
    </>
  );
}
