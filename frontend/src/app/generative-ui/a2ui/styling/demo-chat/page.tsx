"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { myCatalog } from "../../dynamic-schema/a2ui/catalog";

const AGENT_ID = "a2ui_dynamic_agent";

/**
 * The Styling page has no agent of its own — it is a CSS file. This drives the
 * dynamic-schema agent so there is a surface to look at, and the theme applies
 * because `src/a2ui/theme.css` is imported at the app root, which is where the
 * page says to import it.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/styling"
      subtitle="theme.css applied · graph: a2ui_dynamic_agent"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-a2ui-dynamic"
        agent={AGENT_ID}
        a2ui={{ catalog: myCatalog }}
      >
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKit>
    </DemoFrame>
  );
}
