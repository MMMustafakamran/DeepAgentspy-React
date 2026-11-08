"use client"; // HARNESS
// https://docs.copilotkit.ai/deepagents/headless-threads (ThreadSidebar.tsx + App.tsx, verbatim)
import { useThreads } from "@copilotkit/react-core/v2"; // [!code highlight]
import { CopilotChat } from "@copilotkit/react-core/v2"; // [!code highlight]
import { useState } from "react";

function ThreadSidebar(_props: { onSelectThread?: (id: string) => void }) { // HARNESS: props type only (the page passes onSelectThread but ThreadSidebar takes no props)
  const { // [!code highlight:6]
    threads,
    isLoading,
    renameThread,
    archiveThread,
    deleteThread,
  } = useThreads({ agentId: "sample_agent" }); // HARNESS: page has "my-agent" (lists nothing)

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {threads.map((thread) => (
        <div key={thread.id}>
          <span>{thread.name ?? "New conversation"}</span>
          <button onClick={() => renameThread(thread.id, "Renamed")}>
            Rename
          </button>
          <button onClick={() => archiveThread(thread.id)}>
            Archive
          </button>
        </div>
      ))}
    </div>
  );
}

function App() {
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>();

  return (
    <div className="flex">
      <ThreadSidebar onSelectThread={setActiveThreadId} />
      <CopilotChat threadId={activeThreadId} /> {/* [!code highlight] */}
    </div>
  );
}

export default App; // HARNESS
