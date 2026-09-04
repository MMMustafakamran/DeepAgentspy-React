# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-04

### 08:09 UTC — 1 page, highest severity high

**High — Quickstart**

`/deepagents/quickstart` · route `/quickstart` · under “Setup Copilot Runtime” · in a `tsx` block

6 code lines, 4 prose lines changed.

````diff
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- apiKey: process.env.INTELLIGENCE_API_KEY!,
+ apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
- The runtime reads the license key from step 1. Add it to the app that serves
+ The runtime reads the project API key from step 1. Add it to the app that serves
- INTELLIGENCE_API_KEY=your_license_key
+ CPK_INTELLIGENCE_API_KEY=cpk-...
````

---

## 2026-08-30

### 13:45 UTC — 3 pages, highest severity high

**High — Interrupt-based HITL**

`/deepagents/generative-ui/your-components/interrupt-based` · route `/generative-ui/your-components/interrupt-based` · under “Set up your agent state” · in a `python` block

78 code lines, 1 heading, 7 prose lines changed.

````diff
- # ...
- from copilotkit import CopilotKitState # extends MessagesState
- # ...
+ from typing import NotRequired
- # This is the state of the agent.
- # It inherits from the CopilotKitState properties from CopilotKit.
+ from copilotkit import CopilotKitState
+ 
````

**High — Predictive State Updates**

`/deepagents/shared-state/predictive-state-updates` · route `/shared-state/predictive-state-updates` · under “Emit the intermediate state” · in a `python` block

46 code lines changed.

````diff
+ import uuid
+ 
+ from copilotkit import CopilotKitState
- from langgraph.types import Command
- from langgraph.graph import END
- from langchain.tools import tool
- from langchain_openai import ChatOpenAI
- from langchain_core.messages import SystemMessage, AIMessage
````

**Low — Quickstart**

`/deepagents/quickstart` · route `/quickstart` · under “Quickstart”

7 prose lines changed.

````diff
- <OpsPlatformCTA
- variant="card"
- title="Ship Deep Agents to production"
- body="Add persistent threads and the inspector with CopilotKit Intelligence."
- ctaLabel="Create a free account"
+ <IntelligenceOnboardingPrompt
+ feature="learning"
````

---

---

## 2026-08-26

### 10:23 UTC — 2 pages, highest severity high

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

`/deepagents/quickstart` · route `/quickstart` · under “Quickstart”

58 code lines, 1 heading, 24 prose lines changed. The number of fenced code blocks changed.

````diff
+ 
- body="Add persistent threads and the inspector with the Enterprise Intelligence Platform."
+ body="Add persistent threads and the inspector with CopilotKit Intelligence."
- <SignupLink surface="docs_deepagents_quickstart_step1">Sign up for a free developer account</SignupLink> on our Enterprise Intelligence Platform to get a license key. You'll use it later to enable persistent threads and the inspector.
+ <SignupLink surface="docs_deepagents_quickstart_step1">Sign up for a free developer account</SignupLink> for CopilotKit Intelligence to get a license key. You'll use it later to enable persistent threads and the inspector.
- ```tsx title="app/api/copilotkit/route.ts"
+ ```tsx title="app/api/copilotkit/[[...slug]]/route.ts" doctest="component"
- CopilotRuntime,
````

---

---
