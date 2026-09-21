"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";

import { DemoFrame } from "@/components/demo-frame";

import {
  Chat,
  ChatClassStringWithAgent,
  ChatComponentsWithAgent,
  ChatDefaultWithAgent,
  ChatPlainTextWithAgent,
} from "../chat-variants";

/**
 * Markdown Rendering.
 *
 * Five tabs. The first is the page's own block with nothing added; the other
 * four all carry `agentId="sample_agent"`, because without it `<CopilotChat>`
 * asks for the agent id `"default"` and a Deep Agents runtime has none.
 *
 *   Published            `chat-variants.tsx` `Chat`, verbatim. Throws.
 *   components map       the same block + agentId.
 *   class string         "Restyle the whole markdown block" + agentId.
 *   replaced renderer    "Replace the renderer" (PlainText) + agentId.
 *   no override          harness baseline, so the tabs above have something
 *                        to be compared against.
 *
 * The probe under the tabs is the point of the route. Every claim this page
 * makes about the props a component receives is a claim about the HTML that
 * comes out, so the probe reads the HTML: it walks the rendered transcript and
 * reports the opening tag of the first anchor, how many elements still carry a
 * `data-streamdown` attribute, and whether any element carries a literal
 * `node` attribute. That last one is the page's first warning — spread `node`
 * onto an element and it writes `node="[object Object]"` into the document.
 *
 * `?tab=<key>` opens one directly, for probes and for the recorder.
 */

const TABS = {
  published: { label: "Page code, verbatim", Chat, published: true },
  components: {
    label: "components map + agentId",
    Chat: ChatComponentsWithAgent,
    published: false,
  },
  "class-string": {
    label: "class string + agentId",
    Chat: ChatClassStringWithAgent,
    published: false,
  },
  "plain-text": {
    label: "replaced renderer + agentId",
    Chat: ChatPlainTextWithAgent,
    published: false,
  },
  none: {
    label: "no override (baseline)",
    Chat: ChatDefaultWithAgent,
    published: false,
  },
} as const;

type TabKey = keyof typeof TABS;

interface Reading {
  /** Opening tag of the first anchor in the transcript, attributes and all. */
  anchor: string | null;
  /** Elements still carrying one of Streamdown's own `data-streamdown` marks. */
  streamdownMarks: number;
  /** Elements carrying a literal `node` attribute. The page's first warning. */
  nodeAttributes: number;
  /** Elements carrying a `class` the page's own snippet asks for. */
  pageClasses: number;
  at: string;
}

/** The opening tag only: `<a href="…" class="…">`, without the subtree. */
function openingTag(el: Element): string {
  const html = el.outerHTML;
  const end = html.indexOf(">");
  return end === -1 ? html.slice(0, 200) : html.slice(0, end + 1);
}

function read(root: HTMLElement): Reading {
  const anchor = root.querySelector("a[href]");
  return {
    anchor: anchor ? openingTag(anchor) : null,
    streamdownMarks: root.querySelectorAll("[data-streamdown]").length,
    nodeAttributes: root.querySelectorAll("[node]").length,
    pageClasses: root.querySelectorAll(".my-link, .my-heading").length,
    at: new Date().toLocaleTimeString(),
  };
}

function Probe({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [reading, setReading] = useState<Reading | null>(null);

  // The transcript is rewritten on every streamed token, so the read is driven
  // by a mutation observer rather than a render: nothing here re-renders the
  // chat, and a poll would miss the settled state as often as it caught it.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    let queued: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      if (queued) clearTimeout(queued);
      queued = setTimeout(() => setReading(read(root)), 250);
    });
    observer.observe(root, { subtree: true, childList: true, attributes: true });
    return () => {
      if (queued) clearTimeout(queued);
      observer.disconnect();
    };
  }, [containerRef]);

  const rows: [ReactNode, ReactNode, string][] = [
    [
      <>First <code>&lt;a&gt;</code> as rendered</>,
      reading?.anchor ?? "no link in the transcript yet",
      "markdown-anchor",
    ],
    [
      <><code>[data-streamdown]</code> elements</>,
      String(reading?.streamdownMarks ?? 0),
      "markdown-streamdown-marks",
    ],
    [
      <>Elements with a literal <code>node</code> attribute</>,
      String(reading?.nodeAttributes ?? 0),
      "markdown-node-attributes",
    ],
    [
      <>Elements carrying <code>.my-link</code> / <code>.my-heading</code></>,
      String(reading?.pageClasses ?? 0),
      "markdown-page-classes",
    ],
  ];

  return (
    <table className="w-full text-left text-xs">
      <tbody className="align-top">
        {rows.map(([label, value, testid], i) => (
          <tr
            key={testid}
            className={i === 0 ? "" : "border-t border-slate-200 dark:border-slate-800"}
          >
            <th className="w-72 py-1 pr-3 font-medium text-slate-500">{label}</th>
            <td data-testid={testid} className="py-1 break-all font-mono">
              {value}
            </td>
          </tr>
        ))}
        <tr className="border-t border-slate-200 dark:border-slate-800">
          <th className="py-1 pr-3 font-medium text-slate-500">Last read</th>
          <td className="py-1 font-mono">{reading?.at ?? "—"}</td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * Harness code, not the page's. The published tab throws from inside the
 * provider's subtree once `/info` answers; without this the throw takes the
 * whole route down and the message is the evidence.
 */
class TabErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
          Uncaught error
        </p>
        <pre
          data-testid="markdown-tab-error"
          className="mt-2 overflow-x-auto whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs text-slate-100"
        >
          {this.state.error.message}
        </pre>
      </div>
    );
  }
}

export default function Page() {
  const [tab, setTab] = useState<TabKey>("components");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Post-hydration on purpose: the server has no query string to render from,
  // so reading it during render would make the first client paint disagree
  // with the HTML. The same shape as `frontend-cards/demo-chat`, where the
  // rule is left firing; silenced here rather than adding a third copy of an
  // error this repo already has two of.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    if (requested && requested in TABS) setTab(requested as TabKey);
  }, []);

  const active = TABS[tab];
  const ActiveChat = active.Chat;

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/markdown"
      subtitle="markdownRenderer slot"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
          {(Object.keys(TABS) as TabKey[]).map((key) => (
            <button
              key={key}
              type="button"
              data-testid={`markdown-tab-${key}`}
              onClick={() => setTab(key)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                key === tab
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {TABS[key].label}
            </button>
          ))}
        </div>

        <div className="shrink-0 border-b border-slate-200 p-3 dark:border-slate-800">
          <Probe containerRef={containerRef} />
        </div>

        <div ref={containerRef} className="min-h-0 flex-1">
          {active.published ? (
            <TabErrorBoundary key={tab}>
              <ActiveChat />
            </TabErrorBoundary>
          ) : (
            <ActiveChat key={tab} />
          )}
        </div>
      </div>
    </DemoFrame>
  );
}
