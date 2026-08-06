"""Agent backing the Reading / Writing agent state routes.

https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read
https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write

Both pages print the same Python — one `AgentState` with a `language` field —
and differ only in what the frontend does with it: read it, or write it back
with `agent.setState`. One agent serves both routes.

The pages say the agent "reads `state["language"]` from tools or middleware
hooks as it runs — no custom node required", but do not show what makes the
value visible to the model. That is `CopilotKitMiddleware(expose_state=...)`:
it serialises the named state keys into the system message on every model call.
It defaults to off, so without the argument the toggle in the UI changes state
that the LLM never sees, and the reply stays in English. The argument is real
shipped API in copilotkit 0.1.94; it is just absent from these two pages.
"""

from typing import Any

#region agent-state
from copilotkit import CopilotKitState
from typing import Literal


class AgentState(CopilotKitState):
    language: Literal["english", "spanish"] = "english"

# The agent reads `state["language"]` from tools or middleware hooks
# as it runs — no custom node required.
#endregion

#region agent
from copilotkit import CopilotKitMiddleware
from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware

from src.shared import MODEL


# class LanguageStateMiddleware(AgentMiddleware[AgentState, Any]):
#     state_schema = AgentState

#     def before_agent(self, state: AgentState, runtime: Any) -> dict[str, Any] | None:
#         # `Literal[...] = "english"` on a TypedDict is an annotation, not a
#         # runtime default — LangGraph never applies it. Seeding the key on the
#         # first turn is what makes the UI show "english" before anything is
#         # written from the frontend, which is what the Reading page's
#         # screenshot shows.
#         if not state.get("language"):
#             return {"language": "english"}
#         return None


agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[
        CopilotKitMiddleware(),
    ],
    system_prompt=(
        "You are a helpful assistant. Always answer in the language named by "
        "the `language` value in the current agent state."
    ),
)
#endregion
