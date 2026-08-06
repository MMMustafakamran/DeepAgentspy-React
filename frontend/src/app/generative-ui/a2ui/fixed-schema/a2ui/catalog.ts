"use client";

/**
 * Fixed A2UI catalog — wires definitions to renderers.
 *
 * `includeBasicCatalog: true` merges CopilotKit's built-in components
 * (Card, Column, Row, Text, Button, Divider, …) into this catalog, so the
 * agent's fixed schema (backend/src/agents/a2ui_schemas/flight_schema.json)
 * can compose custom and basic components interchangeably. The schema
 * references `Column`, `Row` and `Text` without this file declaring any of
 * them — that is where they come from.
 *
 * CATALOG_ID must match the `catalogId` the backend puts in its
 * `createSurface` operation, or the surface renders with no catalog.
 */
import { createCatalog } from "@copilotkit/a2ui-renderer";

import { definitions } from "./definitions";
import { renderers } from "./renderers";

export const CATALOG_ID = "copilotkit://flight-fixed-catalog";

export const catalog = createCatalog(definitions, renderers, {
  catalogId: CATALOG_ID,
  includeBasicCatalog: true,
});
