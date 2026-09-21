"use client";

/**
 * Markdown Rendering, "Custom tags are not supported" — the compile half of the
 * page's claim, as something that runs.
 *
 * The page says a custom key is a compile error and prints the message it
 * expects:
 *
 *   error TS2353: Object literal may only specify known properties,
 *   and '"reference-chip"' does not exist in type 'Components'.
 *
 * That is exactly what `tsc` emits here, on streamdown 1.6.11 and
 * @copilotkit/react-core 1.71.0. So the key goes in with `@ts-expect-error`
 * above it: the directive is the assertion. If a later Streamdown widens
 * `Components` and the key stops erroring, `tsc` fails on the unused directive
 * rather than quietly agreeing with a page that is no longer true.
 *
 * One thing the page does not print: the same line also raises
 * `error TS7031: Binding element 'children' implicitly has an 'any' type`,
 * because an unknown key carries no contextual type for the component's props.
 * Both errors sit on the same line, so the one directive covers both.
 *
 * NOTHING IMPORTS THIS FILE, on purpose. The runtime half of the same claim —
 * an unknown tag stripped with its text kept — is checked on the demo instead,
 * by asking the agent to write a `<reference-chip>` into its reply.
 */

import { CopilotChat } from "@copilotkit/react-core/v2";

export function CustomTag() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: {
          markdownRenderer: {
            components: {
              // @ts-expect-error: the page's own claim. TS2353 on streamdown 1.6.11 — `Components` is keyed by `keyof JSX.IntrinsicElements`.
              "reference-chip": ({ children }) => <span>{children}</span>,
            },
          },
        },
      }}
    />
  );
}
