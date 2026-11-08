import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(process.argv[2]); await p.waitForTimeout(8000);
const ta = p.locator('textarea').first(); await ta.click(); await ta.pressSequentially('Say hi in three words.'); await p.keyboard.press('Enter');
await p.waitForTimeout(20000);
console.log(await p.evaluate(() => [...document.querySelectorAll('[data-testid],[data-message-role],[data-role]')].map(e => `${e.tagName} testid=${e.getAttribute('data-testid')} role=${e.getAttribute('data-message-role')||e.getAttribute('data-role')} :: ${(e.textContent||'').slice(0,40)}`).join('\n')));
await b.close();
