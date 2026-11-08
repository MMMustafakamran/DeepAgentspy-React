"use client";
// HARNESS: mounts the page's OrderSearch inside the Quickstart provider, plus the Quickstart chat.
import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { OrderSearch } from "./OrderSearch";
export default function Page() {
  return (<main><h1>WebMCP</h1><OrderSearch /><CopilotSidebar defaultOpen={true} /></main>);
}
