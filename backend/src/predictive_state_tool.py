"""Custom graph backing Predictive State Updates — tool-emission variant.

https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission

Also not a Deep Agent, and still the most complete of the page's Python
snippets. As of the 30 Aug revision it is complete outright: the import block,
`AgentState`, `step_progress_tool`, `chat_node`, `route_after_chat`, the
`StateGraph` wiring and the `compile` are all printed on the page, so this
module is that snippet end to end rather than the old mix of Python tab plus
TypeScript-tab scaffolding.

What changed, and why the shape of this file changed with it:

* `step_progress_tool` used to be a bare `def` with a docstring and no body —
  the model's *argument* was the whole payload and the tool never ran. It now
  takes a `ToolRuntime` and returns a `Command` that writes `observed_steps`
  and appends a `ToolMessage` carrying `runtime.tool_call_id`. The tool
  executes.
* Because it executes, the graph needs somewhere to execute it. The old single
  node routed to `END` on both paths; there is now a real `ToolNode` and a
  `route_after_chat` conditional edge, and `tool_node` loops back to
  `chat_node`.
* `emit_intermediate_state` still streams the `steps` argument into
  `observed_steps` as the model writes it — that is the prediction, unchanged.
  What replaced the old `Command(goto=END, update=...)` reconciliation is the
  tool's own `Command(update=...)`. Both halves are still the page's.

Two departures, both pre-existing:

* The page pins `ChatOpenAI(model="gpt-5.4")`; every agent here reads
  `OPENAI_MODEL` so a tester needs access to one model rather than four.
* `compile(checkpointer=MemorySaver())` is the page's and is *not* kept. It
  is the one line of the revision that cannot go in verbatim: `langgraph dev`
  rejects a graph carrying its own checkpointer and aborts startup for the
  entire app, taking all fourteen other graphs down with it. Dropped here and
  reported; the long note on the `graph` region has the error and the
  reasoning.
"""

#region agent-state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]
#endregion


#region chat-node
import uuid

from copilotkit.langgraph import copilotkit_customize_config
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END
from langgraph.types import Command

from src.shared import OPENAI_MODEL


@tool
def step_progress_tool(steps: list[str], runtime: ToolRuntime) -> Command:
    """Report the current steps being executed."""
    return Command(
        update={
            "observed_steps": steps,
            "messages": [
                ToolMessage(
                    content="Steps recorded to shared state.",
                    name="step_progress_tool",
                    id=str(uuid.uuid4()),
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


tools = [step_progress_tool]
model = ChatOpenAI(model=OPENAI_MODEL)


async def chat_node(state: AgentState, config: RunnableConfig):
    streaming_config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {
                "state_key": "observed_steps",
                "tool": "step_progress_tool",
                "tool_argument": "steps",
            },
        ]
    )

    model_with_tools = model.bind_tools(
        [
            *state["copilotkit"]["actions"],
            *tools,
        ],
        parallel_tool_calls=False,
    )

    response = await model_with_tools.ainvoke(
        [
            SystemMessage(
                content="You are a task performer. Report your steps "
                "using step_progress_tool."
            ),
            *state["messages"],
        ],
        streaming_config,
    )
    return {"messages": [response]}


def route_after_chat(state: AgentState):
    last_message = state["messages"][-1]
    if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
        return END

    frontend_action_names = {
        action["name"] for action in state["copilotkit"]["actions"]
    }
    if any(
        call["name"] not in frontend_action_names
        for call in last_message.tool_calls
    ):
        return "tool_node"

    # Frontend action calls are returned to CopilotKit for execution in the UI.
    return END
#endregion


#region graph
from langgraph.graph import START, StateGraph
from langgraph.prebuilt import ToolNode

workflow = (
    StateGraph(AgentState)
    .add_node("chat_node", chat_node)
    .add_node("tool_node", ToolNode(tools))
    .add_edge(START, "chat_node")
    .add_edge("tool_node", "chat_node")
    .add_conditional_edges(
        "chat_node",
        route_after_chat,
        ["tool_node", END],
    )
)

# The page ends this snippet with:
#
#     from langgraph.checkpoint.memory import MemorySaver
#     graph = workflow.compile(checkpointer=MemorySaver())
#
# That is the one line of the 30 Aug revision that cannot go in verbatim.
# `langgraph dev` — the server `langgraph.json` and the CI pipeline both run —
# refuses a graph carrying its own checkpointer:
#
#     ValueError: Heads up! Your graph 'graph' from
#     './src/predictive_state_tool.py' includes a custom checkpointer
#     (type <class 'langgraph.checkpoint.memory.InMemorySaver'>). With
#     LangGraph API, persistence is handled automatically by the platform...
#     Application startup failed. Exiting.
#
# It is not a soft warning and it is not scoped to this graph: the load error
# aborts startup for the whole app, so all fourteen other graphs in
# `langgraph.json` go down with it and nothing in the repo can be recorded.
# Verified against langgraph-api 0.12.0.
#
# Rule 2 of PROJECT_GOAL keeps broken pages broken so the clip can show the
# defect. A defect that stops the server from booting cannot be shown in a
# clip — it only removes every clip — so the checkpointer is dropped here and
# reported instead. This is the same call, for the same reason, that
# `predictive_state_manual.py` already made.
graph = workflow.compile()
#endregion
