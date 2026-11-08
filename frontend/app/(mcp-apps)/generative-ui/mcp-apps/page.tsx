"use client";
// HARNESS: the page has no frontend code ("No changes to your agent code or frontend are needed");
// this is the Quickstart's chat.
import { CopilotSidebar } from "@copilotkit/react-core/v2";
export default function Page() {
  return (<main><h1>MCP Apps</h1><CopilotSidebar defaultOpen={true} /></main>);
}
