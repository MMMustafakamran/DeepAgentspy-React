"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/dynamic-schema
// The page's frontend step is `<CopilotKit a2ui={{ catalog: myCatalog }}>` — `myCatalog` is never
// defined on the page (it links to "Bring Your Own Catalog"). HARNESS: provider from the Quickstart,
// no custom catalog (the built-in one).
import { CopilotSidebar } from "@copilotkit/react-core/v2";

export default function Page() {
  return (<main><h1>Dynamic Schema A2UI</h1><CopilotSidebar defaultOpen={true} /></main>);
}
