"use client";

/**
 * A2UI catalog RENDERERS — React implementations for the custom components
 * declared in `./definitions`. TypeScript enforces that the renderer map's
 * keys and prop shapes match the definitions exactly, so a schema edit that
 * outgrows the renderers fails at build time rather than at runtime.
 *
 * The primitives imported below are self-defined — see
 * `../../_components/primitives.tsx` and the warning on the route page.
 */
import React from "react";
import type { CatalogRenderers } from "@copilotkit/a2ui-renderer";

import {
  Badge,
  Button as UIButton,
  Card,
  Separator,
} from "../../_components/primitives";
import type { Definitions } from "./definitions";

// `DynString` props are typed as `string | { path }` (see definitions.ts), but
// the A2UI binder resolves path bindings before render — renderers only ever
// see resolved strings. One shared helper keeps that narrowing in one place.
const s = (v: unknown): string => (typeof v === "string" ? v : "");

export const renderers: CatalogRenderers<Definitions> = {
  /**
   * Card override: the outer container. The basic catalog's Card uses inline
   * styles; overriding here keeps the Tailwind aesthetic. The flight schema
   * renders Card > Column > [Title, Row, …]; the inner Column adds the
   * vertical spacing.
   */
  Card: ({ props, children }) => (
    <Card className="w-full max-w-md p-5" data-testid="a2ui-fixed-card">
      {props.child ? children(props.child) : null}
    </Card>
  ),
  Title: ({ props }) => (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Itinerary
        </p>
        <h3 className="text-base font-semibold leading-none tracking-tight text-neutral-900 dark:text-slate-100">
          {s(props.text)}
        </h3>
      </div>
      <Badge variant="outline" className="font-mono">
        1-stop · economy
      </Badge>
    </div>
  ),
  Airport: ({ props }) => (
    <div className="flex flex-col items-center">
      <span className="font-mono text-2xl font-semibold tracking-wider text-neutral-900 dark:text-slate-100">
        {s(props.code)}
      </span>
    </div>
  ),
  Arrow: () => (
    <div className="flex flex-1 items-center px-3">
      <Separator className="flex-1" />
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-1 text-neutral-400"
        aria-hidden
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
      <Separator className="flex-1" />
    </div>
  ),
  AirlineBadge: ({ props }) => (
    <Badge variant="secondary" className="uppercase tracking-[0.08em]">
      {s(props.name)}
    </Badge>
  ),
  PriceTag: ({ props }) => (
    <div className="flex items-baseline gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
        Total
      </span>
      <span className="font-mono text-base font-semibold text-neutral-900 dark:text-slate-100">
        {s(props.amount)}
      </span>
    </div>
  ),
  /**
   * Button override: pure presentation. The schema declares an `action` for
   * fidelity, but the click is inert — `a2ui.render(...)` in the Python SDK
   * does not yet accept the `action_handlers=` kwarg that would let
   * `display_flight` respond to it. See the route page.
   */
  Button: ({ props, children }) => (
    <UIButton className="w-full">
      {props.child ? children(props.child) : null}
    </UIButton>
  ),
};
