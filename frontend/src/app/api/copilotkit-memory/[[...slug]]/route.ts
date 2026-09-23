import {
  CopilotKitIntelligence,
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";

import { GRAPH_IDS, LANGGRAPH_DEPLOYMENT_URL, LANGSMITH_API_KEY } from "@/lib/agents";

/**
 * NOT FROM THE PAGE. The runtime option Memories & Recall never mentions.
 *
 * The page says memory "is not a feature flag" and that `isAvailable: false` is
 * what an unentitled deployment looks like. The runtime has a gate before
 * entitlement is ever consulted: every `/memories/*` request 404s at the
 * runtime unless it is constructed with `memory: { access }` (or the deprecated
 * `exposeMemoryRoutes: true`) — a "secure default", per the runtime's own
 * typings, present on 1.69.0 (this repo's lockfile until 2026-09-23) and on
 * CI's 1.71.0 alike; not re-checked on the 1.73.3 installed since.
 * `/api/copilotkit`, built the way the Deep Agents Quickstart builds it, has
 * neither (and no `intelligence` either), so the page's `useMemories()`
 * reports unavailable there no matter what the organization is entitled to.
 *
 * This mount is an Intelligence runtime over the same graphs with that one
 * option added, granting the user read-write. The typings only accept `memory`
 * on an Intelligence runtime, which needs `CPK_INTELLIGENCE_API_KEY`. This
 * harness has no key — locally or in CI — so without one the mount answers
 * 503 and says why, rather than pretending to be something it is not.
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

const INTELLIGENCE_API_KEY =
  process.env.CPK_INTELLIGENCE_API_KEY ?? process.env.INTELLIGENCE_API_KEY;

function build(): CopilotRuntime | null {
  if (!INTELLIGENCE_API_KEY) return null;
  return new CopilotRuntime({
    agents,
    intelligence: new CopilotKitIntelligence({ apiKey: INTELLIGENCE_API_KEY }),
    identifyUser: (request: Request) => ({
      id: request.headers.get("x-copilotkit-user-id") ?? "demo-user",
      name: request.headers.get("x-copilotkit-user-name") ?? "Demo User",
    }),
    // The missing option.
    memory: {
      access: () => ({ user: "read-write", project: "none" }),
    },
  });
}

const runtime = build();

const handler = runtime
  ? createCopilotRuntimeHandler({ runtime, basePath: "/api/copilotkit-memory" })
  : async () =>
      Response.json(
        { error: "CPK_INTELLIGENCE_API_KEY is not set; memory needs an Intelligence runtime." },
        { status: 503 },
      );

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
