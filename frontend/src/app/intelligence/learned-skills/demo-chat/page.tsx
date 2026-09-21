"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Automatic learned skill delivery, against this repo's Quickstart agent.
 *
 * There is no adapter to mount. The page's LangGraph Python adapter,
 * `copilotkit-intelligence-langgraph`, is not on PyPI (nor is the base client
 * it says Python uses, `copilotkit-intelligence-runtime`), so
 * `create_skill_registry_middleware` cannot be imported and the two tools it
 * would register never exist.
 *
 * The BuiltInAgent row added on 2026-09-21 is not a way round that. It is a
 * different agent, not an adapter for this one -- taking it would mean dropping
 * the Deep Agent this section is about -- and its `learnedSkills` option does
 * not exist on the installed runtime anyway. Both of its snippets are in
 * `../built-in-agent-classic.ts` and `../built-in-agent-factory.ts`, verbatim
 * and uncompilable.
 *
 * So the demo shows the absence rather than faking the presence: the agent is
 * this repo's normal `sample_agent`, and the prompt asks for the exact tool
 * names the page reserves. The agent answers from its own instructions with no
 * tool call, which is what a reader following the page ends up with.
 *
 * The tool names below are quoted from the page's "Read tools" section. They
 * are listed here as text, not registered — registering look-alike tools would
 * make the page appear to work and destroy the finding.
 */

const RESERVED_TOOLS = [
  "copilotkit_load_skill(skill_name)",
  "copilotkit_read_skill_file(skill_name, path)",
] as const;

function SkillToolProbe() {
  return (
    <div className="shrink-0 border-b border-slate-200 px-3 py-3 dark:border-slate-800">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Tools the adapter would register
      </h2>
      <table data-testid="skill-tool-probe" className="w-full text-left text-xs">
        <tbody className="font-mono">
          {RESERVED_TOOLS.map((tool) => (
            <tr
              key={tool}
              className="border-t border-slate-200 first:border-0 dark:border-slate-800"
            >
              <th className="py-1 pr-3 font-medium text-slate-500">{tool}</th>
              <td data-testid="skill-tool-status" className="py-1 text-rose-600 dark:text-rose-400">
                not registered — adapter not installable
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 font-mono text-[11px] text-slate-500">
        uv pip install copilotkit-intelligence-langgraph → not found in the package registry
      </p>
    </div>
  );
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/intelligence/learned-skills"
      subtitle="skill delivery · adapter unavailable"
    >
      <div className="flex h-full flex-col">
        <SkillToolProbe />
        <div className="min-h-0 flex-1">
          <CopilotChat agentId="sample_agent" />
        </div>
      </div>
    </DemoFrame>
  );
}
