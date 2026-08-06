"use client";

/**
 * `createCatalog` is what you hand to the provider.
 *
 * `includeBasicCatalog: true` merges CopilotKit's built-ins (Column, Row,
 * Text, Image, Card, Button, List, Tabs, …) so the LLM can compose custom and
 * basic components interchangeably. Where a name collides — Row, Column, Text,
 * Card — the definitions in this catalog win, which is exactly why they are
 * declared: the built-in Row and Column ignore `gap`.
 */
import { createCatalog } from "@copilotkit/a2ui-renderer";

import { myDefinitions } from "./definitions";
import { myRenderers } from "./renderers";

export const myCatalog = createCatalog(myDefinitions, myRenderers, {
  catalogId: "declarative-gen-ui-catalog",
  includeBasicCatalog: true,
});
