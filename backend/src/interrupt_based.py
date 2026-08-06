"""Agents backing the Interrupt-based route.

https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based

Two agents, one per section of the page:

* `agent` — the Implementation walkthrough. `AgentNameMiddleware.before_model`
  calls `interrupt` once, with a plain string, until the state carries a name.
* `multi_agent` — the "Condition UI executions" section. Two interrupts in one
  hook, each carrying a `type` the frontend's `useInterrupt({ enabled })`
  predicates dispatch on.

Both classes and the `AgentState` are the page's Python verbatim. What the page
never shows is the `create_deep_agent(...)` call that consumes them, so those
two calls at the bottom are written to the shape the page describes.
"""

from typing import Any

#region agent-state
from copilotkit import CopilotKitState  # extends MessagesState


# This is the state of the agent.
# It inherits from the CopilotKitState properties from CopilotKit.
class AgentState(CopilotKitState):
    agent_name: str
#endregion

#region single-interrupt
from langchain.agents.middleware import AgentMiddleware
from langgraph.runtime import Runtime
from langgraph.types import interrupt


class AgentNameMiddleware(AgentMiddleware[AgentState, Any]):
    state_schema = AgentState

    def before_model(self, state: AgentState, runtime: Runtime[Any]) -> dict[str, Any] | None:
        if not state.get("agent_name"):
            # Interrupt and wait for the user to respond with a name
            name = interrupt("Before we start, what would you like to call me?")
            return {"agent_name": name}
        return None
#endregion

#region multi-interrupt
class ApprovalAndNameMiddleware(AgentMiddleware[AgentState, Any]):
    state_schema = AgentState

    def before_model(self, state: AgentState, runtime: Runtime[Any]) -> dict[str, Any] | None:
        approval = interrupt({"type": "approval", "content": "please approve"})
        updates: dict[str, Any] = {"approval": approval}

        if not state.get("agent_name"):
            # Interrupt and wait for the user to respond with a name
            updates["agent_name"] = interrupt(
                {"type": "ask", "content": "Before we start, what would you like to call me?"}
            )

        return updates
#endregion

#region agents
from deepagents import create_deep_agent

from src.shared import MODEL

_SYSTEM_PROMPT = (
    "You are a helpful assistant. Once the user has given you a name, use it "
    "when you refer to yourself."
)

agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[AgentNameMiddleware()],
    system_prompt=_SYSTEM_PROMPT,
)


# The page's second `AgentState` adds an `approval` key alongside `agent_name`
# but only shows the comment "... your full state definition" where the class
# would be. It is written out here so `ApprovalAndNameMiddleware`'s
# `{"approval": approval}` update has somewhere to land.
class MultiInterruptState(AgentState):
    approval: Any


class MultiInterruptMiddleware(ApprovalAndNameMiddleware):
    state_schema = MultiInterruptState


multi_agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[MultiInterruptMiddleware()],
    system_prompt=_SYSTEM_PROMPT,
)
#endregion
