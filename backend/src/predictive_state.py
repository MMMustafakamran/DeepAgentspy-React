"""Agent backing the Predictive State Updates route (prebuilt-agent variant).

https://docs.copilotkit.ai/deepagents/shared-state/predictive-state-updates?agent-type=prebuilt

The only one of the page's three variants that is fully specified for Deep
Agents. `StateStreamingMiddleware` takes `StateItem` mappings from a tool
argument to a state key and streams the argument into that key as the model
writes it — no `copilotkit_emit_state` call and no `copilotkit_customize_config`
anywhere.

The page's `AgentState` and `create_deep_agent(...)` are both verbatim below.
The only addition is `ObservedStepsMiddleware`, which carries the state schema:
the page defines `AgentState` and then never references it in the agent it
builds, so on its own the `observed_steps` key would not exist.

The other two variants of this page (`?agent-type=custom-graph`, both emission
modes) describe a hand-built `StateGraph` and are reference-only in this repo —
see `/shared-state/predictive-state-updates` in the app.
"""

from typing import Any

#region agent-state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]
#endregion

#region prebuilt-agent
from copilotkit import CopilotKitMiddleware, StateStreamingMiddleware, StateItem
from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware
from langchain.tools import tool

from src.shared import MODEL


@tool
def step_progress_tool(steps: list[str]):
    """Reports the current steps being executed"""


class ObservedStepsMiddleware(AgentMiddleware[AgentState, Any]):
    state_schema = AgentState


agent = create_deep_agent(
    model=MODEL,
    tools=[step_progress_tool],
    middleware=[
        ObservedStepsMiddleware(),
        CopilotKitMiddleware(),
        StateStreamingMiddleware(
            StateItem(state_key="observed_steps", tool="step_progress_tool", tool_argument="steps")
        ),
    ],
    system_prompt="You are a task performer. Report your steps using step_progress_tool.",
)
#endregion
