/**
 * Finding probes — one entry per open FINDINGS.md item that a package update
 * (rather than a doc change) could fix.
 *
 * CI drops the lockfiles and installs the newest allowed versions daily, so a
 * finding can quietly stop reproducing with no doc drift at all. Each probe
 * checks the AS-PUBLISHED variant of its page only (never a fixed sibling tab)
 * and reports what it saw. ci/run-probes.mjs does the classifying.
 *
 * Contract:
 *   key      FINDINGS.md number
 *   id       short slug
 *   page     human page name
 *   kind     'browser' (a Playwright page is passed to run)
 *   route    path under the frontend base URL
 *   run(page, { url }) -> { broken: boolean, rendered: boolean, evidence: string }
 *            `rendered` must be true only when the page demonstrably loaded and
 *            connected; possibly-fixed requires broken=false AND rendered=true.
 *            Throw when the outcome is ambiguous -> classified probe-error.
 *
 * Adding #3 (interrupt-based, "Two, dispatched by type" tab: console
 * `useInterrupt enabled predicate threw`) or #9 (shared state language) is a
 * new key here with its own run(); nothing in the runner changes.
 */

export const PROBES = {
  22: {
    id: 'frontend-cards-default-agent',
    page: 'Frontend-Driven Cards',
    kind: 'browser',
    route: '/generative-ui/frontend-cards/demo-chat',
    fixedWhen: "'default' agent error gone",
    async run(page, { url }) {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
      const thrown = page.locator('[data-testid=provider-error]');
      const state = page.locator('[data-testid=agent-state]');

      // Either the published provider throws after runtime sync, or the
      // watcher reports a ready agent. Nothing else counts as an outcome.
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        if (await thrown.isVisible().catch(() => false)) {
          const text = ((await thrown.textContent().catch(() => '')) ?? '').trim();
          if (/Agent 'default' not found/.test(text)) {
            return { broken: true, rendered: true, evidence: `provider-error: ${text.slice(0, 200)}` };
          }
          throw new Error(`published provider threw something else: ${text.slice(0, 200)}`);
        }
        const s = ((await state.textContent().catch(() => '')) ?? '').trim();
        if (s.includes('isReady true')) {
          return { broken: false, rendered: true, evidence: `no provider-error; agent-state "${s}"` };
        }
        await page.waitForTimeout(500);
      }
      const s = ((await state.textContent().catch(() => '')) ?? '').trim();
      throw new Error(`neither provider-error nor a ready agent within 60s (agent-state: "${s || 'absent'}")`);
    },
  },
};
