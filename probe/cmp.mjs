import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
const [id, route, prompt, waitS = '90'] = process.argv.slice(2);
mkdirSync('videos/cmp', { recursive: true });
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const log = [];
p.on('console', m => { const t = m.text(); if ((m.type() === 'error' || /render_ui|no renderer|reject|Rejected/i.test(t)) && !/Date.now|enforce/.test(t)) log.push(`${m.type()}: ${t.slice(0, 300)}`); });
p.on('pageerror', e => log.push('PAGEERROR ' + String(e).slice(0, 300)));
await p.goto('http://localhost:3030/' + route, { waitUntil: 'domcontentloaded', timeout: 240000 });
await p.locator('textarea').first().waitFor({ timeout: 180000 }).catch(() => {});
await p.waitForTimeout(15000);
const ta = p.locator('textarea').first(); await ta.click(); await ta.pressSequentially(prompt, { delay: 2 }); await p.keyboard.press('Enter');
await p.waitForTimeout(Number(waitS) * 1000);
if (id === 'state-actions') { const btn = p.getByRole('button', { name: 'Add to cart' }); log.push('add buttons: ' + await btn.count()); if (await btn.count()) { await btn.first().click(); await p.waitForTimeout(3000); log.push('cart: ' + await p.locator('#cart').innerText()); log.push('inCart: ' + (await p.locator('[data-harness=in-cart]').allInnerTexts()).join(',')); } }
const info = await p.evaluate(() => ({
  surfaces: document.querySelectorAll('.a2ui-surface,[data-generative-ui-surface]').length,
  myCard: document.querySelectorAll('[data-harness=my-card]').length,
  airports: document.querySelectorAll('[data-harness=airport]').length,
  arrows: document.querySelectorAll('[data-harness=arrow]').length,
  imgs: document.querySelectorAll('article img').length,
  articles: document.querySelectorAll('article').length,
  fallback: !!document.querySelector('#fallback-row'),
  accent: (() => { const s = document.querySelector('.a2ui-surface'); return s ? getComputedStyle(s).getPropertyValue('--a2ui-color-accent') : null; })(),
  body: document.body.innerText.replace(/\s+/g, ' ').slice(0, 700),
}));
await p.screenshot({ path: `videos/cmp/${id}.png` });
writeFileSync(`videos/cmp/${id}.json`, JSON.stringify({ info, log }, null, 1));
console.log(id, JSON.stringify(info), '\n  LOG', log.slice(0, 6).join('\n  '));
await b.close();
