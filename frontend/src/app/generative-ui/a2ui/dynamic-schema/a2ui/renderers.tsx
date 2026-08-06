"use client";

/**
 * React implementations for every key in `myDefinitions`.
 *
 * `CatalogRenderers<MyDefinitions>` makes this exhaustive: adding a definition
 * without a renderer is a compile error, and props are typed from the Zod
 * schema, so a schema edit shows up here immediately.
 *
 * `CardShell`, `Badge`, `Button` and `CHART_COLORS` are self-defined — see
 * `../../_components/primitives.tsx` and the warning on the route page.
 */

import type { CatalogRenderers } from "@copilotkit/a2ui-renderer";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Badge,
  Button,
  CHART_COLORS,
  CardShell,
} from "../../_components/primitives";
import type { MyDefinitions } from "./definitions";

const c = {
  cardFg: "#0f172a",
  muted: "#64748b",
  divider: "#e2e8f0",
};

/**
 * The LLM sometimes emits chart values as strings, which Recharts treats as
 * categorical (unordered axis ticks). Coerce, but warn rather than silently
 * collapsing to 0 — a silent 0 hides schema drift.
 */
function coerceChartData(
  raw: unknown,
  component: string,
): { label: string; value: number }[] {
  return (Array.isArray(raw) ? raw : []).map((d) => {
    const value = (d as { value?: unknown }).value;
    const n = typeof value === "number" ? value : parseFloat(value as string);
    if (Number.isFinite(n)) {
      return { ...(d as object), value: n } as { label: string; value: number };
    }
    console.warn("Invalid chart value", { component, key: "value", raw: value });
    return { ...(d as object), value: 0 } as { label: string; value: number };
  });
}

export const myRenderers: CatalogRenderers<MyDefinitions> = {
  Row: ({ props, children }) => {
    const justifyMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      spaceBetween: "space-between",
    };
    const items = Array.isArray(props.children) ? props.children : [];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: `${props.gap ?? 16}px`,
          alignItems: props.align ?? "stretch",
          justifyContent: justifyMap[props.justify ?? "start"] ?? "flex-start",
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        {items.map((id, i) => (
          <div key={`${id}-${i}`} style={{ flex: "1 1 0", minWidth: 0 }}>
            {children(id)}
          </div>
        ))}
      </div>
    );
  },

  Column: ({ props, children }) => {
    const items = Array.isArray(props.children) ? props.children : [];
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: `${props.gap ?? 12}px`,
          width: "100%",
        }}
      >
        {items.map((id, i) => (
          <React.Fragment key={`${id}-${i}`}>{children(id)}</React.Fragment>
        ))}
      </div>
    );
  },

  Text: ({ props }) => (
    <span style={{ fontSize: "0.85rem", color: c.cardFg, lineHeight: 1.5 }}>
      {props.text}
    </span>
  ),

  Card: ({ props, children }) => (
    // `data-testid` stays shared so selectors find every card;
    // `data-card-id` disambiguates siblings by title.
    <CardShell
      title={props.title}
      subtitle={props.subtitle}
      testid="declarative-card"
      cardId={props.title}
    >
      {props.child && children(props.child)}
    </CardShell>
  ),

  StatusBadge: ({ props }) => {
    const variant = props.variant ?? "info";
    const Icon = {
      error: TriangleAlert,
      warning: CircleAlert,
      success: CircleCheck,
      info: Info,
    }[variant];
    return (
      // `alignSelf: flex-start` keeps the pill content-sized — flex parents
      // (our Column override) default to stretch, which would inflate it
      // into a full-width banner.
      <span style={{ alignSelf: "flex-start" }} data-testid="declarative-status-badge">
        <Badge variant={variant}>
          <Icon size={12} strokeWidth={2.5} style={{ marginRight: 4 }} />
          {props.text}
        </Badge>
      </span>
    );
  },

  Metric: ({ props }) => {
    const trendColors: Record<string, string> = {
      up: "#059669",
      down: "#dc2626",
      neutral: c.muted,
    };
    const trendIcons: Record<string, string> = {
      up: "↑",
      down: "↓",
      neutral: "→",
    };
    return (
      <div
        data-testid="declarative-metric"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minWidth: "120px",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: c.muted,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {props.label}
        </span>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: c.cardFg,
              letterSpacing: "-0.02em",
            }}
          >
            {props.value}
          </span>
          {props.trend && (
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: trendColors[props.trend] ?? c.muted,
              }}
            >
              {trendIcons[props.trend]}
              {props.trendValue ? ` ${props.trendValue}` : ""}
            </span>
          )}
        </div>
      </div>
    );
  },

  InfoRow: ({ props }) => (
    // `last:border-b-0` so the final row does not dangle a trailing line,
    // regardless of whether the agent wrapped these in a Column or dropped
    // them straight into a Card's child slot.
    <div
      data-testid="declarative-info-row"
      className="flex items-baseline justify-between gap-4 border-b border-neutral-200 py-2 first:pt-0 last:border-b-0 last:pb-0 dark:border-slate-700"
    >
      <span className="text-sm text-neutral-500 dark:text-slate-400">
        {props.label}
      </span>
      <span className="text-right text-sm font-medium tabular-nums text-neutral-900 dark:text-slate-100">
        {props.value}
      </span>
    </div>
  ),

  DataTable: ({ props }) => {
    const cols = Array.isArray(props.columns) ? props.columns : [];
    const rows = Array.isArray(props.rows) ? props.rows : [];
    return (
      <div data-testid="declarative-data-table" className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="border-b-2 border-neutral-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:border-slate-700 dark:text-slate-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              // Stable key: prefer the first column's value (primary-key-ish),
              // suffixed with the index in case values repeat. Stable keys stop
              // React re-mounting every row when the agent re-emits a slightly
              // different table.
              const pk = cols.length > 0 ? row[cols[0].key] : undefined;
              const rowKey = pk !== undefined ? `${pk}-${i}` : JSON.stringify(row);
              return (
                <tr
                  key={rowKey}
                  className="border-b border-neutral-200 last:border-b-0 dark:border-slate-700"
                >
                  {cols.map((col) => (
                    <td
                      key={col.key}
                      className="px-3 py-2 tabular-nums text-neutral-900 dark:text-slate-100"
                    >
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },

  PrimaryButton: ({ props, dispatch }) => (
    <Button
      onClick={() => {
        if (props.action && dispatch) dispatch(props.action);
      }}
    >
      {props.label}
    </Button>
  ),

  PieChart: ({ props }) => {
    const data = coerceChartData(props.data, "PieChart");
    return (
      <CardShell
        title={props.title}
        subtitle={props.description}
        testid="declarative-pie-chart"
      >
        {data.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            No data available
          </div>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <RechartsPieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardShell>
    );
  },

  BarChart: ({ props }) => {
    const data = coerceChartData(props.data, "BarChart");
    return (
      <CardShell
        title={props.title}
        subtitle={props.description}
        testid="declarative-bar-chart"
      >
        {data.length === 0 ? (
          <div className="py-8 text-center text-sm text-neutral-500">
            No data available
          </div>
        ) : (
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <RechartsBarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.divider} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: c.muted }} />
                <YAxis tick={{ fontSize: 11, fill: c.muted }} />
                <Tooltip />
                <Bar dataKey="value" fill="#4285f4" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardShell>
    );
  },
};
