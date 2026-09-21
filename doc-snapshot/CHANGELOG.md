# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-21

### 07:26 UTC — 7 pages, highest severity high · _npm run drift:sync_

**High — /deepagents**

`/deepagents` · routes `/`, `/doc-sync` · `deepagents.md`

Code fence count changed. Hash d0d82bb3 ➔ e3a39f80.

````diff
- {/* TODO: swap feature-viewer URLs back to /deepagents/ once the dojo supports that route */}
- <FrameworkOverview
- frameworkName="Deep Agents"
- frameworkIcon={<DeepAgentsIcon className="h-14 w-14" />}
+ <FrameworkOverview
+ frameworkName="Deep Agents"
+ frameworkIcon={<DeepAgentsIcon className="h-12 w-12" />}
+ header="Bring your Deep Agents to your users"
  … region truncated
````

**High — /deepagents/quickstart**

`/deepagents/quickstart` · route `/quickstart` · `deepagents__quickstart.md`

Code fence count changed. Hash 71a72a31 ➔ 615688b8.

````diff
- ### Create a free account
- <SignupLink surface="docs_deepagents_quickstart_step1">Sign up for a free developer account</SignupLink> for CopilotKit Intelligence to get a license key. You'll use it later to enable persistent threads and the inspector.
- </Step>
- <Step>
+ ### Set up CopilotKit Intelligence
+ <SignupLink surface="docs_deepagents_quickstart_step1">Sign in to managed Intelligence</SignupLink>. Managed setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
+ </Step>
+ <Step>
  … region truncated
````

**Low — /deepagents/intelligence/memories**

`/deepagents/intelligence/memories` · route `/intelligence/memories` · `deepagents__intelligence__memories.md`

Prose / text phrasing updated. Hash 49fff6f3 ➔ 5fdd2ea3.

````diff
- import { useMemories } from "@copilotkit/react-core";
+ import { useMemories } from "@copilotkit/react-core/v2";
````

**High — /deepagents/learning**

`/deepagents/learning` · route `/learning` · `deepagents__learning.md`

Code fence count changed. Hash 8eac3883 ➔ 19331937.

````diff
- ## Start with your coding agent
- Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
- #### Copy this prompt into your coding agent
- ```text
+ Automatic Learning checks eligible containers on a daily schedule. After you approve a Skill, automatic skill delivery makes it available to connected agents. Scheduling, publication, and delivery are separate: a scheduled run does not approve Skills, and enabling delivery does not connect your agent for you.
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
+ #### Copy this prompt into your coding agent
  … region truncated
````

**High — /deepagents/intelligence/learned-skills**

`/deepagents/intelligence/learned-skills` · route `/intelligence/learned-skills` · `deepagents__intelligence__learned-skills.md`

Code fence count changed. Hash 30274955 ➔ 2edc4cdd.

````diff
- ## Choose an adapter
- | Framework                 | Package                                  | Native extension                                                     |
- | ------------------------- | ---------------------------------------- | -------------------------------------------------------------------- |
- | LangGraph Python          | `copilotkit-intelligence-langgraph`      | `create_skill_registry_middleware`                                   |
+ <Callout type="info">
+ Start with the [Learning guide](/deepagents/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
+ </Callout>
+ ## Choose an adapter
  … region truncated
````

**New — https://docs.copilotkit.ai/deepagents/cookbook/jev-generative-ui**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/deepagents/custom-look-and-feel/markdown**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

---

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
