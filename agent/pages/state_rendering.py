# Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/state-rendering (Python tab, agent.py)
from langchain_openai import ChatOpenAI
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
    model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
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
