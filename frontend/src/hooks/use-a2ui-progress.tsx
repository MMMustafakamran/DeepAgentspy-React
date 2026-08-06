"use client";

/**
 * https://docs.copilotkit.ai/deepagents/generative-ui/a2ui/advanced
 *
 * The page's `src/hooks/use-a2ui-progress.tsx` verbatim.
 *
 * `render_a2ui` is the tool the dynamic-schema flow calls under the hood, so
 * claiming that name with `useRenderTool` intercepts the built-in progress
 * indicator. Returning an empty fragment at `status === "complete"` is what
 * hands the space back to the real surface renderer.
 */

import { useRenderTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

import { A2UIProgress } from "@/components/a2ui-progress";

export function useA2UIProgress() {
  useRenderTool(
    {
      name: "render_a2ui",
      parameters: z.any(),
      render: ({ status, parameters }) => {
        // Hide when complete — the A2UI surface renderer takes over
        if (status === "complete") return <></>;
        return <A2UIProgress parameters={(parameters ?? {}) as Record<string, unknown>} />;
      },
    },
    [],
  );
}
