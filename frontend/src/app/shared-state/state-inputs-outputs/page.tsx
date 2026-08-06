import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_BEFORE = `from copilotkit import CopilotKitState

class AgentState(CopilotKitState):
    question: str
    answer: str
    resources: list[str]`;

const DOC_GRAPH = `# the page
builder = StateGraph(OverallState, input=InputState, output=OutputState)

# here
builder = StateGraph(OverallState, input_schema=InputState, output_schema=OutputState)`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/state-inputs-outputs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Not every state field should cross the wire. Some are the UI&apos;s to
          send, some are the agent&apos;s to return, and some — a retrieved
          document, a scratchpad — are internal, and syncing them would be
          expensive and pointless. LangGraph lets you declare those three sets
          separately.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Three fields, three fates. The browser writes{" "}
          <code>question</code> and never gets it back, so the app stays the
          source of truth for it. <code>answer</code> comes back.{" "}
          <code>resources</code> is written by the node on every run and never
          reaches the browser at all. The demo checks each one and shows you the
          whole of <code>agent.state</code> so you can confirm nothing is
          hiding.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Why is the sky blue? — then hit Ask",
              "What is the capital of Peru? — then hit Ask",
            ]}
            expect={
              <>
                Three green badges: <code>question</code> absent,{" "}
                <code>answer</code> present and holding the reply,{" "}
                <code>resources</code> absent. The chat on the right streams the
                same answer. The state dump at the bottom contains{" "}
                <code>answer</code> and <code>copilotkit</code> — and neither of
                the other two.
              </>
            }
            fail="A red badge on `question` or `resources` means input_schema / output_schema were dropped from the StateGraph call and the whole of OverallState is being returned."
          />
        </div>
      </Panel>

      <Callout tone="info" title="The one route here that is not a Deep Agent">
        <p>
          Deliberately, and on the page&apos;s own instruction. Its callout says
          the input/output split &ldquo;applies when you&apos;re building a
          custom LangGraph graph&rdquo; and that <code>createDeepAgent</code>{" "}
          &ldquo;uses middleware with a single state schema and doesn&apos;t
          expose separate input/output schemas&rdquo;. So{" "}
          <code>state_io_graph</code> is a hand-built{" "}
          <code>StateGraph</code> — one node, compiled and published through the
          same <code>langgraph.json</code> as the nine Deep Agents, and reached
          through the same runtime route. Nothing else about the wiring changes,
          which is the useful part: the runtime does not care which one you
          hand it.
        </p>
      </Callout>

      <Panel
        title="The graph"
        description="The page's three state classes, its answer_node, and its builder — in that order."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/state_inputs_outputs.py", region: "state-schemas" },
            { file: "backend/src/state_inputs_outputs.py", region: "answer-node" },
            { file: "backend/src/state_inputs_outputs.py", region: "graph" },
          ]}
        />
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/shared-state/state-inputs-outputs/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="Four changes the page's snippet forces">
        <p>
          <strong>1. The keyword names changed.</strong>{" "}
          <code>input=</code> and <code>output=</code> still work in LangGraph
          1.2.10, but warn:{" "}
          <em>
            &ldquo;`input` is deprecated and will be removed. Please use
            `input_schema` instead.&rdquo;
          </em>
        </p>
        <div className="mt-2">
          <CodeBlock code={DOC_GRAPH} language="python" />
        </div>
        <p className="mt-3">
          <strong>2. Nothing is imported.</strong> <code>List</code>,{" "}
          <code>RunnableConfig</code>, <code>SystemMessage</code>,{" "}
          <code>ChatOpenAI</code>, <code>StateGraph</code>, <code>START</code>{" "}
          and <code>END</code> are all used and none appear in any import line on
          the page.
        </p>
        <p className="mt-2">
          <strong>
            3. <code>list[str]</code> becomes <code>List[str]</code> midway.
          </strong>{" "}
          The &ldquo;before&rdquo; block uses the builtin generic and the
          &ldquo;after&rdquo; block switches to the <code>typing</code> alias it
          never imports. Kept as <code>list[str]</code> throughout here.
        </p>
        <p className="mt-2">
          <strong>
            4. <code>resources</code> is never filled in.
          </strong>{" "}
          The page declares it as the field the UI must not see, then leaves{" "}
          <code>
            # ...add the rest of the agent implementation
          </code>{" "}
          where it would be written. Left empty there is nothing to demonstrate
          — an absent key proves nothing if the node never sets it. So{" "}
          <code>answer_node</code> records what it actually sent to the model.
          That stands in for the retrieval step the page describes; it is not a
          guess at one.
        </p>
      </Callout>

      <Panel title="Where the page starts">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Before the split, all three fields sit on one class and all three go
          both ways:
        </p>
        <div className="mt-3">
          <CodeBlock
            code={DOC_BEFORE}
            language="python"
            filename="agent.py — before the split"
          />
        </div>
      </Panel>

      <Callout tone="info" title="Why the demo writes as well as reads">
        <p>
          The page&apos;s frontend snippet only reads —{" "}
          <code>const answer = agent.state.answer as string</code> — and says you
          should &ldquo;expect seeing answer change, while the others are not
          returned&rdquo;. But with nothing writing <code>question</code>, all
          three fields are absent and the claim is untestable. The demo sets{" "}
          <code>question</code> with <code>agent.setState</code> and calls{" "}
          <code>agent.runAgent()</code>, so &ldquo;sent but not returned&rdquo;
          is distinguishable from &ldquo;never sent&rdquo;.
        </p>
      </Callout>

      <Callout tone="warn" title="This page has a duplicate">
        <p>
          <Link
            href="/shared-state/workflow-execution"
            className="underline underline-offset-4"
          >
            Workflow Execution
          </Link>{" "}
          currently serves this page&apos;s content byte for byte — same title
          text, same prose, same code. See that route.
        </p>
      </Callout>
    </>
  );
}
