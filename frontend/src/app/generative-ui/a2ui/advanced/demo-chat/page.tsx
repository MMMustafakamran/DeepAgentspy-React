"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { useA2UIProgress } from "@/hooks/use-a2ui-progress";

import { myCatalog } from "../../dynamic-schema/a2ui/catalog";

const AGENT_ID = "a2ui_dynamic_agent";

//#region chat
/**
 * The page's `Chat` component: one hook call, then an ordinary chat.
 *
 * It has to be a child of the provider rather than a sibling —
 * `useRenderTool` registers against the nearest CopilotKit context, so calling
 * `useA2UIProgress` outside the provider below would register it on the app's
 * root provider, which never sees this agent's `render_a2ui` calls.
 */
function Chat() {
  useA2UIProgress();

  return <CopilotChat agentId={AGENT_ID} className="h-full" />;
}
//#endregion

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/advanced"
      subtitle="custom render_a2ui progress · graph: a2ui_dynamic_agent"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-a2ui-dynamic"
        agent={AGENT_ID}
        a2ui={{ catalog: myCatalog }}
      >
        <Chat />
      </CopilotKit>
    </DemoFrame>
  );
}
