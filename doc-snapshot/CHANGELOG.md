# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-17

### 13:24 UTC — 1 page, highest severity high

**High — Input/Output Schemas** · _local snapshot edit, not an upstream change_

`/deepagents/shared-state/state-inputs-outputs` · route `/shared-state/state-inputs-outputs` · under “Implementations”

5 code lines, 2 headings, 4 prose lines changed.

````diff
- ## Implementations
+ ## Implementation
+ 
+ class AgentState(CopilotKitState):
+ question: str
+ answer: str
+ resources: list[str]
- 
````
