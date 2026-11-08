# HARNESS copy of pages/predictive_tool.py: verbatim except the last line. The page compiles with
# checkpointer=MemorySaver(); langgraph dev refuses it (GraphLoadError: "includes a custom checkpointer").
import uuid

from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command

class AgentState(CopilotKitState):
    observed_steps: list[str]

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
model = ChatOpenAI(model="gpt-6-luna", reasoning_effort="none")

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

graph = workflow.compile()  # HARNESS: page has checkpointer=MemorySaver(), langgraph dev rejects it
