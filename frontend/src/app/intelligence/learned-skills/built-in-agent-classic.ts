// Skill delivery, "BuiltInAgent": the page's classic-mode snippet, verbatim.
// NOTHING IMPORTS THIS FILE, on purpose.
//
// The 2026-09-21 sync added a BuiltInAgent row to the adapter table, and unlike
// the five other rows its package is `@copilotkit/runtime/v2`, the package
// this repo already installs. So this is the one adapter on the page that can
// be tried here.
//
// RESOLVED AT 1.73.3; FAILED AT 1.71.0. On the previously installed 1.71.0
// (declared ^1.69.0) it did not compile:
//
//   tsc   src/app/intelligence/learned-skills/built-in-agent-classic.ts(6,3):
//         error TS2353: Object literal may only specify known properties, and
//         'learnedSkills' does not exist in type 'BuiltInAgentConfiguration'.
//
// `learnedSkills` is on no BuiltInAgent config in 1.71.0 or 1.72.0. It first
// ships in 1.73.0 (published 2026-09-19). Since the 2026-09-23 upgrade this
// repo declares ^1.73.3 and installs 1.73.3, where it compiles, so the
// `@ts-expect-error` that acknowledged the error is gone (tsc flagged it as
// unused). The page still names no minimum version for this row, while it
// states exact ranges for every framework adapter below it.
//
// The 2026-09-23 sync made the revision pin live: `revision:
// "exact-revision-id"` used to be commented out and is now an active line. It
// is a placeholder, and the page's own "Make sure delivery works" section says
// to remove it. Copied verbatim anyway; nothing runs this file.

/* eslint-disable @typescript-eslint/no-unused-vars -- the page's snippet binds `agent` and stops there. */

// [1] learned-skills: BuiltInAgent, classic mode
import { BuiltInAgent } from "@copilotkit/runtime/v2";

const agent = new BuiltInAgent({
  model: "openai/gpt-4o",
  prompt: "Follow the application's support policy.",
  learnedSkills: {
    // Set these here, or omit them to use environment variables (linked above).
    containerId: "support-learning",
    revision: "exact-revision-id", // Optional: pin a published revision.
  },
});
