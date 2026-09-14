"""Quickstart agent.

https://docs.copilotkit.ai/deepagents/quickstart  (Python tab)

The doc's `main.py` verbatim, with one substitution: `model=` reads
`src.shared.MODEL` instead of the literal `"openai:gpt-4o"` the page prints, so
every agent in this backend can be pointed at one model from `.env`.

`langgraph.json` maps this module's `agent` to the graph id `sample_agent`,
which is the id the frontend addresses.
"""

#region quickstart-agent
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent

from src.shared import MODEL


def get_weather(location: str):
    """Get weather for a location"""
    return f"The weather in {location} is sunny."


agent = create_deep_agent(
    model=MODEL,
    tools=[get_weather],
    middleware=[CopilotKitMiddleware()],  # for frontend tools and context
    system_prompt="You are a helpful research assistant.",
)
#endregion
