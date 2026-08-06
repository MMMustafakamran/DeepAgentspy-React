import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool the agent can call whose body never leaves the browser. The
          Python side defines no tool at all — it inherits{" "}
          <code>CopilotKitState</code>, which gives it a{" "}
          <code>copilotkit</code> key, and{" "}
          <code>CopilotKitMiddleware</code> fills that key with whatever the
          browser registered before the run started.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          So <code>sayHello</code> exists only in{" "}
          <code>demo-chat/page.tsx</code>. Restart the agent server and it is
          still there; close the tab and the agent loses it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Say hello to Ada", "Say hello to me — my name is Grace"]}
            expect={
              <>
                A browser <code>alert()</code> reading{" "}
                <code>Hello, Ada!</code>. Dismiss it and a green line appears in
                the left panel, then the agent replies that it said hello — that
                reply is the handler&apos;s return value going back to the model.
              </>
            }
            fail="The agent describing what it would do rather than doing it means the tool never reached it — check that CopilotKitMiddleware is in the agent's middleware list."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/frontend-tools/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The tool, isolated"
        description="The page's page.tsx snippet, as it actually runs here."
      >
        <SourceCode
          file="frontend/src/app/frontend-tools/demo-chat/page.tsx"
          region="use-frontend-tool"
        />
      </Panel>

      <Panel
        title="The agent"
        description="The page's Python is the state class alone; the agent below is written to the shape it describes."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/frontend_tools.py", region: "agent-state" },
            { file: "backend/src/frontend_tools.py", region: "agent" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="The page is partly about a different framework">
        <p>
          Its Step 1 links to <code>/langgraph/quickstart</code>, not the Deep
          Agents one, and points at the <code>coagents-starter</code> example.
          Steps 4 and 5 then repeat the &ldquo;What is this?&rdquo;, &ldquo;When
          should I use this?&rdquo; and &ldquo;Create a frontend tool&rdquo;
          sections verbatim — the same <code>useFrontendTool</code> snippet
          appears twice on the page. The Python contribution is one class either
          way.
        </p>
      </Callout>

      <Callout tone="info" title="Deep Agents state needs a carrier">
        <p>
          The page says to &ldquo;inherit from <code>CopilotKitState</code> in
          your agent&apos;s state definition&rdquo;, but{" "}
          <code>create_deep_agent</code> takes no state definition. The class is
          attached through an <code>AgentMiddleware</code> with{" "}
          <code>state_schema = YourAgentState</code>, which is what the
          Interrupt-based page documents. The same pattern shows up on State
          Rendering and both Shared State routes.
        </p>
      </Callout>
    </>
  );
}
