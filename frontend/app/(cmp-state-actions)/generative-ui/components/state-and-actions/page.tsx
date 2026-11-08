"use client";
// https://docs.copilotkit.ai/deepagents/generative-ui/components/state-and-actions (CartState + CartActions, verbatim)
import { useState } from "react";
import { useGenerativeUIState } from "@copilotkit/react-core/v2/generative-ui";
import { useGenerativeUIFunction } from "@copilotkit/react-core/v2/generative-ui";
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS
import { shopUI } from "../../../catalog"; // HARNESS

// HARNESS: `Cart` is never defined on the page.
type Cart = { items: { productId: string; quantity: number }[]; addItem: (productId: string, quantity: number) => void };

function CartState({ cart }: { cart: Cart }) {
  useGenerativeUIState(shopUI, "cart", { items: cart.items });
  return null;
}

function CartActions({ cart }: { cart: Cart }) {
  useGenerativeUIFunction(shopUI, "addToCart", ({ productId, quantity }) => {
    cart.addItem(productId, quantity);
    return { added: productId };
  });
  return null;
}

export default function Page() { // HARNESS: a cart in React state
  const [items, setItems] = useState<Cart["items"]>([]);
  const cart: Cart = { items, addItem: (productId, quantity) => setItems((xs) => { const f = xs.find((x) => x.productId === productId); return f ? xs.map((x) => x.productId === productId ? { ...x, quantity: x.quantity + quantity } : x) : [...xs, { productId, quantity }]; }) };
  return (<main><h1>Cart: <span id="cart">{JSON.stringify(items)}</span></h1><CartState cart={cart} /><CartActions cart={cart} /><CopilotSidebar defaultOpen={true} /></main>);
}
