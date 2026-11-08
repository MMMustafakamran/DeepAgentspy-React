# Verbatim: https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates  (Prebuilt agent, Python)
# Step 1 (Define the state schema), verbatim:
from copilotkit import CopilotKitState

class AgentState(CopilotKitState):
    observed_steps: list[str]

# Step 2 (Add StateStreamingMiddleware), verbatim:
from langchain_openai import ChatOpenAI
from copilotkit import CopilotKitMiddleware, StateStreamingMiddleware, StateItem  # [!code highlight]
from deepagents import create_deep_agent
from langchain.tools import tool

@tool
def step_progress_tool(steps: list[str]):
    """Reports the current steps being executed"""

agent = create_deep_agent(
    model=ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"),
    tools=[step_progress_tool],
    middleware=[
        CopilotKitMiddleware(),
        StateStreamingMiddleware(  # [!code highlight]
            StateItem(state_key="observed_steps", tool="step_progress_tool", tool_argument="steps")  # [!code highlight]
        ),  # [!code highlight]
    ],
    system_prompt="You are a task performer. Report your steps using step_progress_tool.",
)
