// Automatic learned skill delivery, "BuiltInAgent": the page's classic-mode
// snippet, verbatim. NOTHING IMPORTS THIS FILE, on purpose.
//
// The 2026-09-21 sync added a BuiltInAgent row to the adapter table, and unlike
// the five other rows its package is `@copilotkit/runtime/v2`, the package
// this repo already installs. So this is the one adapter on the page that can
// be tried here. It does not compile:
//
//   tsc   src/app/intelligence/learned-skills/built-in-agent-classic.ts(6,3):
//         error TS2353: Object literal may only specify known properties, and
//         'learnedSkills' does not exist in type 'BuiltInAgentConfiguration'.
//
// `learnedSkills` is on no BuiltInAgent config in the installed 1.71.0, nor in
// 1.72.0. It first ships in 1.73.0 (published 2026-09-19); the page names no
// version floor for this row, while it states exact ranges for every framework
// adapter below it.
//
// Kept verbatim with the error acknowledged in place, so the file stays the
// evidence and the repo still typechecks.

/* eslint-disable @typescript-eslint/no-unused-vars -- the page's snippet binds `agent` and stops there. */

// [1] learned-skills: BuiltInAgent, classic mode
import { BuiltInAgent } from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "openai/gpt-4o",
  prompt: "Follow the application's support policy.",
  // @ts-expect-error: the page's option. TS2353 on 1.71.0: no BuiltInAgent config has `learnedSkills`.
  learnedSkills: {
    containerId: "support-learning",
    // revision: "exact-revision-id", // Optional: pin a published revision.
  },
});
