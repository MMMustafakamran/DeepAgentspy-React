// https://docs.copilotkit.ai/deepagents/generative-ui/components/from-a2ui ("Convert a custom catalog", After, verbatim)
import { z } from "zod"; // HARNESS: the After block uses z without importing it
import {
  createGenerativeUI,
  standardUI,
} from "@copilotkit/react-core/v2/generative-ui";

// HARNESS: "Your renderers stay as they are" — the Airport / Arrow renderers are never shown.
function Airport({ code, city }: { code: string; city: string }) { return <div data-harness="airport"><b>{code}</b><br />{city}</div>; }
function Arrow() { return <span data-harness="arrow">→</span>; }

export const appUI = createGenerativeUI({
  id: "acme/flights@1",
  extends: [standardUI],
  components: {
    Airport: {
      component: Airport,
      description: "An airport by IATA code, with its city under it.",
      props: z.object({ code: z.string(), city: z.string() }),
    },
    Arrow: { component: Arrow, description: "An arrow between two airports." },
  },
});
