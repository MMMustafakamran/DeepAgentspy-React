// Memories & Recall, "React" — the page's `components/memory-list.tsx`,
// verbatim.
//
// Until the 2026-09-21 sync this file imported `useMemories` from
// `@copilotkit/react-core`, which has no such export on 1.69.0 or 1.71.0: the
// hook ships only from `/v2`. That was TS2305 plus a knock-on TS7006, and a
// Turbopack compile error for any route importing it, so the file was kept
// broken and imported by nothing while the demo ran a copy with the path
// corrected.
//
// Upstream has now fixed the import to `@copilotkit/react-core/v2`. The file is
// the page again, it compiles, and the demo imports it directly rather than
// keeping a second copy. The two `@ts-expect-error` lines are gone with the
// errors they acknowledged.

// [1] memories: the page's React component
import { useMemories } from "@copilotkit/react-core/v2";

export function MemoryList() {
  const { memories, isLoading, isAvailable, removeMemory } = useMemories();

  if (!isAvailable) return <p>Memory is not available for this runtime.</p>;
  if (isLoading) return <p>Loading memories…</p>;

  return (
    <ul>
      {memories.map((memory) => (
        <li key={memory.id}>
          {memory.content}
          <button type="button" onClick={() => void removeMemory(memory.id)}>
            Forget
          </button>
        </li>
      ))}
    </ul>
  );
}
