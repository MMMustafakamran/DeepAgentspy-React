# Components as Tools

> Let your agent render rich React components directly in the chat by calling them as tools.


<!-- interactive demo: gen-ui-tool-based -->


## What is this?

Tool-based Generative UI is the simplest form of Generative UI: you register
a React component with `useComponent`, and CopilotKit exposes it to the
agent as a tool. When the agent calls the tool, CopilotKit renders your
component inline in the chat, passing the tool's arguments straight through
as typed props.

Unlike [tool rendering](/deepagents/generative-ui/tool-rendering), which wraps a
real backend tool in a custom UI, tool-based GenUI is the component. There
is no handler, no user interaction, no server-side execution. The agent
decides when to show it, populates the data, and CopilotKit paints it.

## When should I use this?

Use `useComponent` when you want to:

- Display rich UI (cards, charts, tables, dashboards) inline in the chat
- Show structured data the agent has derived from its reasoning
- Render previews, status indicators, or visual summaries
- Let the agent present information beyond plain text

For components that need user interaction, see
[Human-in-the-loop](/deepagents/human-in-the-loop). For operational transparency
around a real backend tool, see [Tool rendering](/deepagents/generative-ui/tool-rendering).

## How it works in code

<Steps>
  <Step>
    ### Wire CopilotKit middleware into your agent

    Deep Agents compile to LangGraph graphs, and `CopilotKitMiddleware` is the
    bridge. It reads the forwarded tools off the request and merges them into
    the tool list the model sees, so a component registered with `useComponent`
    only reaches the model when the middleware is present.

    ```python title="agent.py"
    from deepagents import create_deep_agent
    from copilotkit import CopilotKitMiddleware

    agent = create_deep_agent(
        model="openai:gpt-6-luna",
        tools=[],  # Backend tools go here
        middleware=[CopilotKitMiddleware()],
        system_prompt=SYSTEM_PROMPT,
    )
    ```

    Without the middleware the run still completes, and the component never
    renders, because the model was never told the tool exists.

  </Step>
  <Step>
    ### Tell the model when to call it

    The forwarded tool arrives on every run, but a model with no instruction
    about it will answer in prose and never call it. Name the tool in
    `system_prompt` and say what it is for.

    ```python title="agent.py"
    SYSTEM_PROMPT = """
    You are a data visualization assistant.

    When the user asks for a chart, call `render_bar_chart` with a concise
    title and a `data` array of `{label, value}` items.

    Keep chat responses brief and let the chart do the talking.
    """
    ```

  </Step>
</Steps>

Import the React hook and Zod in the component that registers the tool. This also
applies to the built-in agent, which needs no backend tool-registration step.

```tsx
import { useComponent } from "@copilotkit/react-core/v2";
import { z } from "zod";
```

`useComponent` takes a name, a Zod schema for its props, and the component
to render. The runtime registers it as a frontend tool so the agent can
discover it, and the schema becomes that tool's parameter definition — it is
what tells the model which arguments to send.

<Callout type="warn">
  `parameters` is optional, but leaving it out advertises the tool with an
  empty parameter schema (`{ "type": "object", "properties": {} }`). The model
  then has nothing to fill in, so it calls the tool with no arguments and your
  component renders with no props. Pass a schema for any component that needs
  data.
</Callout>

```typescript
// src/app/demos/gen-ui-tool-based/page.tsx
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });
```

The component itself is ordinary React: it reads only its props and can
stream in as the agent fills the payload. The example above uses
[Recharts](https://recharts.org) for the bar chart; it doesn't know
anything about CopilotKit.

<Callout type="info">
  The `name` you pass to `useComponent` is what the agent sees as the tool
  name. Make it a verb like `render_bar_chart` or `show_weather` so the LLM
  reliably picks it when the user asks for that visualization.
</Callout>

## Rendering in a headless chat

CopilotKit's built-in chat components paint registered components for you. A
headless or custom chat renders the message list itself, so nothing paints a
tool call unless you render it — the component is registered and the agent
calls it, but the chat stays empty.

Render the tool calls on each assistant message with
`CopilotChatToolCallsView`:

```tsx
import { CopilotChatToolCallsView } from "@copilotkit/react-core/v2";

<CopilotChatToolCallsView message={assistantMessage} messages={allMessages} />;
```

It looks up the sibling `tool`-role message for each tool call and hands both
to the registered renderer. For finer placement, call `useRenderToolCall()` and
paint each tool call yourself — see
[Headless UI](/deepagents/custom-look-and-feel/headless-ui).

<IntegrationGrid path="generative-ui/tool-based" />
