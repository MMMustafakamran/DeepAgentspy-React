import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/your-components/interrupt-based" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Human-in-the-loop by suspending the graph rather than by asking the
          model to wait. LangGraph&apos;s <code>interrupt()</code> stops
          execution mid-hook; the value it was given is streamed to the browser,{" "}
          <code>useInterrupt</code> renders it, and <code>resolve</code> sends an
          answer back as that call&apos;s return value.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo has both of the page&apos;s sections behind a toggle: one
          interrupt with a plain string, and two interrupts from a single hook
          dispatched to different components by their <code>type</code> field
          using <code>enabled</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello", "What is your name?"]}
            expect={
              <>
                On <strong>One interrupt</strong>, the first message you send is
                answered with a name prompt instead of a reply. Type a name,
                submit, and the run resumes — ask it its name afterwards and it
                uses the one you gave. This half works. On{" "}
                <strong>Two, dispatched by type</strong>, the page&apos;s snippet
                is printed with <code>enabled: ({"{ eventValue }"})</code> and
                there is no such property, so neither the Approve/Reject card
                nor the name form is ever claimed.
              </>
            }
            fail="On the conditional tab a raw JSON blob instead of a form is the expected failure, not a surprise — it is what an unclaimed interrupt looks like. On the single tab it would be a real regression."
          />
        </div>
      </Panel>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/generative-ui/your-components/interrupt-based/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="State, the single-interrupt hook, the two-interrupt hook, and the two create_deep_agent calls."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/interrupt_based.py", region: "agent-state" },
            { file: "backend/src/interrupt_based.py", region: "single-interrupt" },
            { file: "backend/src/interrupt_based.py", region: "multi-interrupt" },
            { file: "backend/src/interrupt_based.py", region: "agents" },
          ]}
        />
      </Panel>

      {/* <Callout tone="info" title="Why the hook, not a node">
        <p>
          A plain LangGraph example would put <code>interrupt()</code> in a node.
          A Deep Agent has no nodes you write, so the page routes it through{" "}
          <code>AgentMiddleware.before_model</code> — a hook that runs on every
          model call and can return a state update. This is also the mechanism
          the State Rendering and Frontend Tools routes borrow for attaching
          custom state, since it is the only documented way in.
        </p>
      </Callout>

      <Callout tone="info" title="Closed by the 30 Aug revision">
        <p>
          This route used to report that the page never constructed an agent —
          it showed the middleware classes and stopped. The 30 Aug revision
          prints the <code>create_deep_agent</code> call end to end, including
          the{" "}
          <code>CopilotKitMiddleware(expose_state=[&quot;agent_name&quot;])</code>{" "}
          entry that replaced the old &ldquo;add{" "}
          <code>copilotkitMiddleware</code> to the graph&rdquo; instruction, and
          a system prompt that names <code>agent_name</code> and tells the model
          to use it. <code>agent</code> in the <code>agents</code> block above is
          now that call verbatim, and the optional state field is{" "}
          <code>NotRequired[str]</code> rather than a bare <code>str</code>.
        </p>
        <p className="mt-2">
          That is also the exact cause this route had filed against it — the
          name reaching state but never reaching the prompt. Whether the fix
          lands is what the next recording checks.
        </p>
      </Callout>

      <Callout tone="warn" title="One gap left in the page">
        <p className="mt-2">
          <strong>
            The second <code>AgentState</code> is elided.
          </strong>{" "}
          <code>ApprovalAndNameMiddleware</code> returns{" "}
          <code>{'{"approval": approval}'}</code>, but the page replaces the
          state class it would land in with the comment{" "}
          <code>&quot;... your full state definition&quot;</code>. Without an{" "}
          <code>approval</code> key the update is dropped, so{" "}
          <code>MultiInterruptState</code> declares one.
        </p>
      </Callout>

      <Callout tone="warn" title="The conditional snippet cannot work as printed">
        <p>
          Both problems are in the &ldquo;Condition UI executions&rdquo; section,
          and both were confirmed against a live run:
        </p>
        <p className="mt-2">
          <strong>
            <code>enabled</code> has no <code>eventValue</code>.
          </strong>{" "}
          The page destructures{" "}
          <code>enabled: ({"{ eventValue }"}) =&gt; eventValue.type === &apos;ask&apos;</code>
          . The predicate is handed the whole event —{" "}
          <code>{"{ name, value }"}</code> — so <code>eventValue</code> is{" "}
          <code>undefined</code> and neither handler ever claims anything.
        </p>
        <p className="mt-2">
          <strong>
            <code>event.value</code> is a string, not an object.
          </strong>{" "}
          A LangGraph <code>interrupt()</code> reaches the browser as the legacy{" "}
          <code>on_interrupt</code> custom event, and the runtime serialises its
          value on the way out. The wire carries{" "}
          <code>&quot;value&quot;:
          &quot;{'{\\"type\\":\\"approval\\",…}'}&quot;</code>, so{" "}
          <code>event.value.content</code> is <code>undefined</code>. The demo
          keeps the page&apos;s form rather than parsing around it, so this stays
          visible.
        </p>
        <p className="mt-2">
          The first section is unaffected: it passes <code>interrupt()</code> a
          plain string, so <code>event.value</code> really is that string and the
          page&apos;s snippet is right.
        </p>
      </Callout>

      <Callout tone="info" title="Not implemented from this page">
        <p>
          The final section, &ldquo;Preprocessing of an interrupt and
          programmatically handling an interrupt value&rdquo;, shows a{" "}
          <code>handler</code> that resolves some interrupts without rendering.
          Its example is a department-authorisation flow built on a{" "}
          <code>getUserByEmail</code> the page never defines and an agent-side
          interrupt it never shows, so there is nothing here to drive it. The{" "}
          <code>handler</code> property itself is real API.
        </p>
      </Callout> */}
    </>
  );
}
