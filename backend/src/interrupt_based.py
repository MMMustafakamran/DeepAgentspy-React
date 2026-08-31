"""Agents backing the Interrupt-based route.

https://docs.copilotkit.ai/deepagents/generative-ui/your-components/interrupt-based

Two agents, one per section of the page:

* `agent` — the Implementation walkthrough. `AgentNameMiddleware.before_model`
  calls `interrupt` once, with a plain string, until the state carries a name.
* `multi_agent` — the "Condition UI executions" section. Two interrupts in one
  hook, each carrying a `type` the frontend's `useInterrupt({ enabled })`
  predicates dispatch on.

The `AgentState`, both middleware classes and the `create_deep_agent` call for
`agent` are the page's Python verbatim as of the 30 Aug revision, which now
prints that call end to end — including the `CopilotKitMiddleware(expose_state=
["agent_name"])` entry that replaced the old "add copilotkitMiddleware to the
graph" instruction. `multi_agent` is still not a call the page shows, so it
stays written to the shape the page describes.

`model=` is the one deliberate departure: the page hardcodes `openai:gpt-4o`
and every agent in this backend reads `src.shared.MODEL` instead, so a tester
needs access to one model rather than four. See `src/shared.py`.
"""

from typing import Any

#region agent-state
from typing import NotRequired

from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    agent_name: NotRequired[str]
#endregion

#region single-interrupt
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent
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
from src.shared import MODEL

# The page's prompt verbatim. The comma splice after "chooses a name" is the
# page's own -- the sentence never finishes that clause before starting a new
# one. Left as published; it is reported, not fixed.
_SYSTEM_PROMPT = (
    "You are a helpful assistant. After the user chooses a name, "
    "Current agent state contains agent_name. Use that value as your own name."
)

agent = create_deep_agent(
    model=MODEL,
    middleware=[
        AgentNameMiddleware(),
        CopilotKitMiddleware(expose_state=["agent_name"]),
    ],
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


# The page never prints this call, so `expose_state` here is the page's new
# pattern applied to this agent's own state rather than a quoted snippet.
multi_agent = create_deep_agent(
    model=MODEL,
    middleware=[
        MultiInterruptMiddleware(),
        CopilotKitMiddleware(expose_state=["agent_name", "approval"]),
    ],
    system_prompt=_SYSTEM_PROMPT,
)
#endregion
