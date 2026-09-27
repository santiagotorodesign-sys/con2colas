/**
 * browser_scenarios.mjs — Escenarios de navegador real (Playwright) para las
 * pruebas de integración Python (tests/test_dom_integration.py).
 *
 * Renderiza src/index.html en Chromium headless con los módulos ES reales,
 * espera a que initGallery() monte el catálogo y devuelve un JSON con:
 *   - counts: nº de tarjetas renderizadas por sección
 *   - whatsapp: href/aria-label/target/rel del primer botón "Consultar por WhatsApp"
 *   - lightbox: apertura con click, iframe embebido, cierre con Escape y
 *               destrucción del iframe (detiene el video)
 *   - nav:      toggle móvil aria-expanded + cierre con Escape
 *   - errors:   errores de consora/página capturados
 *
 * Uso: node tests/js/browser_scenarios.mjs <BASE_URL> <CHROME_PATH>
 */

import { chromium } from "playwright-core";

const [, , baseUrl, chromePath] = process.argv;
if (!baseUrl || !chromePath) {
  console.error("uso: node browser_scenarios.mjs <BASE_URL> <CHROME_PATH>");
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  // Viewport móvil: reproduce las condiciones reales donde .nav-toggle es visible
  const page = await browser.newPage();
  await page.setViewportSize({ width: 390, height: 844 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  // initGallery monta tras requestAnimationFrame + setTimeout(250)
  await page.waitForSelector(".product-card", { timeout: 5000 });

  const result = { errors: [], counts: {}, whatsapp: null, lightbox: {}, nav: {} };

  result.counts = await page.evaluate(() => ({
    featureCards: document.querySelectorAll("#features-grid .feature-card").length,
    problems: document.querySelectorAll("#problems-list .problem").length,
    productCards: document.querySelectorAll(".product-card").length,
    waButtons: document.querySelectorAll(".product-card__wa").length,
    testimonials: document.querySelectorAll("#testimonials-grid .testimonial-card").length,
    resources: document.querySelectorAll("#resources-grid .resource-card").length,
    footerCols: document.querySelectorAll("#footer-cols .footer__col").length,
    skeletonsLeft: document.querySelectorAll(".skeleton").length,
    ariaBusyLeft: document.querySelectorAll("[aria-busy]").length,
  }));

  // Botón WhatsApp: contrato completo (href wa.me, pestaña nueva, rel seguro, aria-label)
  result.whatsapp = await page.evaluate(() => {
    const btn = document.querySelector(".product-card__wa");
    if (!btn) return null;
    return {
      href: btn.getAttribute("href"),
      target: btn.getAttribute("target"),
      rel: btn.getAttribute("rel"),
      ariaLabel: btn.getAttribute("aria-label"),
      text: btn.textContent.trim(),
      hasSvgIcon: !!btn.querySelector("svg.product-card__wa-icon"),
    };
  });

  // Lightbox: abrir -> iframe autoplay nocookie; Escape -> cerrar y matar iframe
  const openerVisible = await page.locator("#video-open").count();
  if (openerVisible) {
    await page.click("#video-open");
    await page.waitForSelector("#video-lightbox iframe", { timeout: 3000 });
    result.lightbox.openedWithIframe = true;
    result.lightbox.iframeSrc = await page.evaluate(
      () => document.querySelector("#video-lightbox iframe")?.src ?? ""
    );
    result.lightbox.hiddenFalse = await page.evaluate(
      () => !document.querySelector("#video-lightbox").hidden
    );
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    result.lightbox.closedByEscape = await page.evaluate(
      () => document.querySelector("#video-lightbox").hidden === true
    );
    result.lightbox.iframeDestroyed = await page.evaluate(
      () => document.querySelectorAll("#video-lightbox iframe").length === 0
    );
    result.lightbox.bodyNoScrollRemoved = await page.evaluate(
      () => !document.body.classList.contains("no-scroll")
    );
  } else {
    result.lightbox.skipped = "no #video-open button found";
  }

  // Navegación móvil: toggle abre y Escape cierra (si el botón es clicable)
  result.nav.skipped = null;
  try {
    await page.click(".nav-toggle", { timeout: 3000 });
    result.nav.expandedAfterClick = await page.evaluate(
      () => document.querySelector(".nav-toggle").getAttribute("aria-expanded")
    );
    result.nav.openClassApplied = await page.evaluate(
      () => document.getElementById("primary-nav")?.classList.contains("nav--open")
    );
    await page.keyboard.press("Escape");
    result.nav.collapsedAfterEscape = await page.evaluate(
      () => document.querySelector(".nav-toggle").getAttribute("aria-expanded")
    );
  } catch {
    result.nav.skipped = ".nav-toggle no clicable en este viewport";
  }

  result.errors = errors;
  process.stdout.write(JSON.stringify(result));
} finally {
  await browser.close();
}
