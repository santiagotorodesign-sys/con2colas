import { chromium } from 'playwright-core';
const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
  args: ['--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.screenshot({ path: 'preview-hero.png' });
await page.screenshot({ path: 'preview-full.png', fullPage: true });
console.log('title:', await page.title());
await browser.close();
