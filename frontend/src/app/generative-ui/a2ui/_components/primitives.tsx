"use client";

/**
 * ⚠ SELF-DEFINED — not from the CopilotKit docs.
 *
 * The two A2UI doc pages print their `renderers.tsx` in full, but those
 * renderers import `Card`, `Badge`, `Button`, `Separator` and a `CardShell`
 * from a sibling `_components/` directory that the pages never show. They are
 * ordinary shadcn-style primitives, so they are rebuilt here from their usage
 * — same names, same props, Tailwind only.
 *
 * Both A2UI routes list this file explicitly so nobody mistakes it for
 * documented API. Everything else in the A2UI catalogs is the docs'.
 */

import type { ReactNode } from "react";

export function Card({
  className = "",
  children,
  ...rest
}: {
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Badge({
  variant = "default",
  className = "",
  children,
}: {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info";
  className?: string;
  children?: ReactNode;
}) {
  const variants: Record<string, string> = {
    default: "border-transparent bg-neutral-900 text-white dark:bg-slate-100 dark:text-slate-900",
    secondary: "border-transparent bg-neutral-100 text-neutral-900 dark:bg-slate-800 dark:text-slate-100",
    outline: "border-neutral-300 text-neutral-700 dark:border-slate-600 dark:text-slate-300",
    success: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
    warning: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
    error: "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
    info: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${variants[variant] ?? variants.default} ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  className = "",
  children,
  onClick,
}: {
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-slate-100 dark:text-slate-900 ${className}`}
    >
      {children}
    </button>
  );
}

export function Separator({ className = "" }: { className?: string }) {
  return <div className={`h-px shrink-0 bg-neutral-200 dark:bg-slate-700 ${className}`} />;
}

/** A titled card with an optional subtitle — the dynamic catalog's container. */
export function CardShell({
  title,
  subtitle,
  testid,
  cardId,
  children,
}: {
  title?: string;
  subtitle?: string;
  testid?: string;
  cardId?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="w-full p-4" data-testid={testid} data-card-id={cardId}>
      {(title || subtitle) && (
        <header className="mb-3">
          {title && (
            <h3 className="text-sm font-semibold leading-none tracking-tight text-neutral-900 dark:text-slate-100">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </header>
      )}
      {children}
    </Card>
  );
}

/** Palette for the dynamic catalog's charts. */
export const CHART_COLORS = [
  "#4285f4",
  "#34a853",
  "#fbbc04",
  "#ea4335",
  "#a142f4",
  "#00acc1",
];
