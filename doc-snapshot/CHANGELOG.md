# Doc drift changelog

What the CopilotKit docs changed under this repo, written by whichever sync
ran — the `/doc-sync` page or `npm run drift:sync`. Only pages that actually
moved are recorded — a sync that finds everything unchanged writes nothing
here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-09-24

### 07:28 UTC — 2 pages, highest severity medium · _npm run drift:sync_

**Medium — /deepagents/intelligence/memories**

`/deepagents/intelligence/memories` · route `/intelligence/memories` · `deepagents__intelligence__memories.md`

Headings / Structure changed. Hash 2887cb7c ➔ 51788919.

````diff
- ## What is a memory?
- A memory is a short, durable statement about a user or a project, stored outside
- any single thread. "Prefers concise status updates" is a memory. The forty
- messages that revealed the preference are a thread.
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing CopilotKit app and configure long-term memory for your users. Prefer to work through the setup yourself? Follow the manual steps below.
+ ### Copy this prompt into your coding agent
+ ```text
  … region truncated
````

**Medium — /deepagents/learning**

`/deepagents/learning` · route `/learning` · `deepagents__learning.md`

Headings / Structure changed. Hash 17c0c2fd ➔ 85a381fe.

````diff
- ## How Automatic Learning works
- Learning starts with a container, which groups Threads from the same kind of work. Intelligence analyzes completed runs in that container and summarizes recurring patterns as Insights.
- When a pattern can be reused, Learning proposes a Skill. You review the supporting Threads and decide whether to publish it. A published Skill is a versioned set of instructions that you load into your agent; Learning does not change the model itself.
- Automatic Learning checks eligible containers on a daily schedule. After you approve a skill, [skill delivery](/deepagents/intelligence/learned-skills) makes it available to connected agents. A scheduled run does not approve skills. Turning on delivery does not connect your agent for you.
+ ## Start with your coding agent
+ Copy this prompt into your coding agent to inspect your existing app and configure Automatic Learning for one focused workflow. Prefer to work through the setup yourself? Follow the manual steps below.
+ #### Copy this prompt into your coding agent
+ ```text
  … region truncated
````

---

## 2026-09-23

### 07:50 UTC — 10 pages, highest severity high · _npm run drift:sync_

**High — /deepagents/quickstart**

`/deepagents/quickstart` · route `/quickstart` · `deepagents__quickstart.md`

Code block content changed. Hash 39ca33ef ➔ 91a401c2.

````diff
- <SignupLink surface="docs_deepagents_quickstart_step1">Sign in to managed Intelligence</SignupLink>. Managed setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
- </Step>
- <Step>
- ### Initialize your agent project
+ <SignupLink surface="docs_deepagents_quickstart_step1">Sign in to cloud-hosted Intelligence</SignupLink>. Cloud-hosted setup uses a server-side project API key and does not issue `COPILOTKIT_LICENSE_TOKEN`. You will connect the app after you create it below.
+ </Step>
+ <Step>
+ ### Initialize your agent project
  … region truncated
````

**High — /deepagents/intelligence/memories**

`/deepagents/intelligence/memories` · route `/intelligence/memories` · `deepagents__intelligence__memories.md`

Code block content changed. Hash 2dc8fc55 ➔ 2887cb7c.

````diff
- Rich Threads remember a conversation. User Memories remember a person. This page explains
- what a memory is, how recall selects them, and what has to be true of your
- deployment before the memory surfaces exist at all.
- If you are looking for the persistence architecture beneath a single
+ ## Overview
+ Rich Threads remember a conversation. User Memory remembers a person. This page explains
+ what a memory is, how recall selects them, and what has to be true of your
+ deployment before the memory surfaces exist at all.
  … region truncated
````

**High — /deepagents/learning**

`/deepagents/learning` · route `/learning` · `deepagents__learning.md`

Code fence count changed. Hash 75436379 ➔ 17c0c2fd.

