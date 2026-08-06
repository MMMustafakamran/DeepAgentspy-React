"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { catalog } from "../a2ui/catalog";

const AGENT_ID = "a2ui_fixed_agent";

/**
 * Its own provider, because A2UI is configured per provider: `a2ui={{ catalog }}`
 * registers the component vocabulary the surface will be drawn with, and its
 * `catalogId` has to match the one the agent puts in its `createSurface`
 * operation or the surface renders empty.
 *
 * The matching half is on the runtime, which sets `injectA2UITool: false` for
 * this agent — it owns its own `search_flights` tool and returns the operations
 * container itself, so it must not also be handed a `generate_a2ui` tool. The
 * middleware still detects the container and renders the surface.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/fixed-schema"
      subtitle={`graph: ${AGENT_ID}`}
    >
      <CopilotKit runtimeUrl="/api/copilotkit" agent={AGENT_ID} a2ui={{ catalog }}>
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </CopilotKit>
    </DemoFrame>
  );
}
