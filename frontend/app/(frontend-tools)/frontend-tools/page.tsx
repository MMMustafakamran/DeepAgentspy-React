"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/frontend-tools ("Create a frontend tool", verbatim)
import { z } from "zod";
import { useFrontendTool } from "@copilotkit/react-core/v2" // [!code highlight]
import { CopilotChat } from "@copilotkit/react-core/v2"; // HARNESS: the page's "// ..." chat UI

export function Page() {
  // ...

  // [!code highlight:12]
  useFrontendTool({
    name: "sayHello",
    description: "Say hello to the user",
    parameters: z.object({
      name: z.string().describe("The name of the user to say hello to"),
    }),
    handler: async ({ name }) => {
      alert(`Hello, ${name}!`);
      return `Said hello to ${name}!`;
    },
  });

  // ...
  return <div style={{ height: "100vh" }}><CopilotChat /></div>; // HARNESS
}

export default Page; // HARNESS
