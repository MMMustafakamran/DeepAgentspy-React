/**
 * Jev: fast generative UI — step 4, first block. Published as
 * `app/api/copilotkit/[[...slug]]/route.ts`, verbatim below.
 *
 * NOTHING IMPORTS THIS FILE, and it is deliberately not named `route.ts`: the
 * path it publishes at is already taken here by this repo's own Deep Agents
 * runtime, and mounting a second endpoint on the same `basePath` would replace
 * every other route in the harness. It also cannot work, because the agent it
 * registers cannot be constructed — see `picker-agent.ts`.
 *
 * Two deviations, both locational and both named here:
 *   - the file name, above;
 *   - `./picker-agent` instead of the published `@/lib/picker-agent`, because
 *     the recipe's files live under this route rather than at the app root.
 *
 * Version note: the page pins `@copilotkit/runtime@1.73.0`. This repo declares
 * `^1.69.0` and installs 1.71.0. The two lines below typecheck on 1.71.0, so
 * nothing here needs the pinned floor; nothing on the page says what does.
 */

import { CopilotRuntime, createCopilotEndpoint } from "@copilotkit/runtime/v2";
import { PickerAgent } from "./picker-agent";

export const runtime = "nodejs";
const endpoint = createCopilotEndpoint({
  runtime: new CopilotRuntime({ agents: { picker: new PickerAgent() } }),
  basePath: "/api/copilotkit",
});
const handler = (request: Request) => endpoint.fetch(request);
export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
