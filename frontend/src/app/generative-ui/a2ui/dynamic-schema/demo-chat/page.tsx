"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { myCatalog } from "../a2ui/catalog";

const AGENT_ID = "a2ui_dynamic_agent";

/**
 * One prop — `a2ui={{ catalog: myCatalog }}` — is the entire frontend setup.
 *
 * The provider registers the catalog, wires the built-in A2UI activity-message
 * renderer, and turns tool injection on, which is what puts `generate_a2ui` in
 * front of the agent. That last part is why this route needs its own runtime
 * endpoint: /api/copilotkit turns injection off for the fixed-schema agent, and
 * the setting is per runtime.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/dynamic-schema"
      subtitle={`graph: ${AGENT_ID}`}
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
