# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-18

### 08:13 UTC — 1 page, highest severity high · _npm run drift:sync_

**High — /deepagents/quickstart**

`/deepagents/quickstart` · route `/quickstart` · `deepagents__quickstart.md`

Code block content changed. Hash dd2bd111 ➔ 71a72a31.

````diff
- import { LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";
- const runtime = new CopilotRuntime({
- agents: {
- sample_agent: new LangGraphHttpAgent({
+ import { HttpAgent } from "@ag-ui/client";
+ const runtime = new CopilotRuntime({
+ agents: {
+ sample_agent: new HttpAgent({
````

---

## 2026-09-17

### 07:24 UTC — 5 pages, highest severity high · _npm run drift:sync_

**Low — /deepagents/intelligence/quickstart**

`/deepagents/intelligence/quickstart` · route `/intelligence/quickstart` · `deepagents__intelligence__quickstart.md`

Prose / text phrasing updated. Hash 2bbddfac ➔ 57eee012.

````diff
- If it requires a CopilotKit CLI session check, you have permission to run it. Never reveal credentials or send optional diagnostic feedback reports.
+ If it requires a CopilotKit CLI session check, you have permission to run it. Never reveal credentials.
````

**Medium — /deepagents/quickstart**

`/deepagents/quickstart` · route `/quickstart` · `deepagents__quickstart.md`

Headings / Structure changed. Hash 6964567e ➔ dd2bd111.

````diff
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_deepagents_quickstart"
- />
+ ## Start with your coding agent
+ Use this prompt to connect your Deep Agents agent to CopilotKit and verify a working conversation. Your coding agent will follow this guide in your project, or you can work through the manual steps below.
+ Ask your coding agent to follow the setup steps on this page for your selected framework and frontend.
````

**Medium — /deepagents/webmcp**

`/deepagents/webmcp` · route `/webmcp` · `deepagents__webmcp.md`

Headings / Structure changed. Hash 1c5ea6a1 ➔ 7c0c06d9.

````diff
- ## Setup with a coding agent
+ ## Start with your coding agent
````

**High — /deepagents/intelligence/memories**

`/deepagents/intelligence/memories` · route `/intelligence/memories` · `deepagents__intelligence__memories.md`

Code fence count changed. Hash 00ec0970 ➔ 49fff6f3.

````diff
- > How long-term memory works in CopilotKit Intelligence: what a memory is, the three kinds, user and project scope, how activation is entitled, and how to read and write memories from React, Angular, REST, or MCP.
- <IntelligenceOnboardingPrompt
- feature="learning"
- surface="docs_learn_memories"
+ > Give your agents long-term memory across conversations.
+ Threads remember a conversation. Memories remember a person. This page explains
+ what a memory is, how recall selects them, and what has to be true of your
+ deployment before the memory surfaces exist at all.
  … region truncated
````

**High — /deepagents/learning**

`/deepagents/learning` · route `/learning` · `deepagents__learning.md`

Code block content changed. Hash 3c3abcbf ➔ 8eac3883.

````diff
- ## Set up Learning
- When you are done, your Runtime will send selected Threads to a Learning container, ready to be analyzed and turned into reviewed Skills.
- <Steps>
- <Step>
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
+ #### Copy this prompt into your coding agent
+ ```text
  … region truncated
````

---

---

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

---
