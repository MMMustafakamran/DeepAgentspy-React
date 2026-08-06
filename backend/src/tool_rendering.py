"""Agent backing the Tool Rendering route.

https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering  (Python tab)

The page's `agent.py` verbatim. The tool is deliberately trivial — the whole
point of the page is on the frontend, where `useRenderTool({ name:
"get_weather" })` replaces the default tool-call bubble with a component.

`CopilotKitMiddleware` is not on the page's snippet and is not added here
either: this route renders a backend tool, it does not call frontend ones.
"""

#region tool-rendering-agent
from deepagents import create_deep_agent
from langchain.tools import tool

from src.shared import MODEL


@tool
def get_weather(location: str):
    """
    Get the weather for a given location.
    """
    return f"The weather for {location} is 70 degrees."


agent = create_deep_agent(
    model=MODEL,
    tools=[get_weather],
    system_prompt="You are a helpful assistant.",
)
#endregion
