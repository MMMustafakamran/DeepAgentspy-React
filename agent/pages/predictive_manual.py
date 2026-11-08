# Verbatim: https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates (Custom graph > Manual, Python)
# Step "Define the state":
from copilotkit import CopilotKitState

class AgentState(CopilotKitState):
    observed_steps: list[str]  # Array of completed steps

# Step "Emit the intermediate state" (the whole snippet the page shows):
from copilotkit.langgraph import copilotkit_emit_state # [!code highlight]
# ...
async def chat_node(state: AgentState, config: RunnableConfig) -> Command[Literal["cpk_action_node", "tool_node", "__end__"]]:
    # ...

    # Simulate executing steps one by one
    steps = [
        "Analyzing input data...",
        "Identifying key patterns...",
        "Generating recommendations...",
        "Formatting final output..."
    ]

    for step in steps:
        state["observed_steps"] = state.get("observed_steps", []) + [step]
        await copilotkit_emit_state(config, state) # [!code highlight]
        await asyncio.sleep(1)

    # ...
