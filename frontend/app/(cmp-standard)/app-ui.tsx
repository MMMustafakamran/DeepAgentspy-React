// Verbatim: https://docs.copilotkit.ai/deepagents/generative-ui/components/standard-catalog ("Replace a component")
import {
  createGenerativeUI,
  standardUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

function MyCard({ children }: GenerativeUIComponentProps<typeof standardUI, "Card">) {
  return <div className="rounded-2xl border p-6 shadow-sm" data-harness="my-card">{children}</div>; // HARNESS: data-harness attribute only, to detect the override
}

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI],
  overrides: { Card: { component: MyCard } },
  components: {},
});
