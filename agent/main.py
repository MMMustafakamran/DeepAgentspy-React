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
