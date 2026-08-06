/**
 * The graph ids this app can address.
 *
 * Mirrors the `graphs` object in `backend/langgraph.json` — id `sample_agent`
 * is the key the LangGraph dev server publishes it under, and the same string
 * a route passes as `agentId`. Keeping the list here rather than fetching it
 * lets the runtime route build its agent map synchronously at module load.
 *
 * If you add a graph to `langgraph.json`, add its id here too.
 */

export const GRAPH_IDS = [
  "sample_agent",
  "tool_rendering_agent",
  "state_rendering_agent",
  "interrupt_agent",
  "interrupt_multi_agent",
  "frontend_tools_agent",
  "a2ui_fixed_agent",
  "a2ui_dynamic_agent",
  "shared_state_agent",
  "predictive_state_agent",
  "state_io_graph",
] as const;

export type GraphId = (typeof GRAPH_IDS)[number];

/**
 * Where the LangGraph dev server is listening. The Quickstart's own default,
 * and the port `langgraph dev --port 8123` uses.
 */
export const LANGGRAPH_DEPLOYMENT_URL =
  process.env.LANGGRAPH_DEPLOYMENT_URL ?? "http://localhost:8123";

/**
 * Sent as `langsmithApiKey`. `langgraph dev` running locally does not check it,
 * so it is empty in local development — the Quickstart's snippet defaults it to
 * `""` for the same reason. A LangGraph Platform deployment does need one.
 */
export const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY ?? "";

/** The one agent whose route scopes A2UI middleware — see the runtime route. */
export const A2UI_FIXED_GRAPH_ID = "a2ui_fixed_agent";

/** The A2UI dynamic-schema agent, served by its own runtime endpoint. */
export const A2UI_DYNAMIC_GRAPH_ID = "a2ui_dynamic_agent";
