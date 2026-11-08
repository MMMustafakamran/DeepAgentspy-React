import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('pageerror', e => console.log('PAGEERROR', String(e).slice(0, 300)));
await p.goto('http://localhost:3030/headless-threads/harness', { waitUntil: 'domcontentloaded', timeout: 240000 }); await p.waitForTimeout(40000);
const rn = p.getByRole('button', { name: 'Rename' });
console.log('rows', await rn.count());
console.log('first rows', (await p.locator('body').innerText()).split('\n').slice(0, 8).join(' / '));
if (await rn.count()) { await rn.first().click(); await p.waitForTimeout(4000); console.log('after rename', (await p.locator('body').innerText()).split('\n').slice(0, 4).join(' / ')); }
await p.screenshot({ path: 'videos/ht.png' });
await b.close();
