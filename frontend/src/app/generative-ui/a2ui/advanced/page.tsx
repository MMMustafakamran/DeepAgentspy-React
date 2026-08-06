import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_ACTION_HANDLER = `import { useA2UIActionHandler } from "@copilotkit/react-core/v2";

useA2UIActionHandler((action, declaredOps) => {
  if (action.name === "book_flight") {
    return [
      { surfaceUpdate: { surfaceId: action.surfaceId, components: mySchema } },
      { beginRendering: { surfaceId: action.surfaceId, root: "root" } },
    ];
  }
  return null;
});`;

const DOC_ORCHESTRATOR = `import {
  createA2UIMessageRenderer,
  resolveDeclaredOps,
} from "@copilotkit/react-core/v2";

const activityRenderers = [
  createA2UIMessageRenderer({
    theme,
    onAction: (action, handlers, declaredHandlers) => {
      const declaredOps = resolveDeclaredOps(action, declaredHandlers);
      return declaredOps;
    },
  }),
];`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/advanced" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page covers two unrelated things. The first — replacing the
          built-in &ldquo;generating&rdquo; skeleton with your own component — is
          live in the demo. The second, the action-handler APIs, calls exports
          that <code>@copilotkit/react-core 1.66.2</code> does not have; that
          half is documented below rather than implemented.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The trick behind the progress renderer is that the dynamic-schema flow
          is an ordinary tool call named <code>render_a2ui</code>. Claim that
          name with <code>useRenderTool</code> and you own the few seconds before
          the surface paints; return an empty fragment once{" "}
          <code>status === &quot;complete&quot;</code> and the real renderer takes
          over.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a KPI dashboard for a SaaS business last quarter",
              "Chart quarterly revenue for three product lines",
            ]}
            expect={
              <>
                A grey box reading <code>Building interface...</code> with a
                spinner, replacing CopilotKit&apos;s default skeleton. Once the
                schema starts arriving it gains a{" "}
                <code>N components, M items</code> line, then disappears as the
                surface paints.
              </>
            }
            fail="CopilotKit's own skeleton (a shimmering placeholder, no 'Building interface...' text) means the render_a2ui renderer was registered outside the provider that owns this agent."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/advanced/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The progress renderer"
        description="Both of the page's files, verbatim."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/components/a2ui-progress.tsx" },
            { file: "frontend/src/hooks/use-a2ui-progress.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="The action-handler half does not exist">
        <p>
          Everything from &ldquo;Action Handlers&rdquo; down depends on three
          exports that are absent from{" "}
          <code>@copilotkit/react-core 1.66.2</code>:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <code>useA2UIActionHandler</code>
          </li>
          <li>
            <code>resolveDeclaredOps</code>
          </li>
          <li>
            <code>defaultActionOrchestrator</code>
          </li>
        </ul>
        <p className="mt-2">
          <code>createA2UIMessageRenderer</code>, <code>a2uiDefaultTheme</code>{" "}
          and the <code>A2UIUserAction</code> / <code>A2UIActionInterceptor</code>{" "}
          types <em>are</em> exported. So the &ldquo;custom orchestrator&rdquo;
          snippet is half-real: the factory exists, but the{" "}
          <code>resolveDeclaredOps</code> it calls inside{" "}
          <code>onAction</code> does not.
        </p>
        <div className="mt-3 space-y-3">
          <CodeBlock
            code={DOC_ACTION_HANDLER}
            language="tsx"
            filename="the doc page — does not compile"
          />
          <CodeBlock
            code={DOC_ORCHESTRATOR}
            language="tsx"
            filename="the doc page — resolveDeclaredOps is not exported"
          />
        </div>
        <p className="mt-3">
          This is the same gap as on the Fixed Schema route, from the other side:
          the agent cannot declare <code>action_handlers</code> because the
          Python SDK has no such parameter, and the frontend cannot pick up the
          slack because the hook is missing. There is currently no way to make an
          A2UI button do anything.
        </p>
      </Callout>

      <Callout tone="info" title="Broken links in this page">
        <p>
          The Action Handlers section links to{" "}
          <code>./fixed-schema#adding-interactivity-action-handlers</code> and{" "}
          <code>./fixed-schema-streaming#…</code>. The Fixed Schema page has no
          such anchor — its section is called &ldquo;Action handler
          details&rdquo; — and{" "}
          <code>/deepagents/generative-ui/a2ui/fixed-schema-streaming</code> does
          not exist at all.
        </p>
      </Callout>

      <Callout tone="info" title="What is in parameters">
        <p>
          The page&apos;s table is accurate for what streams into the progress
          renderer: <code>surfaceId</code>, then <code>components</code> (the
          schema, which arrives first and completely), then <code>root</code>,
          then <code>items</code> one object at a time. Watching the{" "}
          <code>N components, M items</code> line in the demo is the easiest way
          to see that ordering.
        </p>
      </Callout>
    </>
  );
}
