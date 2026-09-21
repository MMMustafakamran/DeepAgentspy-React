import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, KeyValue, Panel } from "@/components/ui";

import { PreparedControls } from "./prepared-controls";

const INSTALL = `npm install @copilotkit/core@1.73.0 @copilotkit/react-core@1.73.0 @copilotkit/runtime@1.73.0 @ag-ui/client@0.0.59 @ag-ui/core@0.0.59 @typesafe-ai/sdk@0.6.0 rxjs@7.8.1 zod@4.6.5 @langchain/openai@1.5.13 @langchain/core@1.2.11`;

const ENV = `TYPESAFE_API_KEY=your-typesafe-key
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-5.4`;

const SWALLOWED = `// lib/picker-agent.ts, the last published block
void runPicker(input, controller.signal, (event) => subscriber.next(event))
  .then(() => subscriber.complete())
  .catch(() => {                                     // <- no parameter
    if (!subscriber.closed) {
      subscriber.next({ type: EventType.RUN_ERROR,
        message: "The picker could not finish. Try again.", code: "PICKER_FAILED" });
      subscriber.complete();
    }
  });`;

const VERSIONS: [string, string, string][] = [
  ["@copilotkit/core", "1.73.0", "1.71.0 installed · undeclared (transitive)"],
  ["@copilotkit/react-core", "1.73.0", "1.71.0 installed · declared ^1.69.0"],
  ["@copilotkit/runtime", "1.73.0", "1.71.0 installed · declared ^1.69.0"],
  ["@ag-ui/client", "0.0.59", "0.0.59 installed · undeclared (transitive)"],
  ["@ag-ui/core", "0.0.59", "0.0.59 installed · undeclared (transitive)"],
  ["@typesafe-ai/sdk", "0.6.0", "absent"],
  ["rxjs", "7.8.1", "7.8.1 installed · undeclared (transitive)"],
  ["zod", "4.6.5", "3.25.76 installed · declared ^3.25.76"],
  ["@langchain/openai", "1.5.13", "absent"],
  ["@langchain/core", "1.2.11", "1.2.10 installed · undeclared (transitive)"],
];

