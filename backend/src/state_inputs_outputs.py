"""Custom LangGraph graph backing the Input/Output Schemas route.

https://docs.copilotkit.ai/deepagents/shared-state/state-inputs-outputs

The one page in this repo that is deliberately NOT a Deep Agent. Its own
callout says so: the input/output split is a `StateGraph` feature, and
`create_deep_agent` "uses middleware with a single state schema and doesn't
expose separate input/output schemas". So this file hand-builds the graph.

The three state classes, `answer_node` and the graph wiring are the page's,
with four changes it forces:

1. `StateGraph(..., input=, output=)` -> `input_schema=`, `output_schema=`.
   The old spelling still works but warns: "`input` is deprecated and will be
   removed. Please use `input_schema` instead."
2. Nothing on the page is imported. Every import below is one the page's code
   uses without ever showing.
3. `List[str]` -> `list[str]`. The page's own "before" block uses the builtin
   generic and its "after" block switches to the `typing` alias, which it then
   never imports.
4. `resources` is actually populated. The page declares it as the field the UI
   must never see and then leaves `# ...add the rest of the agent
   implementation` where it would be filled. Left empty there is nothing to
   prove, so the node records what it really sent to the model. That is a
   stand-in for the retrieval step the page describes, not a guess at one.

What the route demonstrates: `question` goes in and does not come back,
`answer` comes back, and `resources` never crosses the wire at all.
"""

#region state-schemas
from copilotkit import CopilotKitState


# Input schema for inputs you are willing to accept from the frontend
class InputState(CopilotKitState):
    question: str


# Output schema for output you are willing to pass to the frontend
class OutputState(CopilotKitState):
    answer: str


# The full schema, including the inputs, outputs and internal state
# ("resources" in our case)
class OverallState(InputState, OutputState):
    resources: list[str]
#endregion


#region answer-node
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI

from src.shared import OPENAI_MODEL


async def answer_node(state: OverallState, config: RunnableConfig):
    """
    Standard chat node, meant to answer general questions.
    """

    model = ChatOpenAI(model=OPENAI_MODEL)

    # add the input question in the system prompt so it's passed to the LLM
    system_message = SystemMessage(
        content=f"You are a helpful assistant. Answer the question: {state.get('question')}"
    )

    # The internal half of the state. In a real agent this is where retrieved
    # documents would go; here it records what the node actually worked from,
    # so the UI has something concrete to fail to see.
    resources = [
        f"system_prompt: {system_message.content}",
        f"model: {OPENAI_MODEL}",
        f"prior_messages: {len(state.get('messages', []))}",
    ]

    response = await model.ainvoke(
        [
            system_message,
            *state["messages"],
        ],
        config,
    )

    # extract the answer, which will be assigned to the state soon
    answer = response.content

    return {
        "messages": response,
        # include the answer in the returned state
        "answer": answer,
        # written to OverallState, but absent from OutputState — so it stays
        # inside the graph and never reaches the browser
        "resources": resources,
    }
#endregion


#region graph
from langgraph.graph import END, START, StateGraph

# finally, before compiling the graph, we define the 3 state components
builder = StateGraph(OverallState, input_schema=InputState, output_schema=OutputState)

# add all the different nodes and edges and compile the graph
builder.add_node("answer_node", answer_node)
builder.add_edge(START, "answer_node")
builder.add_edge("answer_node", END)
graph = builder.compile()
#endregion
