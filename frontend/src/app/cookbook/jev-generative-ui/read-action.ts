/**
 * Jev: fast generative UI — step 3's `readAction` block, verbatim, on its own
 * so it can actually run.
 *
 * DECLARED DEVIATION: this is a second copy. The published block lives inside
 * `lib/picker-agent.ts`, and that file is kept whole a directory away, exactly
 * as published. It cannot be imported at runtime, because two *other*
 * functions in it need `@typesafe-ai/sdk` and `@langchain/openai`, neither of
 * which is installed. `readAction` itself needs nothing but the catalog, so
 * copying it out is what makes the one genuinely runnable part of the recipe
 * runnable here. Nothing in the block below changed, including the `export`
 * that the published module-local version does not have.
 *
 * Two copies of a published block is worse than one, so: if the page's version
 * changes, both change. `picker-agent.ts` is the record of what was published;
 * this is the copy under test. See README §9.
 */

import { candidates, clarificationOptions, type PickerState } from "./workspaces";

// [1] jev: readAction, verbatim (plus `export`)
export function readAction(message: string, state: PickerState) {
  if (message.startsWith("Select workspace: ")) {
    const id = message.slice("Select workspace: ".length);
    const selected = candidates.find((c) => c.id === id);
    if (!selected) throw new Error("Unknown workspace selection");
    return { message, selection: {
      ...state, selectedId: id, note: `Selected ${selected.name}. No booking was made.`,
    } };
  }
  if (message.startsWith("Clarification answer: ")) {
    const id = message.slice("Clarification answer: ".length);
    const answer = clarificationOptions.find((o) => o.id === id);
    if (!answer) throw new Error("Unknown clarification answer");
    message = `I answered the workspace clarification: ${answer.label}. Show matching workspaces.`;
  }
  return { message, selection: null };
}
