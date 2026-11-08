# https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read and /in-app-agent-write
# The page's only backend code is the AgentState class below (verbatim). It never says where the
# class goes or how to pass it to create_deep_agent.
# HARNESS: the agent itself is the Quickstart's main.py verbatim (the page says "Run and connect
# your agent ... follow Getting Started"); AgentState is defined next to it exactly as shown and,
# as on the page, not passed anywhere.
from copilotkit import CopilotKitState
from typing import Literal

class AgentState(CopilotKitState):
    language: Literal["english", "spanish"] = "english"

# The agent reads `state["language"]` from tools or middleware hooks
# as it runs — no custom node required.

# --- Quickstart main.py (verbatim) ---
from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware

def get_weather(location: str):
    """Get weather for a location"""
    return f"The weather in {location} is sunny."

agent = create_deep_agent(
    model="openai:gpt-6-luna",
    tools=[get_weather],
    middleware=[CopilotKitMiddleware()], # for frontend tools and context
    system_prompt="You are a helpful research assistant.",
)
