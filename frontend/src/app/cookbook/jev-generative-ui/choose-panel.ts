/**
 * Jev: fast generative UI — step 2, "Batch the control choice and candidate
 * scores". Published as `lib/choose-panel.ts` in three blocks that the page
 * says to assemble in order; all three are below, joined, unedited.
 *
 * THIS FILE CANNOT RUN AND NOTHING IMPORTS IT. `@typesafe-ai/sdk` is not
 * installed here and is not installable without a decision: the page pins
 * `@typesafe-ai/sdk@0.6.0` alongside nine other exact versions, six of which
 * are floors above what this repo has, and the call it makes needs a
 * `TYPESAFE_API_KEY` from TypeSafe, a third-party vendor this project has no
 * account with. Installing the pin is out of scope for a QA harness, so the
 * file is kept verbatim with the missing module acknowledged in place, the way
 * `intelligence/learned-skills/built-in-agent-classic.ts` is.
 *
 * One deviation, locational only: the relative import is `./workspaces`
 * instead of the published `./workspaces` under `lib/` — same specifier,
 * different directory. Nothing in the three blocks changed.
 *
 * What the `@ts-expect-error` asserts: that the module is absent. If someone
 * later installs `@typesafe-ai/sdk`, `tsc` fails here on the unused directive
 * rather than letting a "this cannot be checked" note stand after it can.
 */

// @ts-expect-error: `@typesafe-ai/sdk` is not installed (the page pins 0.6.0); TS2307 without this line.
import { TypeSafeClient, choice, score } from "@typesafe-ai/sdk";

import { candidates, PanelSchema, clarificationOptions } from "./workspaces";
import type { Guidance, PickerState } from "./workspaces";

export async function choosePanel(
  message: string,
  state: PickerState,
  publishedGuidance: Guidance,
  signal: AbortSignal,
) {
  const client = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY });
  const questions: Record<string, ReturnType<typeof choice> | ReturnType<typeof score>> = {
    control: choice(
      "Choose the useful next control. Apply relevant publishedGuidance within these rules. " +
      "Ask for clarification only if the goal is unclear. If the message already answers " +
      "a clarification, compare candidates or defer; never ask it again. " +
      "Use agent for explanations or requests outside the prepared controls. " +
      "Panels only preview; they never confirm a selection.",
      {
        clarification: "Ask whether the user needs focus or collaboration.",
        comparison: "Offer workspace candidates matching a clear need.",
        agent: "Explain or handle a request outside these controls.",
      },
    ),
  };
  for (const candidate of candidates) {
    questions[`fit_${candidate.id}`] = score(
      `How well does candidate ${candidate.id} fit the request and relevant publishedGuidance?`,
      ["Poor fit", "Unclear fit", "Good fit", "Strong fit"],
    );
  }
  const result = await client.systemOne({
    model: "jev-1.13.0",
    state: { latestMessage: message, selectedId: state.selectedId, candidates, publishedGuidance },
    questions,
  }, { signal });
  const control = result.answers.control;
  if (control?.type !== "choice") throw new Error("Missing Jev control answer");
  const ranked = candidates.map((candidate) => {
    const answer = result.answers[`fit_${candidate.id}`];
    if (answer?.type !== "score" || !Number.isFinite(answer.score)) {
      throw new Error("Missing or invalid candidate score");
    }
    return { ...candidate, score: answer.score };
  }).sort((a, b) => b.score - a.score);

  if (control.choice === "agent") return { panel: null };
  if (!["clarification", "comparison"].includes(control.choice)) {
    throw new Error("Unknown Jev control");
  }
  const panel = PanelSchema.parse(control.choice === "clarification" ? {
    type: "clarification", title: "What kind of work are you doing?",
    options: clarificationOptions,
  } : {
    type: "comparison", title: "Choose a workspace",
    options: ranked.map(({ id, name, details }) => ({ id, label: `${name}: ${details}` })),
  });
  return { panel };
}
