const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({ executablePath: '/root/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });

  // 1. Logo real cargado
  const logo = await page.$eval('.header__logo-img', el => ({ src: el.getAttribute('src'), alt: el.alt, w: el.naturalWidth, h: el.naturalHeight }));
  console.log('LOGO:', JSON.stringify(logo));

  // 2. Sin carrito / Sign In
  const cartCount = await page.$$eval('.cart, .cart__count, .cart__total', els => els.length).catch(() => 0);
  const signIn = await page.$$eval('a', els => els.filter(e => e.textContent.includes('Sign In')).length);
  console.log('CART_REFS:', cartCount, 'SIGNIN:', signIn);

  // 3. RRSS en header con enlaces correctos
  const socials = await page.$$eval('.header__social-link', els => els.map(e => ({ href: e.href, target: e.target, rel: e.rel, size: (()=>{const s=e.querySelector('svg');return s?s.width.baseVal.value+'x'+s.height.baseVal.value:'-';})(), color: getComputedStyle(e).color })));
  console.log('SOCIALS:', JSON.stringify(socials, null, 1));

  // 4. Botones WhatsApp: cantidad + href de uno de prueba
  const waBtns = await page.$$eval('.product-card__wa', els => els.map(e => ({ text: e.textContent.trim(), href: e.href })));
  console.log('WA_BUTTONS:', waBtns.length);
  console.log('WA_EXAMPLE:', waBtns[0] && waBtns[0].href);
  console.log('WA_TEXT_OK:', waBtns.every(b => b.text === 'Consultar por WhatsApp'));
  console.log('WA_GREEN:', await page.$eval('.product-card__wa', e => getComputedStyle(e).backgroundColor));

  // 5. Sin "Añadir al carrito"
  const anyAdd = await page.$$eval('*', els => els.filter(e => e.children.length===0 && e.textContent.trim()==='Añadir al carrito').length);
  console.log('ANADIR_AL_CARRITO_REFS:', anyAdd);

  await page.screenshot({ path: 'shot-header-final.png', clip: { x: 0, y: 0, width: 1440, height: 120 } });
  const prod = await page.$('#paseo'); if (prod) await prod.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'shot-products-wa.png' });
  console.log('CONSOLE_ERRORS:', errors.length ? errors : 'ninguno');
  await browser.close();
})();
