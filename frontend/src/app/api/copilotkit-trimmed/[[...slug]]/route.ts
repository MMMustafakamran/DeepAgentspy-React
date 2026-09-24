import { HttpAgent } from "@ag-ui/client";
import { CopilotRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import { LANGGRAPH_DEPLOYMENT_URL, LANGSMITH_API_KEY } from "@/lib/agents";
import { lastTurnOnly, TrimHistoryMiddleware } from "./trim-history";

/**
 * Message history, "Trim inside the runtime": the page's route, mounted beside
 * the main runtime so trimming only ever applies to the demo that asks for it.
 *
 * `trim-history.ts` and `check-trim-history.ts` sit next to this file exactly
 * as published, so the page's `./trim-history` import is its own text.
 *
 * The page's agent is an `HttpAgent` pointed at `process.env.AGENT_URL`, i.e.
 * an AG-UI HTTP endpoint. This backend serves none: `langgraph dev` on :8030
 * speaks the LangGraph Platform API, which only `LangGraphAgent` talks to. The
 * page never says what `AGENT_URL` is, and nothing here can honestly default
 * it, so it is left unset. The published `default` agent is registered as
 * written and fails when run (observed 2026-09-22, see FINDINGS.md #37).
 */

// [1] message-history: attach the middleware before registering the agent
// [!code highlight]
const agent = new HttpAgent({ url: process.env.AGENT_URL! });
agent.use(new TrimHistoryMiddleware(lastTurnOnly));

// NOT FROM THE PAGE. The page says `.use()` lives on `AbstractAgent`, "so this
// works for any agent". This is that claim on the agent class this integration
// actually uses: the Quickstart's `LangGraphAgent` for `sample_agent`, with the
// same middleware attached the same way. It is what the demo's runtime tab
// talks to, because the page's own `default` agent has nothing to reach.
const sampleAgent = new LangGraphAgent({
  deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
  graphId: "sample_agent",
  langsmithApiKey: LANGSMITH_API_KEY,
});
sampleAgent.use(new TrimHistoryMiddleware(lastTurnOnly));

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
    // NOT FROM THE PAGE. The page's object is `{ default: agent }` on one
    // line; this entry, the trimmed LangGraph agent above, is added to it.
    sample_agent: sampleAgent,
  },
});

// NOT FROM THE PAGE. The snippet stops at `runtime`; the handler is how every
// runtime in this app is served.
const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-trimmed",
});

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
