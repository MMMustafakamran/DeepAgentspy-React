import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on('console', m => { if (/analytics|error/i.test(m.type()+m.text()) && !/enforce|Date.now/.test(m.text())) console.log('CONSOLE', m.type(), m.text().slice(0, 200)); });
await p.goto('http://localhost:3030/prebuilt-components/chat-controls'); await p.waitForTimeout(10000);
const asks = p.getByRole('button', { name: 'Ask the assistant' });
console.log('ask buttons', await asks.count(), 'slot html:', await p.locator('#open-chat-button-slot').innerHTML());
const sb = p.locator('[data-testid="copilot-sidebar"]');
console.log('sidebar visible before', await sb.isVisible(), await sb.getAttribute('class'));
await asks.first().click(); await p.waitForTimeout(1500);
console.log('sidebar box after', JSON.stringify(await sb.boundingBox()));
await p.screenshot({ path: 'videos/cc-open.png' });
// close via sidebar close button, then reopen
await p.locator('[data-testid="copilot-close-button"]').first().click().catch(e=>console.log('close err', e.message.slice(0,80))); await p.waitForTimeout(1000);
console.log('sidebar box after close', JSON.stringify(await sb.boundingBox()));
// thumbs: use the embedded CopilotChat (last textarea)
const ta = p.locator('textarea').last(); await ta.click(); await ta.pressSequentially('Say hi in three words.'); await p.keyboard.press('Enter');
await p.waitForTimeout(20000);
const up = p.getByRole('button', { name: /Good response/i });
console.log('thumbs up buttons', await up.count(), 'down', await p.getByRole('button', { name: /Bad response/i }).count());
if (await up.count()) { await up.first().click(); await p.waitForTimeout(1000); }
await p.screenshot({ path: 'videos/cc-thumbs.png' });
await b.close();
