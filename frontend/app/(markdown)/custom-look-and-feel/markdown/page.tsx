"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown ("Restyle individual HTML tags", verbatim)
import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return (
    <CopilotChat
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

export default function Page() { // HARNESS: route wrapper
  return <div style={{ height: "100vh" }}><Chat /></div>;
}
