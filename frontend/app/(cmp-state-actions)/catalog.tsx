// https://docs.copilotkit.ai/deepagents/generative-ui/components/state-and-actions
// The page shows the catalog in two separate `createGenerativeUI({ id: "acme/shop@1", ... })` blocks
// (state + bind, then functions + events) and the ProductCard in a third. HARNESS: merged into one
// catalog (guesswork: the page never shows them together); every value is the page's.
import { useState } from "react";
import { z } from "zod";
import { createGenerativeUI } from "@copilotkit/react-core/v2/generative-ui";
import type { GenerativeUIComponentProps } from "@copilotkit/react-core/v2/generative-ui";

const cartSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
});

function ProductCard({ productId, name, onAddToCart, inCart }: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  const [error, setError] = useState<string>();
  return (
    <article>
      <h4>{name}</h4>
      <p data-harness="in-cart">in cart: {String(inCart)}</p>{/* HARNESS: show the bound prop */}
      <button
        onClick={async () => {
          const result = await onAddToCart?.({ productId });
          if (result && !result.ok) setError(result.error.message);
        }}
      >
        Add to cart
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </article>
  );
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  state: { cart: cartSchema },
  functions: {
    addToCart: {
      description: "Add a product to the cart",
      parameters: z.object({ productId: z.string(), quantity: z.number().default(1) }),
    },
  },
  components: {
    ProductCard: {
      component: ProductCard,
      props: z.object({ productId: z.string(), name: z.string(), inCart: z.number() }),
      bind: {
        inCart: (state, { productId }) =>
          state.cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
      },
      events: { onAddToCart: {} },
    },
  },
});