````diff
- > Turn real application use into evidence-backed Insights and reviewed, reusable Skills.
- ## Overview
- Automatic Learning turns patterns from real agent runs into reusable Skills. It looks at completed conversations and application interactions in [Rich Threads](/deepagents/threads), produces evidence-backed Insights, and proposes instructions you can review before publishing.
- <div className="not-prose shell-docs-radius-surface aspect-[7/4] w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-panel)]">
+ > Turn real use of your app into skills you can review and publish.
+ ## Overview
+ Automatic Learning turns patterns from real agent runs into skills you can publish. It reads completed conversations in [Rich Threads](/deepagents/threads), writes insights, and proposes instructions you review before you publish them.
+ <div className="not-prose shell-docs-radius-surface aspect-[7/4] w-full overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-panel)]">
  … region truncated
````

**High — /deepagents/intelligence/learned-skills**

`/deepagents/intelligence/learned-skills` · route `/intelligence/learned-skills` · `deepagents__intelligence__learned-skills.md`

Code fence count changed. Hash f5724a70 ➔ efaf6dd6.

````diff
- # Automatic learned skill delivery
- > Keep published Learning skills available to agents with verified snapshots, automatic refresh, and exact revision pins.
- Learned skill delivery makes one Learning container's published skills available to an agent without another CLI download or process restart. A framework adapter adds an alphabetical catalog and two tools. The model decides when to load and follow a skill.
- Developer instructions retain precedence. Learned skills cannot override the agent's role, safety rules, tool restrictions, or application policy.
+ # Skill delivery
+ > Keep published skills available to agents, with verified snapshots and exact revision pins.
+ ## Overview
+ Skill delivery makes one Learning container's published skills available to an agent without another CLI download or process restart. A framework adapter adds an alphabetical catalog and two tools.
  … region truncated
````

**Low — /deepagents/cookbook/jev-generative-ui**

`/deepagents/cookbook/jev-generative-ui` · route `/cookbook/jev-generative-ui` · `deepagents__cookbook__jev-generative-ui.md`

Prose / text phrasing updated. Hash cda06a5d ➔ 4314f2ad.

````diff
- Next, make the approved Skills available to Jev. [Automatic learned skill delivery](/deepagents/intelligence/learned-skills) provides a registry of published Skills. The helper below reads their `SKILL.md` contents so you can pass them into `systemOne` as guidance. This is your application’s connection to Jev; installing a model adapter alone does not make that connection.
+ Next, make the approved Skills available to Jev. [Skill delivery](/deepagents/intelligence/learned-skills) provides a registry of published Skills. The helper below reads their `SKILL.md` contents so you can pass them into `systemOne` as guidance. This is your application’s connection to Jev; installing a model adapter alone does not make that connection.
````

**High — /deepagents/threads-lifecycle**

`/deepagents/threads-lifecycle` · route `/threads/lifecycle` · `deepagents__threads-lifecycle.md`

Code block content changed. Hash 94c44877 ➔ a6f494f0.

````diff
- [Connect your runtime to Intelligence](/deepagents/intelligence/connect-your-runtime) covers the
+ [Connect your runtime to Intelligence](/deepagents/intelligence/quickstart) covers the
````

**High — /deepagents/backend/message-history**

`/deepagents/backend/message-history` · route `/backend/message-history` · `deepagents__backend__message-history.md`

Code block content changed. Hash 19d87af9 ➔ 0cccce9c.

````diff
- whole. `selfManagedAgents` belongs to the Enterprise Intelligence tier, so
+ whole. `selfManagedAgents` belongs to the Enterprise plan, so
````

**New — https://docs.copilotkit.ai/deepagents/intelligence/analytics**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/deepagents/intelligence/channels**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

**New — https://docs.copilotkit.ai/deepagents/intelligence/plans**

Listed upstream, tracked nowhere in this repo. Not snapshotted by this run.

---

---

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

---
