import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_MANUAL = `from copilotkit.langgraph import copilotkit_emit_state
# ...
async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["cpk_action_node", "tool_node", "__end__"]]:
    # ...

    # Simulate executing steps one by one
    steps = [
        "Analyzing input data...",
        "Identifying key patterns...",
        "Generating recommendations...",
        "Formatting final output..."
    ]

    for step in steps:
        state["observed_steps"] = state.get("observed_steps", []) + [step]
        await copilotkit_emit_state(config, state)
        await asyncio.sleep(1)

    # ...`;

const DOC_TOOL = `from copilotkit.langgraph import copilotkit_customize_config
# ... (full imports on the doc page)

@tool
def step_progress_tool(steps: list[str]):
    """Reads and reports steps"""

async def frontend_actions_node(state: AgentState, config: RunnableConfig):
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {
                "state_key": "observed_steps",
                "tool": "step_progress_tool",
                "tool_argument": "steps"
            },
        ]
    )

    system_message = SystemMessage(
        content=f"You are a task performer. Pretend doing tasks you are given, report the steps using step_progress_tool."
    )

    model = ChatOpenAI(model="gpt-4").bind_tools(
        [
            *state["copilotkit"]["actions"],
            step_progress_tool
        ],
    )

    response = await model.ainvoke([system_message, *state["messages"]], config)

    if isinstance(response, AIMessage) and response.tool_calls and response.tool_calls[0].get("name") == 'step_progress_tool':
        return Command(
            goto=END,
            update={
                "messages": response,
                "observed_steps": response.tool_calls[0].get("args", None).get('steps')
            }
        )

    return Command(goto=END, update={"messages": response})`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/predictive-state-updates" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Showing the user what the agent is doing before it has finished doing
          it. A Deep Agent&apos;s state only reaches the frontend at node
          boundaries, and a single node can run for many seconds — predictive
          state updates push a running approximation out in the meantime.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page splits three ways, and this route follows that split: the
          prebuilt-agent variant is live below, and both custom-graph variants
          are reproduced as reference.
        </p>
      </Panel>

      <Panel
        title="Variant 1 — Prebuilt agent"
        description="?agent-type=prebuilt · live · the only variant that applies to create_deep_agent"
      >
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>StateStreamingMiddleware</code> takes{" "}
          <code>StateItem</code> mappings from a tool argument to a state key.
          Nothing calls an emit function: the middleware parses the model&apos;s
          partial tool-call arguments as they stream and writes each completed
          element into state. The tool body is empty on purpose — it exists to
          give the model an argument shape to fill in.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Plan and execute a website redesign",
              "Do a competitive analysis of three note-taking apps",
            ]}
            expect={
              <>
                Step rows appear on the left one at a time, while the model is
                still writing them — noticeably before the chat message
                completes. They persist after the run.
              </>
            }
            fail="All rows appearing at once, after the reply, means the streaming middleware did not intercept and you are seeing the ordinary end-of-node state sync."
          />
        </div>
        <div className="mt-4 space-y-4">
          <SourceCodeGroup
            files={[
              { file: "backend/src/predictive_state.py", region: "agent-state" },
              { file: "backend/src/predictive_state.py", region: "prebuilt-agent" },
            ]}
          />
          <SourceCode file="frontend/src/app/shared-state/predictive-state-updates/demo-chat/page.tsx" />
        </div>
      </Panel>

      <Panel
        title="Variant 2 — Custom graph, manual emission"
        description="?agent-type=custom-graph&state-emission=manual-emission · a StateGraph you write"
      >
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Full control: you call <code>copilotkit_emit_state</code> yourself
          wherever you want a checkpoint. Four fixed steps, one second apart, so
          the pacing is visible. No Deep Agent involved — one node, two edges,
          compiled with a <code>MemorySaver</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Summarise the last quarter"]}
            expect={
              <>
                Exactly four rows — &ldquo;Analyzing input data...&rdquo; through
                &ldquo;Formatting final output...&rdquo; — appearing one per
                second before any reply text, then an ordinary answer. The rows
                persist, because the node returns <code>observed_steps</code> as
                well as emitting it.
              </>
            }
            fail="Rows that appear and then vanish mean the node emitted without returning."
          />
        </div>
        <div className="mt-4">
          <SourceCodeGroup
            files={[
              { file: "backend/src/predictive_state_manual.py", region: "agent-state" },
              { file: "backend/src/predictive_state_manual.py", region: "chat-node" },
              { file: "backend/src/predictive_state_manual.py", region: "graph" },
            ]}
          />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This is the page&apos;s Python as printed — the half it gives:
        </p>
        <div className="mt-3">
          <CodeBlock code={DOC_MANUAL} language="python" filename="the doc page" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A node with no graph around it: no <code>StateGraph</code>, no{" "}
          <code>add_node</code>, no <code>compile</code>, no model call, and no
          imports for <code>asyncio</code>, <code>Command</code>,{" "}
          <code>Literal</code> or <code>RunnableConfig</code>. Its return type
          also promises a jump to <code>cpk_action_node</code>, named nowhere on
          the page.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The missing half is on the <strong>same page&apos;s TypeScript
          tab</strong>, which prints the annotation, the model call, the wiring
          and the <code>compile</code> in full. So the node body above is the
          Python tab&apos;s and the scaffolding is the TypeScript tab&apos;s,
          translated — no third source. The unreachable{" "}
          <code>cpk_action_node</code> is dropped from the signature, since this
          graph goes straight to <code>END</code> exactly as the TypeScript
          tab&apos;s does.
        </p>
      </Panel>

      <Panel
        title="Variant 3 — Custom graph, tool emission"
        description="?agent-type=custom-graph&state-emission=tool-emission · the same mapping, on the config"
      >
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same tool-argument-to-state-key mapping as Variant 1, but declared
          on the <code>RunnableConfig</code> with{" "}
          <code>copilotkit_customize_config</code> instead of as middleware.{" "}
          <code>StateStreamingMiddleware</code> is the packaged version of
          exactly this.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Migrate a database to a new schema"]}
            expect={
              <>
                Steps stream into the panel as the model writes the{" "}
                <code>step_progress_tool</code> call, then the node returns a{" "}
                <code>Command</code> that copies the same argument into{" "}
                <code>observed_steps</code> so it persists.
              </>
            }
            fail="Steps that only appear after the reply mean emit_intermediate_state was not applied to the config the model was invoked with."
          />
        </div>
        <div className="mt-4">
          <SourceCodeGroup
            files={[
              { file: "backend/src/predictive_state_tool.py", region: "agent-state" },
              { file: "backend/src/predictive_state_tool.py", region: "frontend-actions-node" },
              { file: "backend/src/predictive_state_tool.py", region: "graph" },
            ]}
          />
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The most complete of the page&apos;s Python snippets — it carries its
          own import block, the tool, the mapping, the model call and both{" "}
          <code>Command</code> returns. <code>frontend_actions_node</code> above
          is it unedited:
        </p>
        <div className="mt-3">
          <CodeBlock code={DOC_TOOL} language="python" filename="the doc page" />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Only the state class and the graph builder are missing, and both come
          from the same page. No <code>ToolNode</code> here, unlike the
          TypeScript tab: this node routes to <code>END</code> on both paths, so
          the tool is never executed — the model&apos;s <em>argument</em> is the
          payload, which is why the tool body is empty.
        </p>
      </Panel>

      <Callout tone="warn" title="state['copilotkit']['actions'] goes in unconverted">
        <p>
          Variant 3 binds{" "}
          <code>state[&quot;copilotkit&quot;][&quot;actions&quot;]</code>{" "}
          straight into <code>bind_tools</code> as though those entries were
          LangChain tools. The equivalent TypeScript tab wraps them in{" "}
          <code>convertActionsToDynamicStructuredTools</code> first, and nothing
          in the Python <code>copilotkit</code> package does that conversion for
          you. It is harmless on this route because no frontend tools are
          registered against this graph, so the list is empty — but register one
          and the bind would be handed raw dicts.
        </p>
      </Callout>

      {/* <Callout tone="warn" title="Predictions need <CopilotKit>, not <CopilotKitProvider>">
        <p>
          This is the trap that costs the most time, because it fails silently.
          The backend emits a <code>PredictState</code> custom event carrying the{" "}
          <code>StateItem</code> mapping, and the browser is what applies it:
          a subscriber watches <code>TOOL_CALL_ARGS</code> and calls{" "}
          <code>agent.setState</code> for each mapped key as the arguments
          stream. Nothing appears in any <code>STATE_SNAPSHOT</code> on the wire —
          the prediction exists only client-side.
        </p>
        <p className="mt-2">
          That subscriber lives in <code>CopilotListeners</code>, which{" "}
          <code>&lt;CopilotKit&gt;</code> mounts and{" "}
          <code>&lt;CopilotKitProvider&gt;</code> does not. Use the bare provider
          and the event arrives, nobody listens, the panel stays empty, and there
          is no error anywhere. This app&apos;s root provider is{" "}
          <code>&lt;CopilotKit&gt;</code> for exactly this reason — which is also
          what the Quickstart shows.
        </p>
      </Callout>

      <Callout tone="warn" title="The page defines AgentState and then ignores it">
        <p>
          Variant 1 prints <code>class AgentState(CopilotKitState)</code> in one
          step and a <code>create_deep_agent(...)</code> in the next that never
          references it. Without a carrier the <code>observed_steps</code> key
          does not exist and the middleware has nowhere to write, so{" "}
          <code>ObservedStepsMiddleware</code> is added here to hold the schema —
          the mechanism the Interrupt-based page documents.
        </p>
      </Callout>

      <Callout tone="info" title="Predictions are overwritten by the node's return">
        <p>
          The page says this outright near the top and it is the single most
          useful sentence on it: when a node finishes, its returned state
          <em> is</em> the state. Anything that was only emitted vanishes. Variant
          1 does not have the problem — the middleware writes into the tool call,
          which the graph persists — but Variants 2 and 3 both have to return the
          value explicitly, and Variant 2&apos;s snippet elides the return.
        </p>
      </Callout> */}
    </>
  );
}
