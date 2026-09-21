/**
 * Jev: fast generative UI — step 4, blocks two, three and four. Published as
 * `app/page.tsx` in three parts the page says to build "in order"; joined
 * below, unedited.
 *
 * NOTHING IMPORTS THIS FILE, and it is deliberately not named `page.tsx`: as
 * published it is the app's index route, and `useAgent({ agentId: "picker" })`
 * needs the runtime from `runtime-route.ts`, which needs `PickerAgent`, which
 * needs `@typesafe-ai/sdk` and a TypeSafe key. Mounted here it would render a
 * form whose every submit throws "Agent 'picker' not found after runtime
 * sync", which is a broken page pretending to be a feature. The half of it
 * that does work without any of that — the prepared controls and the two
 * message formats — is mounted for real in `prepared-controls.tsx`.
 *
 * One deviation, locational only: `./workspaces` instead of the published
 * `@/lib/workspaces`.
 *
 * It typechecks against @copilotkit/react-core 1.71.0 (the page pins 1.73.0),
 * so nothing in this block needs the pinned floor either.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { CopilotKitProvider, useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { StateSchema } from "./workspaces";

export default function Page() {
  return <CopilotKitProvider runtimeUrl="/api/copilotkit"><Picker /></CopilotKitProvider>;
}

function Picker() {
  const { agent, isReady } = useAgent({ agentId: "picker" });
  const { copilotkit } = useCopilotKit();
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sending = useRef(false);
  const parsed = StateSchema.safeParse(agent.state);
  const state = parsed.success ? parsed.data : StateSchema.parse({});
  const busy = pending || agent.isRunning;

  useEffect(() => {
    if (!isReady) return;
    const subscription = agent.subscribe({ onRunErrorEvent: ({ event }) => setError(event.message) });
    return () => subscription.unsubscribe();
  }, [agent, isReady]);

  async function send(content: string) {
    if (!isReady || sending.current || agent.isRunning || !content.trim()) return;
    sending.current = true;
    setPending(true);
    setError(null);
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content });
    try { await copilotkit.runAgent({ agent }); }
    catch { setError("The request failed. Try again."); }
    finally { sending.current = false; setPending(false); }
  }

  return <main>
    <h1>Find a workspace</h1>
    <form onSubmit={(event) => { event.preventDefault(); void send(text); }}>
      <label htmlFor="request">What do you need?</label>
      <input id="request" value={text} onChange={(event) => setText(event.target.value)} />
      <button disabled={!isReady || busy}>Find options</button>
    </form>
    {busy && <button onClick={() => agent.abortRun()}>Cancel</button>}
    {error && <p role="alert">{error}</p>}
    <p aria-live="polite">{state.note}</p>
    <p>Selected workspace: {state.selectedId ?? "None"}</p>
    {state.panel && <section aria-label={state.panel.title}>
      <h2>{state.panel.title}</h2>
      {state.panel.options.map((option) => <button key={option.id} disabled={busy || !isReady}
        onClick={() => void send(state.panel?.type === "clarification"
          ? `Clarification answer: ${option.id}` : `Select workspace: ${option.id}`)}>
        {option.label}
      </button>)}
    </section>}
  </main>;
}