export default function Page() {
  return (
    <>
      <RouteHeader path="/cookbook/jev-generative-ui" />

      <Panel title="What it demonstrates, and what it cannot demonstrate here">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A workspace picker whose next control — ask a clarifying question, or
          compare rooms — is chosen by Jev, TypeSafe&apos;s decision service,
          and whose rooms are ranked by Jev fit scores. CopilotKit and AG-UI
          carry the resulting state to React; the application owns the schemas,
          the components, the fixed labels and the confirmed actions.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The decision layer cannot run here and is not simulated. It needs{" "}
          <code>@typesafe-ai/sdk</code>, which is not installed, and a{" "}
          <code>TYPESAFE_API_KEY</code> from a third-party vendor this project
          has no account with. The fallback path needs{" "}
          <code>@langchain/openai</code>, also absent. Everything else in the
          recipe is here verbatim, and the split between the two halves is
          drawn by the compiler rather than asserted: every published
          TypeScript block is in this repo and typechecks, with{" "}
          <code>@ts-expect-error</code> on exactly the two import lines whose
          packages do not exist.
        </p>
      </Panel>

      <Callout tone="warn" title="Nothing in this recipe is a Deep Agent">
        It is published at <code>/deepagents/cookbook/jev-generative-ui</code>,
        and the words &ldquo;Deep Agents&rdquo;, &ldquo;LangGraph&rdquo; and
        &ldquo;Python&rdquo; appear nowhere in its body. The agent is a
        hand-written TypeScript <code>AbstractAgent</code> living inside the
        Next app; the runtime step replaces{" "}
        <code>app/api/copilotkit/[[...slug]]/route.ts</code> — the file the
        Deep Agents Quickstart tells you to create, pointing at a{" "}
        <code>langgraph dev</code> server — with one that registers{" "}
        <code>new PickerAgent()</code> and reaches no backend at all. Following
        it inside a Deep Agents project means deleting the integration the
        section documents. This harness runs a Python backend on{" "}
        <code>:8123</code>, so the recipe&apos;s stack is not reachable from
        this integration at all: there is no step that connects the two, and
        the page never says one is needed.
      </Callout>

      <Callout tone="warn" title="The install line is ten exact pins, six of which this repo does not meet">
        <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {INSTALL}
        </pre>
        <table className="mt-3 w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500">
              <th className="py-1 pr-3 font-medium">Package</th>
              <th className="py-1 pr-3 font-medium">Pinned by the page</th>
              <th className="py-1 font-medium">Here</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {VERSIONS.map(([pkg, pinned, here]) => (
              <tr key={pkg} className="border-t border-amber-200 dark:border-amber-900">
                <td className="py-1 pr-3">{pkg}</td>
                <td className="py-1 pr-3">{pinned}</td>
                <td className="py-1">{here}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3">
          Five of the ten are in this repo only as transitive dependencies of{" "}
          <code>@copilotkit/*</code>, declared nowhere in{" "}
          <code>frontend/package.json</code>. Two do not exist here at all. One
          is a major version behind. And the 1.73.0 floor on the three
          CopilotKit packages is never justified: every published block in this
          repo typechecks against the installed <strong>1.71.0</strong>,
          including the runtime registration and the whole of{" "}
          <code>app/page.tsx</code>. The page states no reason for the pin and
          names no feature that needs it, so a reader cannot tell whether
          1.73.0 is required or merely what the author had.
        </p>
      </Callout>

      <Callout tone="warn" title="A vendor key, and a failure mode that hides its absence">
        <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {ENV}
        </pre>
        <p className="mt-2">
          <code>TYPESAFE_API_KEY</code> comes from TypeSafe, not CopilotKit,
          through their own quickstart. The recipe&apos;s last step is
          &ldquo;Start your development server and open the page&rdquo;, with
          no check that either key is set and nothing about what happens if one
          is not. What happens is the worst version: the published{" "}
          <code>run</code> wrapper catches every error with a parameterless{" "}
          <code>.catch(() =&gt; …)</code>, discards it, and emits a fixed{" "}
          <code>RUN_ERROR</code> reading &ldquo;The picker could not
          finish. Try again.&rdquo; A missing key, an unreachable vendor, an
          invalid model id and a genuine bug are all the same sentence, and
          &ldquo;Try again&rdquo; is advice that can never work.
        </p>
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {SWALLOWED}
        </pre>
      </Callout>

      <Callout tone="info" title="What the shared-state callout claims, and what the recipe does">
        The page opens with &ldquo;This recipe renders{" "}
        <a
          className="underline underline-offset-4"
          href="https://docs.copilotkit.ai/deepagents/shared-state"
          target="_blank"
          rel="noreferrer"
        >
          shared agent state
        </a>
        &rdquo;, and on the React side that is accurate:{" "}
        <code>useAgent(&#123; agentId: &quot;picker&quot; &#125;)</code> then{" "}
        <code>agent.state</code> is exactly what{" "}
        <a className="underline underline-offset-4" href="/shared-state/in-app-agent-read">
          Reading agent state
        </a>{" "}
        teaches, and this repo has it working. It does not contradict those
        pages so much as bypass them. Shared state under{" "}
        <code>/deepagents</code> is a Python concern — the state class on the
        graph, <code>CopilotKitMiddleware(expose_state=[…])</code> for the write
        direction, <code>copilotkit_emit_state</code> for streaming — and none
        of that exists in a recipe whose agent emits its own{" "}
        <code>STATE_SNAPSHOT</code> from TypeScript. Two consequences a reader
        arriving from the shared-state section will hit: the recipe never needs{" "}
        <code>expose_state</code>, because there is no Python model reading the
        state, so the one prerequisite this repo found missing from both
        shared-state pages is silently irrelevant here; and{" "}
        <code>StateSchema</code> is enforced with zod on both ends of the wire,
        which the shared-state pages never do. The second link in the same
        callout, <code>/deepagents/concepts/generative-ui-overview</code>,
        resolves (200) but is tracked nowhere in this repo and is on the
        acknowledged-unmapped list.
      </Callout>

      <Callout tone="warn" title="The optional half rests on three things already filed as broken here">
        &ldquo;Optional: improve decisions and UI with Automatic Learning&rdquo;
        sends you to <a className="underline underline-offset-4" href="/learning">Learning</a>,{" "}
        <a className="underline underline-offset-4" href="/intelligence/learned-skills">
          Automatic learned skill delivery
        </a>{" "}
        and <code>/deepagents/intelligence/quickstart</code>. The first is ❌
        here (its runtime snippet throws at module load without{" "}
        <code>CPK_INTELLIGENCE_API_KEY</code>, README §9 #24); the second is ❌
        here (no row of its adapter table can be followed, §9 #26); the third
        is a page this repo deleted its route for and does not track. On top of
        that the section says to install{" "}
        <code>@copilotkit/intelligence-langgraph@1.71.2</code>{" "}
        &ldquo;alongside the pinned stack above&rdquo; — a 1.71.2 pin sitting
        next to three 1.73.0 pins from the same package family, with no note
        that the versions differ or that they may be expected to. Its{" "}
        <code>SkillRegistry</code> snippet is quoted below and is not shipped:
        the package is not installed, and installing it would not make the
        section work, because the container and key behind it do not exist
        here either.
      </Callout>

      <Callout tone="warn" title="Smaller things a reader hits">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>choosePanel</code> validates every candidate score and throws
            on a missing one <em>before</em> checking whether the control was{" "}
            <code>agent</code>. On the branch where Jev has decided the
            prepared controls do not apply, an absent fit score still kills the
            run, and the generic <code>RUN_ERROR</code> above is what the user
            sees.
          </li>
          <li>
            <code>respond</code> passes <code>[]</code> for{" "}
            <code>publishedGuidance</code>. The optional section tells you to
            replace it, so the main recipe ships a parameter that is threaded
            through three functions and always empty.
          </li>
          <li>
            Both multi-block files are syntactically incomplete until the last
            block is pasted — <code>choose-panel.ts</code> opens a function in
            block one and closes it in block three, and{" "}
            <code>app/page.tsx</code> opens <code>Picker</code> in block two
            and closes it in block four. The page says so, and it still means
            no block on this page can be checked on its own.
          </li>
          <li>
            The filenames are <code>lib/*.ts</code> and{" "}
            <code>app/page.tsx</code>, with the alias note in &ldquo;Before you
            start&rdquo; covering <code>@/*</code>. This repo is one app across
            twenty-three doc pages, so all of it lives under this route
            instead; the relative imports are the only edits to any block, and
            they are named in each file&apos;s header.
          </li>
        </ul>
      </Callout>

      <Panel
        title="The half that runs"
        description="The prepared controls, their schemas and readAction, live. Jev is absent and is not stood in for: the panel is chosen with the two buttons."
      >
        <PreparedControls />
        <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          What is real here: <code>PanelSchema</code> and{" "}
          <code>StateSchema</code> parse every transition;{" "}
          <code>readAction</code> runs verbatim on each click and its return
          value is what the table prints; the clarification panel is built by
          exactly the expression <code>choosePanel</code> builds it with, which
          on that branch reads no Jev output at all. What is missing and
          labelled: the control choice, and the fit-score ordering of the
          comparison options.
        </p>
      </Panel>

      <Panel title="What was checked">
        <KeyValue
          rows={[
            ["Checked on", "2026-09-21"],
            [
              "Method",
              <>
                Every published TypeScript block copied into this repo and run
                through <code>tsc --noEmit</code>, with{" "}
                <code>@ts-expect-error</code> on the two import lines whose
                packages are absent. Installed versions read from{" "}
                <code>frontend/node_modules</code>, declared ones from{" "}
                <code>frontend/package.json</code>.
              </>,
            ],
            [
              "Result",
              <>
                All of it typechecks on <strong>1.71.0</strong>, three minor
                versions below the page&apos;s pin, and on zod 3 rather than
                the pinned zod 4. Nothing was run: the decision layer and the
                fallback both need packages and keys this project does not
                have.
              </>,
            ],
            [
              "Not done",
              <>
                Nothing was installed and no version was bumped, so the recipe
                was never executed end to end. Whether it works with the vendor
                key is unknown and is not claimed either way.
              </>,
            ],
          ]}
        />
      </Panel>

      <Panel
        title="The recipe, verbatim"
        description="Every published block, in the page's order. choose-panel.ts, picker-agent.ts, runtime-route.ts and picker-page.tsx are imported by nothing — they compile, they cannot run, and each header says why."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/cookbook/jev-generative-ui/workspaces.ts" },
            { file: "frontend/src/app/cookbook/jev-generative-ui/choose-panel.ts" },
            { file: "frontend/src/app/cookbook/jev-generative-ui/picker-agent.ts" },
            { file: "frontend/src/app/cookbook/jev-generative-ui/runtime-route.ts" },
            { file: "frontend/src/app/cookbook/jev-generative-ui/picker-page.tsx" },
            { file: "frontend/src/app/cookbook/jev-generative-ui/read-action.ts" },
          ]}
        />
      </Panel>

      <Panel
        title="The one block not shipped"
        description="lib/learned-guidance.ts, from the optional Automatic Learning section. @copilotkit/intelligence-langgraph is not installed here, and the container and key behind it do not exist either, so it is quoted rather than compiled."
      >
        <CodeBlock
          language="ts"
          filename="lib/learned-guidance.ts — published, not shipped"
          code={`import { SkillRegistry } from "@copilotkit/intelligence-langgraph";

const registry = new SkillRegistry();
export async function loadGuidance() {
  await registry.initialize();
  const snapshot = await registry.acquireSnapshot();
  return {
    revision: registry.status.revision,
    stale: registry.status.stale,
    guidance: snapshot.skills.map((skill) => ({
      name: skill.name,
      content: skill.files.find((file) => file.path === "SKILL.md")?.text ?? "",
    })).filter((skill) => skill.content.length > 0),
  };
}`}
        />
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/cookbook/jev-generative-ui/prepared-controls.tsx" />
      </Panel>
    </>
  );
}
