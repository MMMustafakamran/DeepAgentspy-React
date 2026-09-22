# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-22

### 09:33 UTC — 1 page, highest severity high · _npm run drift:sync_

**High — /deepagents/backend/message-history**

`/deepagents/backend/message-history` · route `/backend/message-history` · `deepagents__backend__message-history.md`

Code fence count changed. Hash  ➔ 19d87af9.

````diff
+ # Message history
+ > Trim the conversation history CopilotKit forwards to an agent that already stores its own.
+ CopilotKit forwards the whole conversation on every run. The frontend holds the
+ transcript, and each run carries it to your agent as `input.messages`. A
+ stateless agent needs that, because the transcript is the only record of the
+ conversation.
+ An agent that stores its own history does not need it. If your backend keeps a
+ LangGraph checkpointer, Mastra memory, an AWS Strands `SessionManager`, or a
  … region truncated
````

### 08:52 UTC — 6 pages, highest severity high · _npm run drift:sync_

**Low — /deepagents/quickstart**

`/deepagents/quickstart` · route `/quickstart` · `deepagents__quickstart.md`

Prose / text phrasing updated. Hash 615688b8 ➔ 39ca33ef.

````diff
- 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
+ 3. Open **Rich Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

**Medium — /deepagents/intelligence/memories**

`/deepagents/intelligence/memories` · route `/intelligence/memories` · `deepagents__intelligence__memories.md`

Headings / Structure changed. Hash 5fdd2ea3 ➔ 2dc8fc55.

````diff
- # Memories & Recall
- > Give your agents long-term memory across conversations.
- Threads remember a conversation. Memories remember a person. This page explains
- what a memory is, how recall selects them, and what has to be true of your
+ # User Memories
+ > Give your agents long-term memory across conversations.
+ Rich Threads remember a conversation. User Memories remember a person. This page explains
+ what a memory is, how recall selects them, and what has to be true of your
  … region truncated
````

**High — /deepagents/learning**

`/deepagents/learning` · route `/learning` · `deepagents__learning.md`

Code block content changed. Hash 19331937 ➔ 75436379.

````diff
- # Learning
- > Turn real application use into evidence-backed Insights and reviewed, reusable Skills.
- ## Overview
- Learning turns patterns from real agent runs into reusable Skills. It looks at completed conversations and application interactions in [Rich Threads](/deepagents/threads), produces evidence-backed Insights, and proposes instructions you can review before publishing.
+ # Automatic Learning
+ > Turn real application use into evidence-backed Insights and reviewed, reusable Skills.
+ ## Overview
+ Automatic Learning turns patterns from real agent runs into reusable Skills. It looks at completed conversations and application interactions in [Rich Threads](/deepagents/threads), produces evidence-backed Insights, and proposes instructions you can review before publishing.
  … region truncated
````

**Low — /deepagents/intelligence/learned-skills**

`/deepagents/intelligence/learned-skills` · route `/intelligence/learned-skills` · `deepagents__intelligence__learned-skills.md`

Prose / text phrasing updated. Hash 2edc4cdd ➔ f5724a70.

````diff
- Start with the [Learning guide](/deepagents/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
- </Callout>
- ## Choose an adapter
- | Framework                 | Package                                  | Native extension                                                     |
+ Start with the [Automatic Learning guide](/deepagents/learning) to collect Threads, configure daily runs, and review Skills. Before connecting an adapter, check that **Skill delivery** is enabled in the container's **Skills** tab. For guided setup, select **Set up skill delivery** there and copy the prompt into your coding agent.
+ </Callout>
+ ## Choose an adapter
+ | Framework                 | Package                                  | Native extension                                                     |
  … region truncated
````

**New — https://docs.copilotkit.ai/deepagents/backend/message-history**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/deepagents/intelligence/self-hosting-ecs**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

---

---

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

---

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
