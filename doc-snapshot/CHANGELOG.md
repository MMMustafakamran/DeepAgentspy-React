# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-25

### 06:23 UTC — 2 pages, highest severity high

**High — State Rendering**

`/deepagents/generative-ui/state-rendering` · route `/generative-ui/state-rendering` · under “Define your agent state”

51 code lines, 2 headings, 4 prose lines changed. The number of fenced code blocks changed.

````diff
- ### Define your agent state
+ ### Build an agent that produces state
- Add properties to your agent state that you want to render in the UI.
+ Define the `searches` state, then add a tool that returns each completed update.
- from copilotkit import CopilotKitState
+ from typing import Any, TypedDict
+ from copilotkit import (
+ CopilotKitMiddleware,
````

**High — Quickstart**

`/deepagents/quickstart` · route `/quickstart` · under “Setup Copilot Runtime” · in a `tsx` block

56 code lines, 1 heading, 11 prose lines changed.

````diff
- ```tsx title="app/api/copilotkit/route.ts"
+ ```tsx title="app/api/copilotkit/[[...slug]]/route.ts" doctest="component"
- CopilotRuntime,
- ExperimentalEmptyAdapter,
- copilotRuntimeNextJSAppRouterEndpoint,
- } from "@copilotkit/runtime";
+ CopilotRuntime,
+ createCopilotRuntimeHandler,
````

---

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
