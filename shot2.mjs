import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('requestfailed', r => errors.push('REQ FAIL: ' + r.url()));
await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
// Verificar contenido renderizado por JS (galería dinámica)
const cards = await page.locator('.card-project').count();
const chips = await page.locator('.filter__btn').count();
const counters = await page.$$eval('.stat__value', els => els.map(e => e.textContent.trim()));
console.log(JSON.stringify({ cards, chips, counters, errors }, null, 2));
// Probar filtro "Diseño"
await page.locator('.filter__btn', { hasText: 'Diseño' }).click();
await page.waitForTimeout(400);
console.log('tras filtro Diseño -> tarjetas visibles:', await page.locator('.card-project:visible').count());
await browser.close();
