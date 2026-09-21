import "server-only";

import {
  CopilotKitIntelligence,
  CopilotRuntime,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import { LANGGRAPH_DEPLOYMENT_URL, LANGSMITH_API_KEY } from "@/lib/agents";

/**
 * Learning, step "Assign Threads from your Runtime" — the page's runtime,
 * mounted on its own route at `/api/copilotkit-learning`.
 *
 * ONE LINE BELOW THE RULE IS NOT THE PAGE'S. The published selector is:
 *
 *     getLearningContainerId: ({ agentId }) =>
 *       agentId === "expense-agent" ? "expense-review" : undefined,
 *
 * What ships here returns the constant `"firstlearningtest"` for every agent
 * instead. That deviation arrived in 1e4a837 with no note in the commit, no
 * comment here and no entry in the README, which is what a silent fix looks
 * like; it is written down now rather than reverted, because the container name
 * is an account-scoped choice and this harness cannot tell which container a
 * recording is meant to land in. Two things follow from it: the agent-conditional
 * branch the page is actually teaching (assigned agent versus unassigned) is not
 * exercised, and a run on `sample_agent` is assigned where the page would leave
 * it unassigned. See README §9 item 25.
 *
 * The rest of the snippet below the rule is verbatim. It uses two identifiers it
 * never defines, `agents` and `identifyUser`, and says nothing about them; the page
 * is identical under every framework prefix, so it cannot. They are supplied
 * here, above the rule, and they are this harness's, not the page's:
 *
 *   agents        The Quickstart's Deep Agent graph (`sample_agent`) under the
 *                 id the page's selector tests for, `expense-agent`, and under
 *                 its own id, which the selector sends to no container. One
 *                 graph, two ids: which one a run uses is the only thing that
 *                 decides whether it is assigned.
 *   identifyUser  The same fixed demo identity the Intelligence runtime uses.
 *
 * A separate mount rather than an edit to `/api/copilotkit`, for two reasons.
 * `getLearningContainerId` exists only from runtime 1.70 — this repo's lockfile
 * pins 1.69.0, where the option is a type error, and the page names no
 * version — and the constructor throws on a blank key, so the page's code
 * belongs where a failure takes down one route and not every chat in the app.
 * This harness has no `CPK_INTELLIGENCE_API_KEY`, so that throw is what
 * actually happens here: the module fails at load and the route answers 500.
 */

const sampleAgent = () =>
  new LangGraphAgent({
    deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
    graphId: "sample_agent",
    langsmithApiKey: LANGSMITH_API_KEY,
  });

const agents = {
  "expense-agent": sampleAgent(),
  sample_agent: sampleAgent(),
};

const identifyUser = (request: Request) => ({
  id: request.headers.get("x-copilotkit-user-id") ?? "demo-user",
  name: request.headers.get("x-copilotkit-user-name") ?? "Demo User",
});

// ── the page's snippet ─────────────────────────────────────────────────────

// [1] learning: assign Threads from your Runtime
const intelligence = new CopilotKitIntelligence({
  apiKey: process.env.CPK_INTELLIGENCE_API_KEY!,
  // Published:  getLearningContainerId: ({ agentId }) =>
  //               agentId === "expense-agent" ? "expense-review" : undefined,
  // Shipped: one container for every agent. See the header, and README §9 #25.
  getLearningContainerId: () => "firstlearningtest",
});

const runtime = new CopilotRuntime({
  agents,
  intelligence,
  identifyUser,
});

export { runtime as learningRuntime };
