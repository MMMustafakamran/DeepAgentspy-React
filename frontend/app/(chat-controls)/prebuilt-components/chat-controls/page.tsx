"use client"; // HARNESS: the snippets use hooks but have no "use client"
// https://docs.copilotkit.ai/deepagents/prebuilt-components/chat-controls
import { useState } from "react";
import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { useCopilotChatConfiguration } from "@copilotkit/react-core/v2";
import { CopilotChat } from "@copilotkit/react-core/v2";

// HARNESS: `analytics` is used by the feedback snippet but never defined on the page.
const analytics = { track: (...a: unknown[]) => console.log("analytics.track", ...a) };

// ---- "Control the open state from your own UI" (verbatim)
function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <nav>
        <button onClick={() => setChatOpen(true)}>Ask the assistant</button>
      </nav>
      <CopilotSidebar open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}

// ---- "Programmatically open or close the chat" (verbatim)
function OpenChatButton() {
  const config = useCopilotChatConfiguration();

  // setModalOpen is only present when a provider in the tree owns modal state
  // (the prebuilt CopilotPopup / CopilotSidebar create it for you).
  if (!config?.setModalOpen) return null;

  return (
    <button onClick={() => config.setModalOpen(true)}>
      Ask the assistant
    </button>
  );
}

export default function Page() {
  return (
    <main>
      <h1>Open, close, and feedback</h1>
      <Layout />
      <div id="open-chat-button-slot">
        <OpenChatButton />
      </div>
      <h2>Feedback (thumbs)</h2>
      <div style={{ height: 420 }}>
        {/* ---- "Capture message feedback" (verbatim) */}
        <CopilotChat
          messageView={{
            assistantMessage: {
              onThumbsUp: (message) => {
                analytics.track("feedback", { messageId: message.id, value: "up" });
              },
              onThumbsDown: (message) => {
                analytics.track("feedback", { messageId: message.id, value: "down" });
              },
            },
          }}
        />
      </div>
    </main>
  );
}
