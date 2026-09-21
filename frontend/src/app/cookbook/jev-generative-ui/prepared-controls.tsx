"use client";

import { useState } from "react";

import { readAction } from "./read-action";
import {
  PanelSchema,
  StateSchema,
  candidates,
  clarificationOptions,
  type PickerState,
} from "./workspaces";

/**
 * The half of the recipe that runs: the prepared controls, their schemas, and
 * the two message formats the application owns.
 *
 * Jev is not here and is not simulated. The recipe's decision layer answers
 * two questions — which control to show, and how well each room fits — and
 * both need `@typesafe-ai/sdk` and a TypeSafe key. So the panel is chosen with
 * the two buttons at the top instead, by a person, and the fact that it was is
 * printed on screen. What is real below:
 *
 *   - `PanelSchema` and `StateSchema`, the page's own, parsing every panel and
 *     every state transition before it renders;
 *   - the clarification panel exactly as `choosePanel` builds it. That branch
 *     reads no Jev output at all: the page constructs it from the constant
 *     `clarificationOptions` and a fixed title;
 *   - the comparison panel as `choosePanel` builds it, with one thing missing
 *     and said so: the page maps `ranked`, which is `candidates` sorted by the
 *     Jev fit scores. With no scores there is no ranking, so this is catalog
 *     order, labelled as such;
 *   - `readAction`, verbatim, on every click. The message strings, the
 *     rewritten clarification request and the `selectedId`/`note` transition
 *     are its real return values, not a mock-up.
 *
 * The one thing this demonstrates about the recipe's own claim is worth
 * stating: the page says "Jev controls the order of the options; your catalog
 * controls which rooms exist". Everything on this panel except that order is
 * the application's, which is why it renders without the vendor at all.
 */

type PanelKind = "clarification" | "comparison";

/** Exactly the two `PanelSchema.parse(...)` arguments in `choosePanel`. */
function buildPanel(kind: PanelKind) {
  return PanelSchema.parse(
    kind === "clarification"
      ? {
          type: "clarification",
          title: "What kind of work are you doing?",
          options: clarificationOptions,
        }
      : {
          type: "comparison",
          title: "Choose a workspace",
          // `choosePanel` maps `ranked` here. `ranked` is this list sorted by
          // the Jev fit scores, which are absent, so this is catalog order.
          options: candidates.map(({ id, name, details }) => ({
            id,
            label: `${name}: ${details}`,
          })),
        },
  );
}

const EMPTY: PickerState = StateSchema.parse({});

export function PreparedControls() {
  const [state, setState] = useState<PickerState>(EMPTY);
  const [sent, setSent] = useState<string | null>(null);
  const [rewritten, setRewritten] = useState<string | null>(null);

  function show(kind: PanelKind) {
    setSent(null);
    setRewritten(null);
    setState(StateSchema.parse({ ...state, panel: buildPanel(kind) }));
  }

  /** Step 4's `onClick`, then step 3's `readAction` on what it sends. */
  function press(optionId: string) {
    const content =
      state.panel?.type === "clarification"
        ? `Clarification answer: ${optionId}`
        : `Select workspace: ${optionId}`;
    setSent(content);

    const result = readAction(content, state);
    if (result.selection) {
      // A room selection updates state directly, with no Jev turn.
      setState(StateSchema.parse(result.selection));
      setRewritten(null);
    } else {
      // A clarification answer becomes a more specific request for Jev. There
      // is no Jev, so the rewritten request is where this stops.
      setRewritten(result.message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Panel (Jev&apos;s choice, made by hand)
        </span>
        {(["clarification", "comparison"] as PanelKind[]).map((kind) => (
          <button
            key={kind}
            type="button"
            data-testid={`jev-panel-${kind}`}
            onClick={() => show(kind)}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              state.panel?.type === kind
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {kind}
          </button>
        ))}
      </div>

      {state.panel && (
        <section
          aria-label={state.panel.title}
          className="rounded-lg border border-slate-300 p-4 dark:border-slate-700"
        >
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {state.panel.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {state.panel.options.map((option) => (
              <button
                key={option.id}
                type="button"
                data-testid={`jev-option-${option.id}`}
                onClick={() => press(option.id)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                {option.label}
              </button>
            ))}
          </div>
          {state.panel.type === "comparison" && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-400">
              Catalog order. The page ranks these by Jev&apos;s per-room fit
              score, and there is no score here.
            </p>
          )}
        </section>
      )}

      <table className="w-full text-left text-xs">
        <tbody className="align-top">
          <tr>
            <th className="w-64 py-1 pr-3 font-medium text-slate-500">
              Message the button sent
            </th>
            <td data-testid="jev-sent" className="py-1 break-all font-mono">
              {sent ?? "—"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">
              <code>readAction</code> rewrote it to
            </th>
            <td data-testid="jev-rewritten" className="py-1 break-all font-mono">
              {rewritten ?? "not rewritten (or not a clarification answer)"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">
              <code>selectedId</code>
            </th>
            <td data-testid="jev-selected" className="py-1 font-mono">
              {state.selectedId ?? "None"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">
              <code>note</code>
            </th>
            <td data-testid="jev-note" className="py-1 font-mono">
              {state.note || "—"}
            </td>
          </tr>
          <tr className="border-t border-slate-200 dark:border-slate-800">
            <th className="py-1 pr-3 font-medium text-slate-500">
              Next turn, if Jev were reachable
            </th>
            <td className="py-1 text-slate-500">
              {rewritten
                ? "choosePanel(rewritten, state, [], signal) → @typesafe-ai/sdk, not installed. Stops here."
                : "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
