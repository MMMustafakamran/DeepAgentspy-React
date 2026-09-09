import "server-only";

import {
  CopilotKitIntelligence,
  CopilotRuntime,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import {
  GRAPH_IDS,
  LANGGRAPH_DEPLOYMENT_URL,
  LANGSMITH_API_KEY,
} from "@/lib/agents";

/**
 * The runtime behind `/api/copilotkit-single`, which is the Intelligence
 * Quickstart's "Connect your runtime" step feeding its "Expose one Runtime
 * route" step.
 *
 * Same agent map as `/api/copilotkit` — one `LangGraphAgent` per graph in
 * `backend/langgraph.json` — with two deliberate differences:
 *
 *   - No `a2ui` block. That option is scoped to the fixed-schema agent on the
 *     main runtime and has nothing to do with this page; carrying it over would
 *     add a second variable to a comparison that is meant to isolate the
 *     transport.
 *   - `intelligence` + `identifyUser` when the project key is set, because
 *     those are steps 1 and 2 of the page this mount belongs to. Without a key
 *     it falls back to the same `InMemoryAgentRunner` the main runtime uses, so
 *     chat still works and only the Intelligence half goes dark.
 *
 * A factory rather than a shared instance, so channel activation on one mount
 * cannot reach another.
 */

const agents = Object.fromEntries(
  GRAPH_IDS.map((graphId) => [
    graphId,
    new LangGraphAgent({
      deploymentUrl: LANGGRAPH_DEPLOYMENT_URL,
      graphId,
      langsmithApiKey: LANGSMITH_API_KEY,
    }),
  ]),
);

// Server-side only, and deliberately not `NEXT_PUBLIC_`. A project key prefixed
// for the browser would ship in the bundle. `CPK_INTELLIGENCE_API_KEY` is the
// name the docs publish now; `INTELLIGENCE_API_KEY` is what older CLIs wrote
// and stays accepted, because the rename never came with a note saying the old
// name stopped working.
const INTELLIGENCE_API_KEY =
  process.env.CPK_INTELLIGENCE_API_KEY ?? process.env.INTELLIGENCE_API_KEY;

const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

/** True when the project key is present, so Intelligence is actually wired. */
export const INTELLIGENCE_CONFIGURED = Boolean(INTELLIGENCE_API_KEY);

export function createIntelligenceRuntime(): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime({
      agents,
      runner: new InMemoryAgentRunner(),
      ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    });
  }

  return new CopilotRuntime({
    agents,
    ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    intelligence: new CopilotKitIntelligence({
      apiKey: INTELLIGENCE_API_KEY,
    }),
    // The doc reads the user from a verified session. A local harness has no
    // session, so it reads a header instead and says so — the page is explicit
    // that a fixed identity is demo-only.
    // [1] intelligence quickstart: identifyUser
    // [!code highlight]
    identifyUser: (request) => ({
      id: request.headers.get("x-copilotkit-user-id") ?? "demo-user",
      name: request.headers.get("x-copilotkit-user-name") ?? "Demo User",
    }),
  });
}
