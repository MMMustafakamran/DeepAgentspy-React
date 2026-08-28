"""The Reading / Writing agent state agent, with the line the docs omit.

https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-read
https://docs.copilotkit.ai/deepagents/shared-state/in-app-agent-write

`src/shared_state.py` is those two pages verbatim, and it reproduces the defect
they were reported for: the UI writes `language`, the model never sees it, and
the reply stays in English. This module is the same agent with one argument
added, and it exists so a recording can show both halves back to back. Without
the second half, a clip of the failure invites the question "was the demo just
wired up wrong?" and cannot answer it.

The difference is `CopilotKitMiddleware(expose_state=["language"])`, which
serialises the named state keys into the system message on every model call. It
defaults to off, it is real shipped API in `copilotkit` 0.1.94, and it is
mentioned on neither page -- which is the finding.

`LanguageStateMiddleware` is the second half of the same gap. `Literal[...] =
"english"` on a TypedDict is an annotation, not a runtime default: LangGraph
never applies it, so before anything is written from the frontend the key is
simply absent and the UI shows "Not Set". Seeding it on the first turn is what
makes the panel read "english" the way the Reading page's own screenshot does.

Keep this file and `shared_state.py` diffable. The value of the pair is that the
only differences between them are the two things the docs leave out; anything
else that drifts in here weakens the evidence.
"""

from typing import Any

from copilotkit import CopilotKitMiddleware, CopilotKitState
from deepagents import create_deep_agent
from langchain.agents.middleware import AgentMiddleware
from typing import Literal

from src.shared import MODEL


class AgentState(CopilotKitState):
    language: Literal["english", "spanish"] = "english"


class LanguageStateMiddleware(AgentMiddleware[AgentState, Any]):
    state_schema = AgentState

    def before_agent(self, state: AgentState, runtime: Any) -> dict[str, Any] | None:
        if not state.get("language"):
            return {"language": "english"}
        return None


agent = create_deep_agent(
    model=MODEL,
    tools=[],
    middleware=[
        LanguageStateMiddleware(),
        # The whole difference. Without `expose_state` the model is never told
        # what `language` currently is, so it answers in English however many
        # times the frontend writes the key.
        CopilotKitMiddleware(expose_state=["language"]),
    ],
    system_prompt=(
        "You are a helpful assistant. Always answer in the language named by "
        "the `language` value in the current agent state."
    ),
)
