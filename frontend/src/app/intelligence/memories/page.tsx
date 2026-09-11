import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const TSC_OUTPUT = `$ tsc --noEmit        # memory-list.tsx with the @ts-expect-error lines removed
src/app/intelligence/memories/memory-list.tsx: error TS2305:
  Module '"@copilotkit/react-core"' has no exported member 'useMemories'.
src/app/intelligence/memories/memory-list.tsx: error TS7006:
  Parameter 'memory' implicitly has an 'any' type.`;

const PROBE = `As documented   /api/copilotkit — the Quickstart runtime, SSE mode, no intelligence in /info
                (no memory request is sent by the browser at all)
                useMemories(): isAvailable TRUE · isLoading false · memories 0 · realtimeStatus "connecting"
                MemoryList renders an empty <ul>, not "Memory is not available for this runtime."
                Save → "Runtime URL is not configured"   (client-side; the runtime URL is set)
                curl GET/POST /api/copilotkit/memories  → 404 {"error":"Not found"}

memory.access   /api/copilotkit-memory — no CPK_INTELLIGENCE_API_KEY in this harness
                GET /info → 503 · POST (single-route fallback) → 503
                useMemories(): isAvailable TRUE · list empty · save → "Runtime URL is not configured"

Chat            "Please remember that I prefer concise status updates." → "Got it! I'll keep updates brief."`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/intelligence/memories" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Long-term memory: short statements about a user or project that
          outlive any one thread and are recalled into later ones. The page
          explains the model (three kinds, two scopes, supersede-not-patch,
          retire-not-delete), how access is entitled, and how to read and write
          memories from React, REST and MCP. This route runs its React half
          against this repo&apos;s Quickstart runtime and against a second mount
          with the option the page leaves out.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Please remember that I prefer concise status updates."]}
            expect="Per the page: the list shows this user's memories, and Save adds one."
            fail="What actually happens — see below: the list is silently empty, Save fails with “Runtime URL is not configured”, and the agent claims it will remember anyway."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The React snippet imports a hook that is not there">
        <code>import {"{ useMemories }"} from &quot;@copilotkit/react-core&quot;</code>{" "}
        — the package root is the v1 surface and has no such export, on the
        lockfile&apos;s 1.69.0 or CI&apos;s 1.71.0. It ships only from{" "}
        <code>@copilotkit/react-core/v2</code>. Under Next 16 a missing named
        export is a Turbopack compile error, so a route that imports the file
        does not build at all. The verbatim file is kept, errors acknowledged,
        and imported by nothing; the demo runs the same component with the
        import moved to <code>/v2</code>.
        <pre className="mt-3 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {TSC_OUTPUT}
        </pre>
      </Callout>

      <Callout tone="warn" title="On the Quickstart runtime, memory fails without looking like a failure">
        The page reads <code>isAvailable: false</code> as &quot;not
        entitled&quot;. The Deep Agents Quickstart&apos;s runtime is not an
        Intelligence runtime, so its <code>/info</code> advertises no
        Intelligence socket, and on react-core 1.71.0 the client memory store
        only gets a context when it does. So the hook never makes a request and
        never flips <code>isAvailable</code>: it reports <code>true</code>, the
        page&apos;s <code>MemoryList</code> renders an empty list, and a save
        fails with &quot;Runtime URL is not configured&quot; — about a runtime
        URL that is configured. A reader sees &quot;no memories yet&quot;, not
        &quot;memory is not available&quot;. The page never says memory needs
        an Intelligence runtime at all.
      </Callout>

      <Callout tone="warn" title="…and even an Intelligence runtime hides the routes by default">
        Every <code>/memories/*</code> route 404s at the runtime unless{" "}
        <code>CopilotRuntime</code> is built with <code>memory: {"{ access }"}</code>{" "}
        (or the deprecated <code>exposeMemoryRoutes: true</code>) — a
        &quot;secure default&quot; per the runtime&apos;s own typings, present on
        1.69.0 and 1.71.0 alike. The page never mentions either. The second
        runtime on the demo adds it, but the typings accept it only on an
        Intelligence runtime, which needs <code>CPK_INTELLIGENCE_API_KEY</code>.
        This harness has none, so that mount answers 503 and the platform side
        — entitlement, what an unentitled project gets back — was not reached
        here.
      </Callout>

      <Callout tone="warn" title="Smaller gaps">
        <code>realtimeStatus</code> stayed <code>connecting</code> on both
        runtimes and never reached the <code>unavailable</code> the page
        describes. The page shows reading and forgetting from React but never
        saving, though the hook has <code>addMemory</code>; saving is shown only
        over REST and MCP. The REST examples post to{" "}
        <code>https://your-deployment</code> without saying that managed users
        call <code>api.intelligence.copilotkit.ai</code>. And the agent in the
        take answers &quot;Got it! I&apos;ll keep updates brief.&quot; — it has
        no memory tools here, and nothing tells the user nothing was saved.
      </Callout>

      <Panel title="What the demo observed (1.71.0)">
        <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
          {PROBE}
        </pre>
      </Panel>

      <Panel title="Source">
        <SourceCode file="frontend/src/app/intelligence/memories/memory-list.tsx" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/api/copilotkit-memory/[[...slug]]/route.ts" />
        </div>
        <div className="mt-4">
          <SourceCode file="frontend/src/app/intelligence/memories/demo-chat/page.tsx" />
        </div>
      </Panel>
    </>
  );
}
