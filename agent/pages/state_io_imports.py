# HARNESS copy of pages/state_io.py with ONLY the missing imports added (evidence for FINDINGS.md #16:
# ChatOpenAI() then defaults to gpt-3.5-turbo, which OpenAI rejects as deprecated). Everything else verbatim.
from typing import List  # HARNESS
from langchain_core.runnables import RunnableConfig  # HARNESS
from langchain_openai import ChatOpenAI  # HARNESS
from langchain_core.messages import SystemMessage  # HARNESS
from langgraph.graph import StateGraph, START, END  # HARNESS
from copilotkit import CopilotKitState

# Divide the state to 3 parts

# Input schema for inputs you are willing to accept from the frontend
class InputState(CopilotKitState):
  question: str

# Output schema for output you are willing to pass to the frontend
class OutputState(CopilotKitState):
  answer: str

# The full schema, including the inputs, outputs and internal state ("resources" in our case)
class OverallState(InputState, OutputState):
  resources: List[str]

async def answer_node(state: OverallState, config: RunnableConfig):
  """
  Standard chat node, meant to answer general questions.
  """

  model = ChatOpenAI()

  # add the input question in the system prompt so it's passed to the LLM
  system_message = SystemMessage(
    content=f"You are a helpful assistant. Answer the question: {state.get('question')}"
  )

  response = await model.ainvoke([
    system_message,
    *state["messages"],
  ], config)

  # ...add the rest of the agent implementation

  # extract the answer, which will be assigned to the state soon
  answer = response.content

  return {
     "messages": response,
      # include the answer in the returned state
     "answer": answer
  }


# finally, before compiling the graph, we define the 3 state components
builder = StateGraph(OverallState, input=InputState, output=OutputState)

# add all the different nodes and edges and compile the graph
builder.add_node("answer_node", answer_node)
builder.add_edge(START, "answer_node")
builder.add_edge("answer_node", END)
graph = builder.compile()
