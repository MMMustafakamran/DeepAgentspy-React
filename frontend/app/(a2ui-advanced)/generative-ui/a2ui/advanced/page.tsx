// Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced (src/app/page.tsx)
"use client";

import { useA2UIProgress } from "../../../hooks/use-a2ui-progress"; // HARNESS: "@/hooks/use-a2ui-progress"
import { CopilotChat } from "@copilotkit/react-core/v2"; // HARNESS: the page uses CopilotChat without importing it

function Chat() {
  useA2UIProgress();
  return <CopilotChat className="flex-1" />;
}

export default function Page() { // HARNESS
  return <div style={{ height: "100vh", display: "flex" }}><Chat /></div>;
}
