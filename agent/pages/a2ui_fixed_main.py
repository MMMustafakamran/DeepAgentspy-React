# https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema ("Register the tool")
# Page: create_deep_agent(tools=[search_flights, ...], ...) — placeholders, no model.
# HARNESS: import path adjusted to this folder; "..." filled with the Quickstart's model and
# CopilotKitMiddleware (guesswork: the page never says which model or middleware).
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).parent))  # HARNESS
from deepagents import create_deep_agent
from copilotkit import CopilotKitMiddleware  # HARNESS
from a2ui_fixed_schema import search_flights  # HARNESS: page says `from src.a2ui_fixed_schema import search_flights`

agent = create_deep_agent(
    model="openai:gpt-6-luna",  # HARNESS (page: "...")
    tools=[search_flights],  # page: [search_flights, ...]
    middleware=[CopilotKitMiddleware()],  # HARNESS (page: "...")
)
