import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const counters = await page.$$eval('.hero__stat-value', els => els.map(e => e.textContent.trim()));
console.log(JSON.stringify({ counters, errors }));
await page.screenshot({ path: 'preview-hero.png' });
await page.screenshot({ path: 'preview-full.png', fullPage: true });
// Mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await mob.waitForTimeout(1500);
await mob.screenshot({ path: 'preview-mobile.png' });
await browser.close();
