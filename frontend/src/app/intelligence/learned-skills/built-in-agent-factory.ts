// Skill delivery, "Factory mode": the page's second BuiltInAgent snippet,
// verbatim. NOTHING IMPORTS THIS FILE, on purpose.
//
// RESOLVED AT 1.73.3; FAILED AT 1.71.0. On the previously installed
// `@copilotkit/runtime` 1.71.0 (declared ^1.69.0) there were three errors, two
// of them the same missing option as classic mode and one of them the
// factory's own argument:
//
//   tsc   built-in-agent-factory.ts(11,3): error TS2353: Object literal may
//         only specify known properties, and 'learnedSkills' does not exist in
//         type 'BuiltInAgentClassicConfig | BuiltInAgentAISDKFactoryConfig'.
//   tsc   built-in-agent-factory.ts(12,35): error TS2339: Property
//         'learnedSkills' does not exist on type 'AgentFactoryContext'.
//
// The page says "Every factory receives a `learnedSkills` object". On 1.71.0
// no factory did. All of it first ships in 1.73.0; since the 2026-09-23
// upgrade this repo declares ^1.73.3 and installs 1.73.3, where the snippet
// compiles, so the `@ts-expect-error` lines are gone (tsc flagged them as
// unused). The page still states no minimum version.
//
// `ai` and `@ai-sdk/openai`, which the snippet imports, are not in this repo's
// `frontend/package.json`. They resolve only because `@copilotkit/runtime`
// depends on them (ai 6.0.244, @ai-sdk/openai 3.0.90 under runtime 1.73.3) and
// npm hoists them. The page lists no install step for either.
//
// Like every snippet on the page since 2026-09-23, it carries a live
// `revision: "exact-revision-id"` placeholder.

/* eslint-disable @typescript-eslint/no-unused-vars -- the page's snippet binds `agent` and stops there. */

// [2] learned-skills: BuiltInAgent, factory mode
import {
  BuiltInAgent,
  convertMessagesToVercelAISDKMessages,
} from "@copilotkit/runtime/v2";
import { openai } from "@ai-sdk/openai";
import { stepCountIs, streamText } from "ai";

const agent = new BuiltInAgent({
  type: "aisdk",
  learnedSkills: {
    // Set these here, or omit them to use environment variables (linked above).
    containerId: "support-learning",
    revision: "exact-revision-id", // Optional: pin a published revision.
  },
  factory: ({ input, abortSignal, learnedSkills }) =>
    streamText({
      model: openai("gpt-4o"),
      system: [
        "Follow the application's support policy.",
        learnedSkills.catalog,
      ].filter(Boolean).join("\n\n"),
      messages: convertMessagesToVercelAISDKMessages(input.messages),
      tools: { ...learnedSkills.tools },
      stopWhen: stepCountIs(10),
      abortSignal,
    }),
});

// NOT FROM A CODE BLOCK. The page's prose instruction, one sentence after the
// snippet above: "Import `BuiltInAgentFactoryContext` from
// `@copilotkit/runtime/v2` to annotate a factory context." Written out here
// because it is the one part of this section a reader is told to type and the
// snippet does not show. RESOLVED AT 1.73.3; FAILED AT 1.71.0, where the
// export did not exist:
//
//   tsc   error TS2724: '"@copilotkit/runtime/v2"' has no exported member
//         named 'BuiltInAgentFactoryContext'. Did you mean
//         'AgentFactoryContext'?
//
// It is exported from 1.73.0 on.
import type { BuiltInAgentFactoryContext } from "@copilotkit/runtime/v2";

export type { BuiltInAgentFactoryContext };
