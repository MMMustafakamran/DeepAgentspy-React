import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The whole stack in one message. A Deep Agent with a single Python
          function as its tool, published as the graph <code>sample_agent</code>{" "}
          by the LangGraph dev server, addressed by a{" "}
          <code>CopilotRuntime</code> route holding a <code>LangGraphAgent</code>
          , and driven by a <code>CopilotSidebar</code> in the browser.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page offers three backend tabs — Python, TypeScript and FastAPI.
          This repo takes the <strong>Python</strong> tab (a{" "}
          <code>langgraph.json</code> manifest served by the LangGraph CLI), and
          therefore the <strong>Deep Agent</strong> tab of the runtime step, not
          the FastAPI one.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "What's the weather in Lisbon?",
              "What tools do you have access to?",
            ]}
            expect={
              <>
                Tokens stream a word at a time. The first prompt opens a
                collapsed <code>Called get_weather</code> row — that is{" "}
                <code>useDefaultRenderTool</code> drawing the call — and the
                reply says Lisbon is sunny.
              </>
            }
            fail="An error banner in the chat, or no reply at all. Check that `langgraph dev` is up on :8123 and that backend/.env has OPENAI_API_KEY."
          />
        </div>
      </Panel>

      <Callout tone="info" title="The Intelligence step renamed its key; this repo takes the fallback">
        <p>
          Step 4&apos;s runtime snippet now reads{" "}
          <code>CPK_INTELLIGENCE_API_KEY</code> where it read{" "}
          <code>INTELLIGENCE_API_KEY</code>, its <code>.env.local</code>{" "}
          placeholder went from <code>your_license_key</code> to{" "}
          <code>cpk-...</code>, and the prose stopped calling it a license key
          and started calling it the project API key. Both TypeScript and
          FastAPI tabs of that step changed the same way.
        </p>
        <p className="mt-2">
          Nothing here reads it. The same step&apos;s callout documents dropping{" "}
          <code>intelligence</code> and <code>identifyUser</code> to fall back to
          SSE with an <code>InMemoryAgentRunner</code>, and that is the path this
          runtime route takes — so the rename is recorded rather than
          implemented. The link under the callout also moved from{" "}
          <code>/deepagents/premium/connect-your-runtime</code> to{" "}
          <code>/deepagents/intelligence/connect-your-runtime</code>.
        </p>
      </Callout>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="The page's main.py, and the manifest that publishes it."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/main.py", region: "quickstart-agent" },
            { file: "backend/langgraph.json" },
          ]}
        />
      </Panel>

      <Panel
        title="The runtime route"
        description="Read from this repo, so it can be diffed against the page's snippet directly."
      >
        <SourceCode file="frontend/src/app/api/copilotkit/route.ts" />
      </Panel>
    </>
  );
}
