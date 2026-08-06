"""Agent backing the State Rendering route.

https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering  (Python tab)

The page prints two things: the `AgentState` class, and an
`emit_research_progress(state, config)` coroutine that pushes three search
items to the frontend one at a time with `copilotkit_emit_state`. It does not
print how either reaches a Deep Agent — the surrounding prose only says the
coroutine belongs "inside a custom tool or middleware hook where you have
access to state and config".

Two pieces of glue follow from that, both marked below:

1. The state is attached with an `AgentMiddleware` carrying
   `state_schema = AgentState`. That is the mechanism the Interrupt-based page
   documents for giving a Deep Agent custom state, so it is used here too.
2. `emit_research_progress` is called from a `@tool`, because a tool is the one
   place in a prebuilt Deep Agent that receives a `RunnableConfig` — and
   `copilotkit_emit_state` needs one. The tool returns a `Command` so the final
   list survives the node boundary; emitted state alone is a prediction and is
   overwritten when the node returns.
"""

from typing import Any

#region agent-state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    searches: list[dict]
#endregion

#region emit-state
import asyncio

from copilotkit.langgraph import copilotkit_emit_state
from langchain_core.runnables import RunnableConfig


async def emit_research_progress(state: AgentState, config: RunnableConfig):
    state["searches"] = [
        {"query": "Initial research", "done": False},
        {"query": "Retrieving sources", "done": False},
        {"query": "Forming an answer", "done": False},
    ]
    await copilotkit_emit_state(config, state)

    for search in state["searches"]:
        await asyncio.sleep(1)
        search["done"] = True
        await copilotkit_emit_state(config, state)
#endregion

#region glue

# ==================================== SOLUTION AND DOCS IMPROVEMENT NEEDED - ==================================
from typing import Annotated

from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware
from langchain.tools import tool
from langchain_core.messages import ToolMessage
from langchain_core.tools import InjectedToolCallId
from langgraph.types import Command

from src.shared import MODEL


# @tool
# async def research(
#     topic: str,
#     config: RunnableConfig,
#     tool_call_id: Annotated[str, InjectedToolCallId],
# ) -> Command:
#     """Research a topic, reporting progress as each step completes.

#     Call this whenever the user asks you to research, look into, or find out
#     about something.
#     """
#     state: Any = {}
#     await emit_research_progress(state, config)
#     # The emitted values are predictions. Returning them makes them the node's
#     # actual output, so the list stays on screen once the run finishes.
#     #
#     # A tool that returns a `Command` has to put the `ToolMessage` in the update
#     # itself — LangChain will not synthesise one, and refuses the update without
#     # it. Hence the injected `tool_call_id`. Neither is on the doc page, which
#     # never returns anything from its emit coroutine.
#     return Command(
#         update={
#             "searches": state["searches"],
#             "messages": [
#                 ToolMessage(
#                     content=f"Researched {topic}.",
#                     tool_call_id=tool_call_id,
#                 )
#             ],
#         }
#     )


class SearchesStateMiddleware(AgentMiddleware[AgentState, Any]):
    """Puts `searches` on the agent's state so the frontend can read it."""

    state_schema = AgentState


agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[SearchesStateMiddleware()],
    system_prompt=(
        "You are a research assistant. When the user asks you to research "
        "anything, call the research tool once, then summarise what you found "
        "in a sentence or two."
    ),
)
#endregion
