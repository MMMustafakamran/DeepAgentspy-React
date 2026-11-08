# Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering (Python tab, agent.py)
from langchain_openai import ChatOpenAI
from deepagents import create_deep_agent
from langchain.tools import tool

# [!code highlight:6]
@tool
def get_weather(location: str):
    """
    Get the weather for a given location.
    """
    return f"The weather for {location} is 70 degrees."

agent = create_deep_agent(
    model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
    tools=[get_weather], # [!code highlight]
    system_prompt="You are a helpful assistant.",
)
