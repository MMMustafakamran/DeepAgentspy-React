import { chromium } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext();
await ctx.addInitScript(() => {
  const calls = []; window.__wm = calls; window.__tools = {};
  const mc = { registerTool(t, o) { calls.push({ name: t?.name, desc: t?.description, ann: t?.annotations, schema: t?.inputSchema }); window.__tools[t.name] = t; return Promise.resolve(); }, unregisterTool(n) { calls.push({ unregister: n }); return Promise.resolve(); } };
  Object.defineProperty(document, 'modelContext', { value: mc, configurable: true });
});
const p = await ctx.newPage();
p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 300)));
await p.goto('http://localhost:3030/webmcp', { waitUntil: 'domcontentloaded', timeout: 240000 }); await p.waitForTimeout(15000);
console.log('registerTool calls:', JSON.stringify(await p.evaluate(() => window.__wm)));
console.log('execute result:', await p.evaluate(async () => { const t = window.__tools['searchOrders']; return t ? await t.execute({ status: 'shipped' }, {}) : 'no tool'; }));
await b.close();
