"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/fixed-schema (no frontend code on the page)
import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (<main><h1>Fixed Schema A2UI</h1><CopilotSidebar defaultOpen={true} /></main>);
}
