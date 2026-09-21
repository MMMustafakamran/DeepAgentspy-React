// Automatic learned skill delivery, "Factory mode": the page's second
// BuiltInAgent snippet, verbatim. NOTHING IMPORTS THIS FILE, on purpose.
//
// Three errors on the installed `@copilotkit/runtime` 1.71.0, two of them the
// same missing option as classic mode and one of them the factory's own
// argument:
//
//   tsc   built-in-agent-factory.ts(11,3): error TS2353: Object literal may
//         only specify known properties, and 'learnedSkills' does not exist in
//         type 'BuiltInAgentClassicConfig | BuiltInAgentAISDKFactoryConfig'.
//   tsc   built-in-agent-factory.ts(12,35): error TS2339: Property
//         'learnedSkills' does not exist on type 'AgentFactoryContext'.
//
// The page says "Every factory receives a `learnedSkills` object". On this
// version no factory does: `AgentFactoryContext` carries no such property, so
// `learnedSkills.catalog` and `learnedSkills.tools` have nothing to read.
//
// `ai` and `@ai-sdk/openai`, which the snippet imports, are not in this repo's
// `frontend/package.json`. They resolve only because `@copilotkit/runtime`
// depends on them (ai 6.0.244, @ai-sdk/openai 3.0.90) and npm hoists them. The
// page lists no install step for either.
//
// Kept verbatim with the errors acknowledged in place.

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
  // @ts-expect-error: the page's option. TS2353 on 1.71.0: the config union has no `learnedSkills`.
  learnedSkills: { containerId: "support-learning" },
  // @ts-expect-error: the page's factory argument. TS2339 on 1.71.0: `AgentFactoryContext` has no `learnedSkills`.
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
// snippet does not show. The export does not exist on 1.71.0:
//
//   tsc   error TS2724: '"@copilotkit/runtime/v2"' has no exported member
//         named 'BuiltInAgentFactoryContext'. Did you mean
//         'AgentFactoryContext'?
//
// `AgentFactoryContext`, the name tsc suggests, is exported, and is the type
// the installed `factory` argument actually has.
// @ts-expect-error: the page's prose; TS2724, no such export on 1.71.0.
import type { BuiltInAgentFactoryContext } from "@copilotkit/runtime/v2";

export type { BuiltInAgentFactoryContext };
