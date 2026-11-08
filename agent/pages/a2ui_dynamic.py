# Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema (agent/a2ui_dynamic.py)
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI

graph = create_deep_agent(
    model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "Whenever a response would benefit from a rich visual — a dashboard, "
        "KPI summary, card layout, or chart — call `generate_a2ui` to draw it. "
        "Keep chat replies to one short sentence and let the UI do the talking."
    ),
)
