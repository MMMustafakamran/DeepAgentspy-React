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

# region agent-state
from typing import Any, TypedDict
from copilotkit import (
    CopilotKitMiddleware,
    CopilotKitState,
    StateItem,
    StateStreamingMiddleware,
)
from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware
from langchain.messages import ToolMessage
from langchain.tools import ToolRuntime, tool
from langgraph.types import Command

from src.shared import MODEL


class Search(TypedDict):
    query: str
    done: bool


class AgentState(CopilotKitState):
    searches: list[Search]


class SearchesStateMiddleware(AgentMiddleware[AgentState, Any, Any]):
    state_schema = AgentState


@tool
def report_research_progress(
    searches: list[Search],
    runtime: ToolRuntime[None, AgentState],
) -> Command:
    """Report the current research tasks and completion status."""
    return Command(
        update={
            "searches": searches,
            "messages": [
                ToolMessage(
                    content="Research progress saved.",
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )


agent = create_deep_agent(
    model=MODEL,
    tools=[report_research_progress],
    middleware=[
        SearchesStateMiddleware(),
        CopilotKitMiddleware(),
        StateStreamingMiddleware(
            StateItem(
                state_key="searches",
                tool="report_research_progress",
                tool_argument="searches",
            )
        ),
    ],
    system_prompt=(
        "You are a research assistant. Use report_research_progress "
        "to show each task and mark it done when complete."
    ),
)
# endregion
