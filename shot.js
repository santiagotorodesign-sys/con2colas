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
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await new Promise(r=>setTimeout(r,800));
  // click first add-to-cart to test counter
  await page.evaluate(() => document.querySelector('.product-card__add')?.click());
  const cart = await page.evaluate(() => ({
    count: document.querySelector('.cart__count')?.textContent,
    total: document.querySelector('.cart__total')?.textContent,
    features: document.querySelectorAll('.feature-card').length,
    products: document.querySelectorAll('.product-card').length,
    testimonials: document.querySelectorAll('.testimonial-card').length,
    resources: document.querySelectorAll('.resource-card').length,
    footerCols: document.querySelectorAll('.footer__col').length,
  }));
  console.log(JSON.stringify(cart), 'ERRORS:', errors);
  await page.screenshot({ path: 'shot-desktop.png', fullPage: true });
  await page.setViewport({ width: 390, height: 844 });
  await new Promise(r=>setTimeout(r,500));
  await page.screenshot({ path: 'shot-mobile.png', fullPage: true });
  await browser.close();
})();
