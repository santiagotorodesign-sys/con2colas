const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);

  // 1. Header transparente en reposo
  const bgTop = await page.evaluate(() => getComputedStyle(document.querySelector('.header')).backgroundColor);
  console.log('HEADER top bg:', bgTop, bgTop === 'rgba(0, 0, 0, 0)' ? '✅' : '❌');

  // 2. Glassmorphism al scrollear >50px
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(400);
  const scrolled = await page.evaluate(() => ({
    cls: document.querySelector('.header').classList.contains('header--scrolled'),
    blur: getComputedStyle(document.querySelector('.header')).backdropFilter
  }));
  console.log('HEADER scrolled:', JSON.stringify(scrolled), scrolled.cls && scrolled.blur.includes('blur') ? '✅' : '❌');

  // 3. Reveal on scroll aplicado a grids dinámicos
  await page.evaluate(() => document.querySelector('#testimonios').scrollIntoView());
  await page.waitForTimeout(900);
  const reveal = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.reveal-group .reveal, .reveal--visible')];
    return { visible: document.querySelectorAll('.reveal--visible').length, total: document.querySelectorAll('.reveal').length };
  });
  console.log('REVEAL:', JSON.stringify(reveal), reveal.visible >= 5 ? '✅' : '❌');

  // 4. Skeletons ya no presentes tras el render
  const skel = await page.evaluate(() => document.querySelectorAll('.skeleton-card').length);
  console.log('SKELETON cleanup:', skel, skel === 0 ? '✅' : '❌');

  // 5. Parallax con --parallax-y actualizado
  const px = await page.evaluate(() => getComputedStyle(document.querySelector('.hero__img.parallax')).transform);
  console.log('PARALLAX transform:', px !== 'none' ? '✅' : '⚠️', px.slice(0, 40));

  // 6. prefers-reduced-motion: sin animaciones
  const ctx2 = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  await p2.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(600);
  const rm = await p2.evaluate(() => {
    const el = document.querySelector('.cta__inner.reveal');
    return { op: getComputedStyle(el).opacity, dur: getComputedStyle(el).transitionDuration };
  });
  console.log('REDUCED-MOTION:', JSON.stringify(rm), rm.op === '1' ? '✅' : '❌');

  // 7. Nav underline: se expande desde el centro (origin == ancho/2)
  const navInfo = await page.evaluate(() => {
    const link = document.querySelector('.nav__link');
    const cs = getComputedStyle(link, '::after');
    return { o: cs.transformOrigin, w: cs.width };
  });
  const half = parseFloat(navInfo.w) / 2;
  const centered = Math.abs(parseFloat(navInfo.o) - half) < 1.5;
  console.log('NAV::AFTER from-center:', JSON.stringify(navInfo), centered ? String.fromCharCode(9989) : String.fromCharCode(10060));

  console.log('CONSOLE ERRORS:', errors.length === 0 ? '✅ 0' : '❌ ' + errors.join(' | '));
  await page.screenshot({ path: 'shot-ux-scrolled.png' });
  await browser.close();
})();
