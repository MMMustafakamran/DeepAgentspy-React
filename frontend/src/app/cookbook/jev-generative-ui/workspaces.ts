/**
 * Jev: fast generative UI — step 1, "Define the state and candidate IDs".
 *
 * Published as `lib/workspaces.ts` in two blocks that the page says go in the
 * same file; both are below, in order, unedited. This is the one file of the
 * recipe that both compiles and runs here, so it is imported for real by
 * `prepared-controls.tsx`.
 *
 * Deviations, all of them locational: the file lives under the route rather
 * than at `lib/workspaces.ts`, because this harness is one app per doc section
 * and a `@/lib` path would collide with the other twenty-two. Nothing in
 * either block changed.
 *
 * Version note the page does not survive: it pins `zod@4.6.5`. This repo has
 * zod 3.25.76 (declared `^3.25.76`). The two blocks happen to be valid on
 * both — `z.object`, `z.enum`, `.nullable()`, `.default()`, `.min()` and
 * `z.infer` all mean the same thing in 3 and 4 — so the schema is shipped
 * unchanged and typechecks. That is luck, not compatibility; see README §9.
 */

import { z } from "zod";

// [1] jev: the catalog, verbatim
export const candidates = [
  { id: "quiet", name: "Quiet room", details: "Enclosed, quiet, one person" },
  { id: "team", name: "Team table", details: "Open, collaborative, six people" },
  { id: "studio", name: "Studio", details: "Enclosed, whiteboard, four people" },
];

// [2] jev: the UI state shape, verbatim
export const PanelSchema = z.object({
  type: z.enum(["clarification", "comparison"]),
  title: z.string(),
  options: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
});
export const StateSchema = z.object({
  panel: PanelSchema.nullable().default(null),
  selectedId: z.string().nullable().default(null),
  note: z.string().default(""),
});
export type PickerState = z.infer<typeof StateSchema>;
export type Guidance = { name: string; content: string }[];
export const clarificationOptions = [
  { id: "focus", label: "Quiet focus time" },
  { id: "collaboration", label: "Working with a team" },
];
