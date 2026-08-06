"""Agent backing the Frontend Tools route.

https://docs.copilotkit.ai/deepagents/frontend-tools  (Python tab)

The page's Python contribution is one class: `YourAgentState(CopilotKitState)`.
Inheriting from `CopilotKitState` is what puts the `copilotkit` key on the
agent's state, and that key is where `CopilotKitMiddleware` deposits the tools
the browser registered with `useFrontendTool`.

The `create_deep_agent` call is not on the page. It is written here to the
shape the page describes: state attached through an `AgentMiddleware`
(the mechanism the Interrupt-based page documents), plus
`CopilotKitMiddleware`, which the Quickstart annotates as being there
"for frontend tools and context".

No tool is defined in this file. The only tool this agent can call is
`sayHello`, which lives in the browser — see
`frontend/src/app/frontend-tools/demo-chat/page.tsx`.
"""

from typing import Any

#region agent-state
from copilotkit import CopilotKitState


class YourAgentState(CopilotKitState):
    your_additional_properties: str
#endregion

#region agent
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware

from src.shared import MODEL


class YourStateMiddleware(AgentMiddleware[YourAgentState, Any]):
    state_schema = YourAgentState


agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[YourStateMiddleware(), CopilotKitMiddleware()],
    system_prompt=(
        "You are a helpful assistant. You have tools that run in the user's "
        "browser; call them when the user asks for something they cover."
    ),
)
#endregion
