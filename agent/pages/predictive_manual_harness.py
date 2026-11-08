# HARNESS copy of pages/predictive_manual.py. The page shows only a chat_node fragment ("# ...")
# with no imports, no model call and no graph (NameError: name 'RunnableConfig' is not defined).
# HARNESS: imports, the model call/return and the graph wiring were added (guesswork, marked);
# the state class and the emit loop are verbatim.
import asyncio  # HARNESS
from typing import Literal  # HARNESS
from langchain_core.runnables import RunnableConfig  # HARNESS
from langchain_core.messages import SystemMessage  # HARNESS
from langchain_openai import ChatOpenAI  # HARNESS
from langgraph.graph import StateGraph, START, END  # HARNESS
from langgraph.types import Command  # HARNESS
from langgraph.checkpoint.memory import MemorySaver  # HARNESS

from copilotkit import CopilotKitState

class AgentState(CopilotKitState):
    observed_steps: list[str]  # Array of completed steps

from copilotkit.langgraph import copilotkit_emit_state # [!code highlight]
# ...
# HARNESS: the page's return annotation -> Command[Literal["cpk_action_node", "tool_node", "__end__"]] makes
# langgraph refuse the graph ("Found edge ending at unknown node `cpk_action_node`"); removed.
async def chat_node(state: AgentState, config: RunnableConfig):  # HARNESS
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
        await copilotkit_emit_state(config, state) # [!code highlight]
        await asyncio.sleep(1)

    # HARNESS: the page's "# ..." — model call + return, mirroring the TypeScript tab
    model = ChatOpenAI(model="gpt-6-luna", reasoning_effort="none")  # HARNESS
    response = await model.ainvoke([SystemMessage(content="You are a helpful assistant."), *state["messages"]], config)  # HARNESS
    return {"messages": [response], "observed_steps": state["observed_steps"]}  # HARNESS

# HARNESS: graph wiring (the Python tab never builds one)
workflow = StateGraph(AgentState)  # HARNESS
workflow.add_node("chat_node", chat_node)  # HARNESS
workflow.add_edge(START, "chat_node")  # HARNESS
workflow.add_edge("chat_node", END)  # HARNESS
graph = workflow.compile()  # HARNESS
