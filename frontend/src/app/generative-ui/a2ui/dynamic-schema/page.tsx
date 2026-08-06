import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The opposite trade from Fixed Schema. Nothing is authored ahead of
          time: the agent decides a visual would help, calls{" "}
          <code>generate_a2ui</code>, and a second LLM writes the component tree
          and the data for that specific answer. Any request can get a UI; no
          request gets a guaranteed one.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The backend contributes nothing but{" "}
          <code>CopilotKitMiddleware</code>. It injects and executes{" "}
          <code>generate_a2ui</code> on its own; the system prompt only tells the
          model <em>when</em> to reach for it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a KPI dashboard for a SaaS business last quarter",
              "Compare three cloud providers on price, latency and regions",
            ]}
            expect={
              <>
                A progress skeleton for a few seconds while the schema is
                written, then cards appearing one at a time as the data streams
                in — with a one-line chat reply beside them, not a wall of text.
              </>
            }
            fail="A long prose answer with no surface means the model chose not to call generate_a2ui. An empty surface means the generated schema had no component with id 'root'."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The agent">
        <SourceCode file="backend/src/a2ui_dynamic.py" region="dynamic-agent" />
      </Panel>

      <Panel
        title="The runtime"
        description="No a2ui block at all — that is the page's point. The catalog on the provider is the switch."
      >
        <SourceCode file="frontend/src/app/api/copilotkit-a2ui-dynamic/route.ts" />
      </Panel>

      <Panel
        title="The catalog"
        description="What the second LLM is allowed to draw with. Its definitions are serialised into that LLM's prompt, so the descriptions are load-bearing — they are how it learns what each component is for."
      >
        <SourceCodeGroup
          files={[
            {
              file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts",
            },
            {
              file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts",
            },
            {
              file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx",
            },
          ]}
          note={
            <>
              <code>includeBasicCatalog: true</code> merges CopilotKit&apos;s
              built-in components underneath, so the LLM can compose custom and
              basic ones freely and the custom definitions win on name
              collisions.
            </>
          }
        />
      </Panel>

      <Callout tone="warn" title="myCatalog is never defined on the page">
        <p>
          The page writes <code>{"<CopilotKit a2ui={{ catalog: myCatalog }}>"}</code>{" "}
          and links to &ldquo;Bring Your Own Catalog&rdquo; for the{" "}
          <code>definitions</code> / <code>renderers</code> /{" "}
          <code>createCatalog</code> split. That link resolves to{" "}
          <code>/generative-ui/a2ui/dynamic-schema</code> — a path outside the
          Deep Agents tree, and in fact a relative link back to a sibling of the
          page itself. The catalog above was supplied for this repo.
        </p>
      </Callout>

      <Callout tone="info" title="Two switches, one on each side">
        <p>
          The page shows <code>injectA2UITool: true</code> on the runtime{" "}
          <em>and</em> <code>a2ui={"{{ catalog }}"}</code> on the provider, as
          though both were needed. Only the provider prop is: passing a catalog
          enables A2UI and injection follows. That is why the runtime for this
          route has no <code>a2ui</code> block, and why the fixed-schema runtime
          has to explicitly set <code>injectA2UITool: false</code> to opt back
          out.
        </p>
      </Callout>

      <Callout tone="info" title="The model id">
        <p>
          The page passes <code>ChatOpenAI(model=&quot;gpt-5.4&quot;)</code>.
          Every agent here reads <code>OPENAI_MODEL</code> instead, defaulting to
          the Quickstart&apos;s <code>gpt-4o</code>. Dynamic A2UI leans on the
          model harder than any other route — a weaker one produces schemas that
          fail the &ldquo;exactly one component with id root&rdquo; rule and
          render blank.
        </p>
      </Callout>
    </>
  );
}
