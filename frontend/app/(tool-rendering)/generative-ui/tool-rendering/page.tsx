"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/generative-ui/tool-rendering (both snippets verbatim)
import { useRenderTool } from "@copilotkit/react-core/v2"; // [!code highlight]
import { useDefaultRenderTool } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotChat } from "@copilotkit/react-core/v2"; // HARNESS
import { z } from "zod";
// ...

const weatherParams = z.object({
  location: z.string().describe("The location to get weather for"),
});

const YourMainContent = () => {
  // ...
  // [!code highlight:14]
  useRenderTool({
    name: "get_weather",
    parameters: weatherParams,
    render: ({ status, parameters }) => {
      return (
        <p className="text-gray-500 mt-2">
          {status !== "complete" && "Calling weather API..."}
          {status === "complete" && `Called the weather API for ${parameters.location}.`}
        </p>
      );
    },
  });
  // ...
  // [!code highlight:15]
  useDefaultRenderTool({
    render: ({ name, args, status, result }) => {
      return (
        <div style={{ color: "black" }}>
          <span>
            {status === "complete" ? "✓" : "⏳"}
            {name}
          </span>
          {status === "complete" && result && (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      );
    },
  });
  return <div style={{ height: "100vh" }}><CopilotChat /></div>; // HARNESS
}

export default YourMainContent; // HARNESS
