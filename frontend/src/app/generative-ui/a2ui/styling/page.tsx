import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_DARK_MODE = `/* as printed on the page */
.dark .a2ui-surface,
@media (prefers-color-scheme: dark) {
  .a2ui-surface {
    --primary: #e5e5e5;
    /* … */
  }
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/styling" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A2UI surfaces are themed with CSS custom properties scoped to{" "}
          <code>.a2ui-surface</code>, not by props. One file imported at the app
          root restyles every surface in the app and touches nothing else,
          because the scope keeps the variables off <code>:root</code>.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page has no agent. The demo drives the dynamic-schema one so there
          is something to look at, and the theme is live for it — as it is for
          the Fixed Schema and Advanced routes, since the import is global.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Show me a KPI dashboard for a SaaS business last quarter",
              "Draw a comparison table of three laptops",
            ]}
            expect={
              <>
                Surface text renders in Plus Jakarta Sans with slightly tight
                letter-spacing, and cards are at least 280px wide even when only
                one has streamed in. Switch your OS to dark mode and the card
                background goes near-black.
              </>
            }
            fail="System-default typography on the surface means theme.css was not imported, or the surface is not inside a .a2ui-surface container."
          />
        </div>
      </Panel>

      <Panel
        title="The theme file"
        description="The page's Full Example, plus the two blocks it lists separately (card min-width and dark mode)."
      >
        <SourceCode file="frontend/src/a2ui/theme.css" />
      </Panel>

      <Panel
        title="Where it is imported"
        description="At the app root, which is what the page's src/app/layout.tsx snippet shows."
      >
        <SourceCode file="frontend/src/app/layout.tsx" />
      </Panel>

      <Callout tone="warn" title="The page's dark-mode block is invalid CSS">
        <div className="mt-2">
          <CodeBlock code={DOC_DARK_MODE} language="css" />
        </div>
        <p className="mt-3">
          An at-rule cannot appear in a selector list. A browser reading this
          discards the whole rule, so neither the <code>.dark</code> class nor
          the media query ever applies and dark mode silently does nothing. It is
          split into two separate rules in <code>theme.css</code> above, which is
          evidently what was meant.
        </p>
      </Callout>

      <Callout tone="info" title="What the variables reach">
        <p>
          The page&apos;s table lists eight custom properties with no defaults
          filled in. They are consumed by the built-in basic catalog&apos;s
          renderers. Anything drawn by a <em>custom</em> renderer — the cards on
          both A2UI routes here — is styled by that renderer&apos;s own Tailwind
          instead, so those variables have no effect on it. The font-family and{" "}
          <code>img</code> rules do apply either way, since they inherit.
        </p>
      </Callout>

      <Callout tone="info" title="The image selectors are example-specific">
        <p>
          <code>{`.a2ui-surface img[alt="On Time"]`}</code> and its{" "}
          <code>Delayed</code> twin come from the page&apos;s flight example,
          where the schema sets those alt texts. They are kept verbatim so the
          file matches the page, but nothing in this repo emits an image with
          either alt.
        </p>
      </Callout>
    </>
  );
}
