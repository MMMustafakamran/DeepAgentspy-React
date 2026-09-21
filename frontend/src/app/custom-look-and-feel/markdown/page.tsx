import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const THROWN = `useAgent: Agent 'default' not found after runtime sync (runtimeUrl=/api/copilotkit).
Known agents: [sample_agent, tool_rendering_agent, state_rendering_agent, interrupt_agent, …]
Verify your runtime /info and/or agents__unsafe_dev_only.`;

const SHAPE = `<CopilotChat
  messageView={{
    assistantMessage: {
      markdownRenderer: {
        /* ... */
      },
    },
  }}
/>`;

const TSC_OUTPUT = `$ tsc --noEmit        # custom-tag.tsx with the @ts-expect-error line removed
src/app/custom-look-and-feel/markdown/custom-tag.tsx(46,15): error TS2353:
  Object literal may only specify known properties, and '"reference-chip"'
  does not exist in type 'Components'.
src/app/custom-look-and-feel/markdown/custom-tag.tsx(46,36): error TS7031:
  Binding element 'children' implicitly has an 'any' type.

installed streamdown 1.6.11, @copilotkit/react-core 1.71.0
(neither is declared in frontend/package.json: react-core is ^1.69.0,
 streamdown is not a dependency of this repo at all)`;

const SLOT_MECHANICS = `// @copilotkit/react-core 1.71.0, src/v2/lib/slots.tsx, as shipped
function renderSlotElement(slot, DefaultComponent, props) {
  if (typeof slot === "string") {                       // "text-sm leading-7"
    const existingClassName = props.className;
    return React.createElement(DefaultComponent, {
      ...props,
      className: twMerge(existingClassName, slot),
    });
  }
  if (isReactComponentType(slot))                       // PlainText
    return React.createElement(slot, props);
  if (slot && typeof slot === "object" && !React.isValidElement(slot))
    return React.createElement(DefaultComponent, { ...props, ...slot });  // { components }
  return React.createElement(DefaultComponent, props);
}

// and the props the slot is bound with, in CopilotChatAssistantMessage:
const boundMarkdownRenderer = renderSlot(
  markdownRenderer,
  CopilotChatAssistantMessage.MarkdownRenderer,
  { content: message.content || "" },
);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/markdown" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Assistant replies are markdown, and CopilotKit draws them through the{" "}
          <code>markdownRenderer</code> slot on{" "}
          <code>CopilotChatAssistantMessage</code>, whose default wraps
          Streamdown. The page teaches three ways to reach it — a Streamdown{" "}
          <code>components</code> override map, a class string, and a component
          that replaces the renderer outright and receives one{" "}
          <code>content</code> prop — and makes four checkable claims about what
          the props you receive contain.
        </p>
        <div className="mt-4">
          <CodeBlock
            code={SHAPE}
            language="tsx"
            filename="the shape, as the page opens with it"
          />
        </div>
        <div className="mt-4">
          <TryIt
            prompts={[
              'On "Page code, verbatim": just wait two seconds.',
              'On the other tabs: Reply in markdown. Include an "## Example" heading, a link to https://docs.copilotkit.ai/deepagents, and the literal text <reference-chip id="42">Doc 42</reference-chip>.',
            ]}
            expect={
              <>
                Per the page, the first tab would already work. What happens:
                the first tab throws and prints the error. On{" "}
                <strong>components map</strong> the probe&apos;s anchor row
                reads{" "}
                <code>
                  &lt;a href=&quot;…&quot; target=&quot;_blank&quot;
                  rel=&quot;noopener noreferrer&quot; class=&quot;my-link&quot;&gt;
                </code>{" "}
                with no <code>data-streamdown</code> on it and{" "}
                <code>node</code> count 0; on{" "}
                <strong>no override</strong> the same row carries{" "}
                <code>data-streamdown=&quot;link&quot;</code> and Streamdown&apos;s
                classes. On every tab the reference-chip renders as plain text.
              </>
            }
            fail="A node attribute count above 0, a link with no rel/target on the components tab, or a reference-chip that renders as an element."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="As published, every block on this page targets an agent called `default`">
        All three snippets are a bare <code>&lt;CopilotChat&gt;</code> with only{" "}
        <code>messageView</code> on it. With no agent id,{" "}
        <code>CopilotChat</code> resolves to{" "}
        <code>agentId ?? config ?? provider ?? DEFAULT_AGENT_ID</code> and calls{" "}
        <code>useAgent(&#123; agentId: &quot;default&quot; &#125;)</code>. A Deep
        Agents runtime registers its LangGraph graphs by graph id — the
        Quickstart&apos;s is <code>sample_agent</code> — and has no{" "}
        <code>default</code>, so the chat paints and then throws the moment{" "}
        <code>/info</code> answers. This is the same defect already filed
        against Frontend-Driven Cards, in a second page, and it is what the
        first demo tab shows.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {THROWN}
        </pre>
      </Callout>

      <Callout tone="warn" title="“Drop `node`” is a lint warning in a stock Next project">
        The page is right that <code>node</code> must come out — spread it and
        the renderer writes <code>node=&quot;[object Object]&quot;</code> into
        the document. But the way it says to remove it, destructuring the name
        and never using it, is what{" "}
        <code>@typescript-eslint/no-unused-vars</code> is for, and the config a{" "}
        <code>create-next-app</code> project ships with reports it:{" "}
        <code>&apos;node&apos; is defined but never used</code>, once per
        overridden tag. Four of them here, because the published block
        overrides two tags and this route ships it twice. The snippet is
        unchanged and the warnings stand; a page that hands a reader a pattern
        their own linter rejects should say which of the two is wrong.
      </Callout>

      <Callout tone="warn" title="No block on the page carries `use client`">
        Each snippet is titled <code>page.tsx</code> and passes inline arrow
        functions as props to <code>&lt;CopilotChat&gt;</code>, which is a
        client component. Under the App Router a <code>page.tsx</code> with no{" "}
        <code>&quot;use client&quot;</code> is a Server Component, and passing a
        function prop across that boundary is refused at render. The directive
        is on line 1 of <code>chat-variants.tsx</code> here and appears nowhere
        on the page.
      </Callout>

      <Callout tone="success" title="The slot mechanics are exactly as described">
        Read out of the shipped 1.71.0 bundle rather than inferred. A string is{" "}
        <code>twMerge</code>d onto the renderer&apos;s own{" "}
        <code>className</code>, so &ldquo;merged onto the markdown
        container&rdquo; is literal. A component is created with the slot&apos;s
        bound props and nothing else, and those props are{" "}
        <code>&#123; content: message.content || &quot;&quot; &#125;</code>, so
        &ldquo;receives exactly one prop&rdquo; is literal too. An object is
        spread over the default renderer&apos;s props, and the default renderer
        forwards everything but <code>content</code> straight to{" "}
        <code>&lt;Streamdown&gt;</code>, which is how <code>components</code>{" "}
        arrives. <code>CopilotSidebar</code> and <code>CopilotPopup</code> take{" "}
        <code>messageView</code> through{" "}
        <code>Omit&lt;CopilotChatProps, &quot;chatView&quot;&gt;</code>, so the
        page&apos;s &ldquo;works the same way&rdquo; holds on the type level.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SLOT_MECHANICS}
        </pre>
      </Callout>

      <Callout tone="success" title="Link hardening does reach your component">
        The page says an <code>a</code> is handed <code>href</code>,{" "}
        <code>target</code> and <code>rel</code>, with{" "}
        <code>target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot;</code>{" "}
        already applied. It is not the anchor component that applies them:
        Streamdown runs <code>rehype-harden</code> 1.1.8 as one of its default
        rehype plugins, and that plugin writes{" "}
        <code>node.properties.target = &quot;_blank&quot;</code> and{" "}
        <code>node.properties.rel = &quot;noopener noreferrer&quot;</code> onto
        the tree. Because it is on the tree rather than in the component, an
        override that spreads its props keeps it — which is what the page says,
        and what the probe is there to read back off the live reply.
        Streamdown&apos;s own{" "}
        <code>MarkdownA</code> hardcodes the weaker{" "}
        <code>rel=&quot;noreferrer&quot;</code> and is then overwritten by the
        same spread, so the page&apos;s quoted value is the one that ships.
      </Callout>

      <Callout tone="warn" title="The page's headline example changes nothing you can see">
        <code>components</code> is the technique the page says to &ldquo;reach
        for first&rdquo;, and its example sets{" "}
        <code>className=&quot;my-link&quot;</code> and{" "}
        <code>className=&quot;my-heading&quot;</code>. Neither class is defined
        anywhere on the page, and no step tells you to define them. In a
        Tailwind project — which is what the snippet&apos;s own{" "}
        <code>text-sm leading-7</code> example assumes two sections later —
        they match no utility, so following the primary example end to end
        replaces two working components with two that look worse and produces
        no visible change at all. The demo ships it unchanged and the probe
        counts the elements the classes landed on, which is the only way to see
        that it did anything.
      </Callout>

      <Callout tone="warn" title="“You are replacing, not extending” is understated">
        The page names the lost <code>data-streamdown</code> attribute and the
        lost classes. What it does not say is that the default anchor is a
        memoized component with its own equality check, and that the default
        heading, list, table and code components carry the same marks — so a
        one-tag override silently opts that tag out of Streamdown&apos;s
        incomplete-markdown handling as well (<code>data-incomplete</code>,
        which the shipped anchor sets and a hand-written one does not). Compare
        the <strong>components map</strong> and <strong>no override</strong>{" "}
        tabs: the mark count drops by the number of anchors and{" "}
        <code>h2</code> headings in the reply, not by nothing.
      </Callout>

      <Callout tone="success" title="Custom tags: the page's error message is exact">
        <code>Components</code> in streamdown 1.6.11 is keyed by{" "}
        <code>keyof JSX.IntrinsicElements</code>, so{" "}
        <code>&quot;reference-chip&quot;</code> is rejected with precisely the
        TS2353 the page prints. One thing the page leaves out: the same line
        also raises TS7031, because an unknown key carries no contextual type
        for the component&apos;s props, so a reader who copies the example sees
        two errors and is told to expect one. The runtime half holds as well —
        Streamdown&apos;s default rehype chain includes{" "}
        <code>rehype-sanitize</code> with the default schema, which drops an
        unknown element and keeps its text.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="info" title="Not exercised here">
        The &ldquo;Other frontends&rdquo; section describes a Vue{" "}
        <code>message-renderer</code> scoped slot over{" "}
        <code>streamdown-vue</code> and an Angular{" "}
        <code>#markdownRenderer</code> <code>ng-template</code> over{" "}
        <code>marked</code>. This is the React harness; the Angular claim is
        checkable in DeepAgentspy-angular and nothing compares the two. Both
        reference links point outside <code>/deepagents</code> (
        <code>/reference/vue/…</code>, <code>/reference/angular/…</code>), so
        the drift gate&apos;s in-section link scan does not follow them either.
      </Callout>

      <Panel
        title="The page's blocks"
        description="All three techniques verbatim, plus the one copy of each that adds the agent id, and the custom-tag compile check."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/custom-look-and-feel/markdown/chat-variants.tsx" },
            { file: "frontend/src/app/custom-look-and-feel/markdown/custom-tag.tsx" },
          ]}
        />
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/custom-look-and-feel/markdown/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
