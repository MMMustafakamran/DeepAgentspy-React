"""Agent backing the Dynamic Schema A2UI route.

https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema

The page's Python verbatim, except that `ChatOpenAI(model="gpt-5.4")` reads the
model id from `.env` like every other agent here.

There is deliberately nothing else in this file. The page's point is that the
backend needs no A2UI code at all: `CopilotKitMiddleware` injects and executes
`generate_a2ui` on its own once A2UI is switched on, and the switch lives on
the frontend — `a2ui={{ catalog }}` on the provider.

The A2UI Styling and Advanced routes drive this same agent; neither has a
backend of its own.
"""

#region dynamic-agent
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent
from langchain_openai import ChatOpenAI

from src.shared import OPENAI_MODEL

graph = create_deep_agent(
    model=ChatOpenAI(model=OPENAI_MODEL),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "Whenever a response would benefit from a rich visual — a dashboard, "
        "KPI summary, card layout, or chart — call `generate_a2ui` to draw it. "
        "Keep chat replies to one short sentence and let the UI do the talking."
    ),
)
#endregion
