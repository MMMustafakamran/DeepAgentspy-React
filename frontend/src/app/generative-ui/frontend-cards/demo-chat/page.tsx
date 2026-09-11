"use client";

import {
  CopilotChat,
  CopilotKit,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { Component, useEffect, useState, type ReactNode } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { DeploymentWatcher } from "../deployment-watcher";
import { eventCardRenderer } from "../event-card";

/**
 * Frontend-Driven Cards.
 *
 * Two tabs, because in this repo the page's code does not run as published.
 *
 * "As published" is step 2's provider, props unchanged: `runtimeUrl=
 * "/api/copilotkit"` and `renderActivityMessages`, nothing else — no `agent`,
 * no `useSingleEndpoint`, no headers. The bare `useAgent()` (in step 3's
 * `DeploymentWatcher` and in the probe) and the bare `<CopilotChat />` then
 * resolve to the agent id `"default"`. This repo's runtime, like the Deep
 * Agents Quickstart's, registers its agents by LangGraph graph id
 * (`sample_agent`, …) and has no `default`, so once `/info` answers,
 * `useAgent()` throws "Agent 'default' not found after runtime sync". The
 * error boundary around that tab is harness code: without it the throw takes
 * the whole route down, and the message is the evidence.
 *
 * "+ Quickstart's agent prop" is the same provider with one prop added —
 * `agent="sample_agent"`, which is what the Deep Agents Quickstart puts on its
 * provider. That is the provider a reader of this integration actually has,
 * and it is the only change the rest of the page needs, so the page's own
 * claims (the card renders; the agent never receives it) are checked there.
 * Not from the page; labelled as such on screen.
 *
 * Inside either provider, three things are added to step 2's `Page`, and none
 * change what the page teaches:
 *
 *   - `<DeploymentWatcher />`, step 3 verbatim. The page never says where it
 *     mounts; under the provider is the only place `useAgent()` works.
 *   - A button that adds the same activity message step 3 adds. Step 3's
 *     trigger is a WebSocket at a placeholder host that never sends anything;
 *     the page names "a button `onClick`" as an equivalent trigger.
 *   - A probe for the page's "What the agent receives" table: the roles in
 *     `agent.messages`, beside the roles in the run request that actually left
 *     the browser. The page says `activity` is in the first and never in the
 *     second. The probe reads the request body itself rather than trusting
 *     the library's own accounting.
 *
 * `?provider=quickstart-agent` opens the second tab directly (for probes).
 */

type Probe = { roles: string[]; at: string } | null;

/** Pulls the message roles out of an outgoing agent-run request body. */
function rolesInRunBody(raw: string): string[] | null {
  try {
    const body = JSON.parse(raw);
    const messages = body?.messages ?? body?.body?.messages ?? body?.params?.messages;
    if (!Array.isArray(messages)) return null;
    return messages.map((m: { role?: string }) => m.role ?? "?");
  } catch {
    return null;
  }
}

function CardControls() {
  const { agent, isReady } = useAgent();
  const { copilotkit } = useCopilotKit();
  const [payload, setPayload] = useState<Probe>(null);

  // Taps every POST this route sends to the runtime, and records the roles in
  // any body that carries a message list — which is exactly the run payload.
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/api/copilotkit") && typeof init?.body === "string") {
        const roles = rolesInRunBody(init.body);
        if (roles) setPayload({ roles, at: new Date().toLocaleTimeString() });
      }
      return original(input, init);
    };
    return () => {
      window.fetch = original;
    };
  }, []);

  function addCard() {
    // Step 3's `addMessage` call, fired from a click instead of a socket.
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "activity",
      activityType: "app-event-card",
      content: {
        title: "Deployment finished",
        detail: `sha ${Math.random().toString(16).slice(2, 9)}`,
      },
    });
  }

  const transcriptRoles = agent.messages.map((m) => m.role);
  const leaked = payload?.roles.includes("activity") ?? false;

  return (
    <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-testid="add-activity-card"
          onClick={addCard}
          className="rounded-md border border-[var(--accent)] px-3 py-1.5 text-sm text-[var(--accent)]"
        >
          Simulate: deployment finished
        </button>
      </div>

      <table className="mt-3 w-full text-left text-xs">
        <tbody className="align-top">
          <tr>
            <th className="w-64 py-1 pr-3 font-medium text-slate-500">
              <code>useAgent()</code> → agent
            </th>
            <td data-testid="agent-state" className="py-1 font-mono">
              {`${agent.agentId ?? "?"} · isReady ${String(isReady)} · runtime ${copilotkit.runtimeConnectionStatus}`}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="w-64 py-1 pr-3 font-medium text-slate-500">
              <code>agent.messages</code> (what the chat renders)
            </th>
            <td data-testid="roles-transcript" className="py-1 font-mono">
              {transcriptRoles.length ? transcriptRoles.join(", ") : "—"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">
              Last run payload (what the agent receives)
            </th>
            <td
              data-testid="roles-payload"
              className={`py-1 font-mono ${
                leaked
                  ? "text-rose-700 dark:text-rose-400"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {payload
                ? `${payload.roles.join(", ")}  (${payload.at})`
                : "no run sent yet"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * Harness code, not the page's. Catches what the published provider's subtree
 * throws and prints it, so the failure is readable on the route instead of
 * replacing it.
 */
class ProviderErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
          Uncaught error
        </p>
        <pre
          data-testid="provider-error"
          className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs text-slate-100"
        >
          {this.state.error.message}
        </pre>
      </div>
    );
  }
}

const PROVIDERS = {
  published: {
    label: "Page code (step 2)",
  },
  "quickstart-agent": {
    label: "Page code (step 2) + agent=\"sample_agent\"",
  },
} as const;
type ProviderKey = keyof typeof PROVIDERS;

function Body() {
  return (
    <>
      <DeploymentWatcher />
      <div className="flex h-full flex-col">
        <CardControls />
        <div className="min-h-0 flex-1">
          <CopilotChat />
        </div>
      </div>
    </>
  );
}

export default function Page() {
  const [provider, setProvider] = useState<ProviderKey>("published");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("provider");
    if (requested === "quickstart-agent") setProvider(requested);
  }, []);

  return (
    <DemoFrame
      parentPath="/generative-ui/frontend-cards"
      subtitle="activity messages"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {(Object.keys(PROVIDERS) as ProviderKey[]).map((key) => (
            <button
              key={key}
              type="button"
              data-testid={`cards-provider-${key}`}
              onClick={() => setProvider(key)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                key === provider
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {PROVIDERS[key].label}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1">
          {provider === "published" ? (
            <ProviderErrorBoundary key="published">
              {/* [2] frontend cards: register the renderer on the provider */}
              <CopilotKit
                runtimeUrl="/api/copilotkit"
                renderActivityMessages={[eventCardRenderer]} // [!code highlight]
              >
                <Body />
              </CopilotKit>
            </ProviderErrorBoundary>
          ) : (
            // Step 2's provider plus the Quickstart's `agent` prop. Not the page's.
            <CopilotKit
              key="quickstart-agent"
              runtimeUrl="/api/copilotkit"
              renderActivityMessages={[eventCardRenderer]}
              agent="sample_agent"
            >
              <Body />
            </CopilotKit>
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
