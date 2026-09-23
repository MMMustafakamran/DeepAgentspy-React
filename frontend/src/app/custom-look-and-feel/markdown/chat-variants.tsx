"use client";

/**
 * Markdown Rendering — all three of the page's techniques, each block verbatim.
 *
 * Two things are added to every block and nothing is removed. Both are written
 * up in FINDINGS.md as well as here.
 *
 * 1. `"use client"` on line 1. Each published block is a `page.tsx` under the
 *    App Router that passes inline arrow functions as props to `<CopilotChat>`.
 *    Without the directive the file is a Server Component and Next refuses the
 *    render ("Functions cannot be passed directly to Client Components"). The
 *    page shows no directive on any of its three blocks.
 *
 * 2. `agentId="sample_agent"`, added on a *copy* of each block rather than on
 *    the block itself. The published `<CopilotChat>` carries no agent id, so it
 *    resolves to `"default"`, which a Deep Agents runtime does not register —
 *    the same defect already filed against Frontend-Driven Cards (FINDINGS.md
 *    #22). `Chat` below is the published block untouched and is what the demo's
 *    first tab mounts, so the throw is on camera; the three `…WithAgent`
 *    copies below it are the same code plus that one prop, which is what makes
 *    the rest of the page checkable at all.
 *
 * Published, "Restyle individual HTML tags":
 *
 *   import { CopilotChat } from "@copilotkit/react-core/v2";
 *
 *   export function Chat() {
 *     return (
 *       <CopilotChat
 *         messageView={{
 *           assistantMessage: {
 *             markdownRenderer: {
 *               components: {
 *                 a: ({ node, children, ...props }) => (
 *                   <a {...props} className="my-link">
 *                     {children}
 *                   </a>
 *                 ),
 *                 h2: ({ node, children, ...props }) => (
 *                   <h2 {...props} className="my-heading">
 *                     {children}
 *                   </h2>
 *                 ),
 *               },
 *             },
 *           },
 *         }}
 *       />
 *     );
 *   }
 *
 * Published, "Restyle the whole markdown block":
 *
 *   <CopilotChat
 *     messageView={{
 *       assistantMessage: { markdownRenderer: "text-sm leading-7" },
 *     }}
 *   />
 *
 * Published, "Replace the renderer":
 *
 *   const PlainText = ({ content }: { content: string }) => (
 *     <pre className="whitespace-pre-wrap">{content}</pre>
 *   );
 *
 *   <CopilotChat
 *     messageView={{ assistantMessage: { markdownRenderer: PlainText } }}
 *   />;
 */

import { CopilotChat } from "@copilotkit/react-core/v2";

/** The graph this harness drives. Not from the page; see note 2 above. */
const AGENT_ID = "sample_agent";

// [1] markdown: Restyle individual HTML tags — published block, verbatim.
export function Chat() {
  return (
    <CopilotChat
      messageView={{
        assistantMessage: {
          markdownRenderer: {
            components: {
              a: ({ node, children, ...props }) => ( // [!code highlight]
                <a {...props} className="my-link">
                  {children}
                </a>
              ),
              h2: ({ node, children, ...props }) => (
                <h2 {...props} className="my-heading">
                  {children}
                </h2>
              ),
            },
          },
        },
      }}
    />
  );
}

/** `Chat` plus `agentId`. The one prop the page never mentions. */
export function ChatComponentsWithAgent() {
  return (
    <CopilotChat
      agentId={AGENT_ID}
      messageView={{
        assistantMessage: {
          markdownRenderer: {
            components: {
              a: ({ node, children, ...props }) => (
                <a {...props} className="my-link">
                  {children}
                </a>
              ),
              h2: ({ node, children, ...props }) => (
                <h2 {...props} className="my-heading">
                  {children}
                </h2>
              ),
            },
          },
        },
      }}
    />
  );
}

// [2] markdown: Restyle the whole markdown block — published block, plus agentId.
export function ChatClassStringWithAgent() {
  return (
    <CopilotChat
      agentId={AGENT_ID}
      messageView={{
        assistantMessage: { markdownRenderer: "text-sm leading-7" }, // [!code highlight]
      }}
    />
  );
}

// [3] markdown: Replace the renderer — published block, plus agentId.
const PlainText = ({ content }: { content: string }) => (
  <pre className="whitespace-pre-wrap">{content}</pre>
);

export function ChatPlainTextWithAgent() {
  return (
    <CopilotChat
      agentId={AGENT_ID}
      messageView={{ assistantMessage: { markdownRenderer: PlainText } }}
    />
  );
}

/**
 * Harness baseline, not from the page: the same chat with no override at all.
 * The "you are replacing, not extending" claim is only readable against it —
 * it is the tab where `data-streamdown` and Streamdown's own classes are still
 * on the anchor.
 */
export function ChatDefaultWithAgent() {
  return <CopilotChat agentId={AGENT_ID} />;
}
