import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_SNIPPET = `SURFACE_ID = "flight-search-results"
FLIGHT_SCHEMA = a2ui.load_schema(
    Path(__file__).parent / "a2ui" / "schemas" / "flight_schema.json"
)

@tool
def search_flights(flights: list[Flight]) -> str:
    """Search for flights and display results as rich cards."""
    return a2ui.render(
        operations=[
            a2ui.surface_update(SURFACE_ID, FLIGHT_SCHEMA),
            a2ui.data_model_update(SURFACE_ID, {"flights": flights}),
            a2ui.begin_rendering(SURFACE_ID, "root"),
        ],
        action_handlers={
            "book_flight": [ ... ],
            "*": [ ... ],
        },
    )`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A UI the model cannot get wrong. The component tree is authored ahead
          of time as JSON; the tool supplies only the data, so the surface
          appears the instant the tool returns with no schema generation in
          between. Compare against Dynamic Schema, where a second LLM writes the
          layout each time.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The tool returns a JSON string wrapping A2UI operations. The
          runtime&apos;s A2UI middleware recognises that container in the tool
          result and paints the surface; the model never learns it happened,
          which is why the tool&apos;s docstring has to tell it not to call again.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Find me a flight from SFO to JFK on United for around $289",
              "Show me a flight LHR to CDG on Air France, $120",
            ]}
            expect={
              <>
                A rendered itinerary card — airport codes either side of an
                arrow, an airline pill, a price, and a Book flight button. Not a
                JSON blob and not a plain-text description.
              </>
            }
            fail="A raw JSON dump in the chat means the operations container was not detected. An empty card means the catalogId in the agent does not match the one in catalog.ts."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="The page's Python does not run">
        <p>
          Four of the calls in its <code>search_flights</code> are not in{" "}
          <code>copilotkit 0.1.94</code>. This is the page&apos;s snippet:
        </p>
        <div className="mt-3">
          <CodeBlock code={DOC_SNIPPET} language="python" filename="the doc page" />
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-amber-300 text-xs uppercase tracking-wide dark:border-amber-800">
                <th className="pb-2 pr-4 font-medium">Page</th>
                <th className="pb-2 font-medium">copilotkit 0.1.94</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr>
                <td className="py-1.5 pr-4">a2ui.surface_update</td>
                <td className="py-1.5">a2ui.update_components</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4">a2ui.data_model_update</td>
                <td className="py-1.5">a2ui.update_data_model</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4">a2ui.begin_rendering</td>
                <td className="py-1.5">a2ui.create_surface</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-4">render(…, action_handlers=…)</td>
                <td className="py-1.5">render(operations=…) — no such parameter</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          <code>create_surface</code> is not simply <code>begin_rendering</code>{" "}
          renamed. It carries the catalog id and has to come <em>first</em>,
          because the catalog is what the renderer resolves component names
          against. <code>render</code> keeps its <code>operations=</code> keyword,
          so that half of the call is untouched.
        </p>
      </Callout>

      <Callout tone="warn" title="The Book button is inert">
        <p>
          <code>action_handlers</code> is the whole of the page&apos;s
          &ldquo;Action handler details&rdquo; section, and it does not exist.
          The button in <code>flight_schema.json</code> declares its{" "}
          <code>book_flight</code> action for fidelity, but nothing swaps the
          surface to the booked schema when it is clicked.{" "}
          <code>booked_schema.json</code> is loaded anyway so the swap can be
          wired the moment the SDK grows the parameter.
        </p>
        <p className="mt-2">
          The frontend escape hatch the Advanced page offers for this —{" "}
          <code>useA2UIActionHandler</code> — is also missing from{" "}
          <code>@copilotkit/react-core 1.66.2</code>. See that route.

          SCHEMA IS ALSO MISSING FROM THE DOCS, SO THE PAGE IS INCOMPLETE.
        </p>
      </Callout>

      <Panel title="The demo's page">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" />
      </Panel>

      <Panel
        title="The agent"
        description="The page's structure, on the API that ships."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/a2ui_fixed.py", region: "schema-load" },
            { file: "backend/src/a2ui_fixed.py", region: "search-flights" },
            { file: "backend/src/a2ui_fixed.py", region: "register" },
          ]}
        />
      </Panel>

      <Panel
        title="The schemas"
        description="Supplied for this repo — the page says to design them in the A2UI Composer and never prints one."
      >
        <SourceCodeGroup
          files={[
            { file: "backend/src/a2ui_schemas/flight_schema.json" },
            { file: "backend/src/a2ui_schemas/booked_schema.json" },
          ]}
        />
      </Panel>

      {/* <Panel
        title="The catalog"
        description="Component names in the schema mean nothing without renderers. definitions declares the vocabulary and its prop shapes; renderers implements it; createCatalog binds the two under an id the agent must also use."
      >
        <SourceCodeGroup
          files={[
            {
              file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/catalog.ts",
            },
            {
              file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts",
            },
            {
              file: "frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx",
            },
          ]}
          note={
            <>
              The renderers import <code>Card</code>, <code>Badge</code>,{" "}
              <code>Button</code> and <code>Separator</code> from{" "}
              <code>_components/primitives.tsx</code>. That file is
              self-defined — plain Tailwind, no CopilotKit API — and is marked as
              such at the top of it.
            </>
          }
        />
      </Panel>

      <Panel
        title="The runtime"
        description="injectA2UITool: false, scoped to this one agent."
      >
        <SourceCode file="frontend/src/app/api/copilotkit/route.ts" />
      </Panel>

      <Callout tone="info" title="Where injectA2UITool lives">
        <p>
          The page shows{" "}
          <code>
            new CopilotRuntime({"{ agents: { default: myAgent }, a2ui: { … } }"})
          </code>{" "}
          with no import. That option exists on both the v1 runtime (used here,
          and by the Quickstart) and the v2 one, but{" "}
          <code>agents</code> keyed by <code>default</code> is not how either the
          Quickstart or this repo names agents — here it is the graph id from{" "}
          <code>langgraph.json</code>.
        </p>
      </Callout> */}
    </>
  );
}
