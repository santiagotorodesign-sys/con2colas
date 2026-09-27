const puppeteer = require('puppeteer-core');
(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    args: ['--no-sandbox','--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', m => { if (m.type()==='error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  const failed = [];
  page.on('requestfailed', r => failed.push(r.url()));
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r=>setTimeout(r,800));
  const info = await page.evaluate(() => ({
    heroImg: document.querySelector('.hero__img')?.src,
    heroImgOk: document.querySelector('.hero__img')?.complete && document.querySelector('.hero__img')?.naturalWidth>0,
    waHref: document.querySelector('.hero__actions .btn--primary')?.href,
    brandLogos: document.querySelectorAll('.brands__logo').length,
    logosOk: [...document.querySelectorAll('.brands__logo')].every(i=>i.complete&&i.naturalWidth>0),
  }));
  console.log(JSON.stringify(info), 'ERRORS:', errors, 'FAILED:', failed);
  await page.screenshot({ path: 'shot-hero.png' });
  await browser.close();
})();
