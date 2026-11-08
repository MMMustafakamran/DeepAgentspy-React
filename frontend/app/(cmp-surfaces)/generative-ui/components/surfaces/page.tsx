"use client";
// https://docs.copilotkit.ai/deepagents/generative-ui/components/surfaces ("Add a page target", app/page.tsx, verbatim)
import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";
import { shopUI } from "../../../catalog"; // HARNESS: page imports "./catalog"
import { CopilotSidebar } from "@copilotkit/react-core/v2"; // HARNESS: a chat to ask from

// HARNESS: `Product` and `ProductRow` are used by the page but never defined.
type Product = { name: string; price: number };
function ProductRow({ products }: { products: Product[] }) {
  return <div id="fallback-row">{products.map((p) => <span key={p.name}>{p.name} ${p.price} </span>)}</div>;
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <GenerativeUISurface
      id="featured"
      ui={shopUI}
      description="The Featured Products row of the home page. When the customer asks to see products here, show them as a ProductGrid with one ProductCard for each product. When they ask for the regular products again, delete your surface."
      components={["ProductGrid", "ProductCard"]}
      fallback={<ProductRow products={products} />}
    />
  );
}

export default function Page() { // HARNESS
  return (<main><h1>Shop</h1><h2>Featured</h2><FeaturedProducts products={[{ name: "House Sneaker", price: 49 }]} /><CopilotSidebar defaultOpen={true} /></main>);
}
