import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-read" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Agent state as ordinary React state. <code>useAgent</code> returns the
          agent; <code>agent.state</code> is a reactive object, so a component
          reading a field off it re-renders when the agent writes that field. No
          subscription and no effect.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This route only reads.{" "}
          <Link
            href="/shared-state/in-app-agent-write"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Writing agent state
          </Link>{" "}
          drives the same agent from the other direction — the two doc pages
          print identical Python.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "What language are you answering in?"]}
            expect={
              <>
                The left panel reads <code>Language: english</code> before you
                send anything, and the JSON dump below it shows the full state
                object with a <code>language</code> key.
              </>
            }
            fail="An empty JSON dump means the agent has not run yet — state is only synced once a run starts. `Language: english` with no `language` key in the dump means you are seeing the ?? fallback, not real state."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-read/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="Shared with the Writing route. The state class is the page's; the rest is the glue it omits."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/shared_state.py", region: "agent-state" },
            { file: "backend/src/shared_state.py", region: "agent" },
          ]}
        />
      </Panel>

      {/* <Callout tone="warn" title="The Literal default is not a default">
        <p>
          The page writes{" "}
          <code>language: Literal[&quot;english&quot;, &quot;spanish&quot;] = &quot;english&quot;</code>{" "}
          and its screenshot shows &ldquo;english&rdquo; before anything runs.
          But <code>CopilotKitState</code> is a <code>dict</code> subclass —
          that <code>= &quot;english&quot;</code> is a class attribute, not a
          field default, and LangGraph never applies it. Without help the key is
          simply absent and you are looking at the{" "}
          <code>?? &quot;english&quot;</code> in the component.
        </p>
        <p className="mt-2">
          <code>LanguageStateMiddleware.before_agent</code> seeds the key on the
          first turn so the value in the panel is really the agent&apos;s.
        </p>
      </Callout>

      <Callout tone="info" title="Reading is not seeing">
        <p>
          The page says the agent &ldquo;reads <code>state[&quot;language&quot;]</code>{" "}
          from tools or middleware hooks as it runs&rdquo;. True, but the{" "}
          <em>model</em> does not see state unless something puts it in the
          prompt. That is{" "}
          <code>CopilotKitMiddleware(expose_state=[&quot;language&quot;])</code>,
          which defaults to off and is not mentioned on either Shared State page.
          It only matters once you start writing — see the Writing route.
        </p>
      </Callout>

      <Callout tone="info" title="State only flows once a run starts">
        <p>
          The panel is empty on a cold load and fills in after the first message.
          AG-UI sends a state snapshot as part of a run, so there is nothing to
          read before one has happened. The page&apos;s screenshot skips this.
        </p>
      </Callout> */}
    </>
  );
}
