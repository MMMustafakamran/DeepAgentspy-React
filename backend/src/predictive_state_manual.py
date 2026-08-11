"""Custom graph backing Predictive State Updates — manual-emission variant.

https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission

Not a Deep Agent. This variant is explicitly for people who "define the nodes
and edges myself", so `create_deep_agent` is not involved.

The page's **Python** tab gives the state class and the body of `chat_node` —
the four steps, the `copilotkit_emit_state` call, the one-second sleep. What it
does not give is anything around them: no imports, no model call, no
`StateGraph`, no `compile`. Its `chat_node` signature also promises a jump to
`cpk_action_node`, a node named nowhere on the page.

The missing half is on the same page's **TypeScript** tab, which prints the
whole thing — annotation, node, wiring, `compile` with a `MemorySaver`. So the
node body below is the Python tab's and the scaffolding around it is the
TypeScript tab's, translated. Nothing is invented; the two tabs are just
complementary.

Two deliberate departures:

* The `-> Command[Literal["cpk_action_node", "tool_node", "__end__"]]` return
  annotation is dropped. This graph has one node and goes straight to `END`,
  exactly as the TypeScript tab's does, so naming unreachable nodes would be
  a lie the type checker would not catch.
* The model id reads `OPENAI_MODEL` like every other agent here. The
  TypeScript tab pins `gpt-4o-mini`.
"""

#region agent-state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]  # Array of completed steps
#endregion


#region chat-node
import asyncio

from copilotkit.langgraph import copilotkit_emit_state
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from src.shared import OPENAI_MODEL


async def chat_node(state: AgentState, config: RunnableConfig):
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
    # ...
#endregion


#region graph
from langgraph.graph import END, START, StateGraph

workflow = StateGraph(AgentState)
workflow.add_node("chat_node", chat_node)
workflow.add_edge(START, "chat_node")
workflow.add_edge("chat_node", END)


graph = workflow.compile()
#endregion
