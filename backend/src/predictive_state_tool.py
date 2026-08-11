"""Custom graph backing Predictive State Updates — tool-emission variant.

https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission

Also not a Deep Agent, and the most complete of the page's Python snippets: it
carries its own import block, the `step_progress_tool`, the
`copilotkit_customize_config` mapping, the model call, and both `Command`
returns. `frontend_actions_node` below is that snippet unedited.

Only two things are missing, and both come from the same page — the state class
from its first step, and the `StateGraph` wiring from the TypeScript tab.

Note what the mapping does and does not do. `emit_intermediate_state` streams
the tool's `steps` argument into `observed_steps` as the model writes it; that
is the prediction. The `Command(update=...)` at the end is what makes it
survive, by copying the same argument out of the finished tool call. Both
halves are the page's.

No `ToolNode` here, unlike the TypeScript tab. The Python node routes to `END`
on both paths, so the tool is never actually executed — the model's *argument*
is the payload, and the empty tool body says so. Adding a `ToolNode` would be
inventing a step this tab does not have.

One departure: the page pins `ChatOpenAI(model="gpt-4")`; every agent here
reads `OPENAI_MODEL`.
"""

#region agent-state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]
#endregion


#region frontend-actions-node
from copilotkit.langgraph import copilotkit_customize_config
from langgraph.types import Command
from langgraph.graph import END
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, AIMessage
from langchain_core.runnables import RunnableConfig

from src.shared import OPENAI_MODEL


# Define a step progress tool for the llm to report the steps
@tool
def step_progress_tool(steps: list[str]):
    """Reads and reports steps"""
async def frontend_actions_node(state: AgentState, config: RunnableConfig):
    # Configure CopilotKit to treat step progress tool calls as predictive of the final state
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
    # Provide the actions to the LLM
    model = ChatOpenAI(model="gpt-4").bind_tools(
        [
            *state["copilotkit"]["actions"],
            step_progress_tool
            # your other tools here
        ],
    )
    # Call the model with CopilotKit's modified config
    response = await model.ainvoke([
        system_message,
        *state["messages"],
    ], config)
    # Set the steps in state so they are persisted and communicated to the frontend
    if isinstance(response, AIMessage) and response.tool_calls and response.tool_calls[0].get("name") == 'step_progress_tool':
        return Command(
            goto=END,
            update={
                "messages": response,
                "observed_steps": response.tool_calls[0].get("args", None).get('steps')
            }
        )
    return Command(goto=END, update={"messages": response})
#endregion


#region graph
from langgraph.graph import START, StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("frontend_actions_node", frontend_actions_node)
workflow.add_edge(START, "frontend_actions_node")

# No checkpointer — see the note in predictive_state_manual.py. The Python
# LangGraph API rejects one and refuses to start.
graph = workflow.compile()
#endregion
