// Verbatim: https://docs.copilotkit.ai/deepagents/webmcp (OrderSearch.tsx)
"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

// HARNESS: `searchOrders` is called by the page's handler but never defined on the page.
async function searchOrders(status: string) { return [{ id: "o-1", status }]; }

export function OrderSearch() {
  useFrontendTool({
    name: "searchOrders",
    description: "Search the signed-in user's orders by status",
    parameters: z.object({
      status: z.enum(["open", "shipped", "delivered"]),
    }),
    handler: async ({ status }) => {
      const orders = await searchOrders(status);
      return JSON.stringify(orders);
    },
    webmcp: {
      annotations: {
        readOnlyHint: true,
      },
    },
  });

  return null;
}
