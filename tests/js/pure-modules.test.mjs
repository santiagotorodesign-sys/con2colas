/**
 * Pruebas unitarias de los módulos JS puros (sin DOM):
 *   - whatsappButton.buildWhatsAppURL
 *   - lightboxUI.toEmbedUrl
 *   - icons.icon
 *   - content.js (invariantes de datos)
 *
 * Ejecución:  node --test tests/js/
 */

import test from "node:test";
import assert from "node:assert/strict";

import {
  buildWhatsAppURL,
  WHATSAPP_NUMBER,
} from "../../src/js/modules/whatsappButton.js";
import { toEmbedUrl } from "../../src/js/modules/lightboxUI.js";
import { icon } from "../../src/js/modules/icons.js";
import {
  features,
  problems,
  testimonials,
  resources,
  footerColumns,
} from "../../src/js/modules/content.js";

/* ---------------- whatsappButton: lógica pura de URL ---------------- */

test("buildWhatsAppURL usa el número oficial en un enlace wa.me", () => {
  const url = new URL(buildWhatsAppURL({ name: "Kong Classic" }));
  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, `/${WHATSAPP_NUMBER}`);
});

test("buildWhatsAppURL incluye el nombre del producto codificado", () => {
  const url = buildWhatsAppURL({ name: "Arnés Air Gentle" });
  const message = decodeURIComponent(new URL(url).searchParams.get("text"));
  assert.match(message, /Arnés Air Gentle/);
  assert.match(message, /^Hola Con2colas!/);
  assert.match(message, /¿Podrían asesorarme\?$/);
});

test("buildWhatsAppURL agrega color y tamaño cuando existen", () => {
  const url = buildWhatsAppURL({
    name: "LickiMat",
    color: "Azul",
    size: "Grande",
  });
  const message = decodeURIComponent(new URL(url).searchParams.get("text"));
  assert.match(message, /LickiMat \(color Azul, tamaño Grande\)/);
});

test("buildWhatsAppURL omite detalles ausentes sin paréntesis vacíos", () => {
  const message = decodeURIComponent(
    new URL(buildWhatsAppURL({ name: "Solo Nombre" })).searchParams.get("text")
  );
  assert.ok(!message.includes("("), `no debería haber paréntesis: ${message}`);
});

test("buildWhatsAppURL con solo color muestra '(color X)'", () => {
  const message = decodeURIComponent(
    new URL(buildWhatsAppURL({ name: "X", color: "Rojo" })).searchParams.get("text")
  );
  assert.match(message, /X \(color Rojo\)/);
});

test("buildWhatsAppURL codifica caracteres especiales (emoji, espacios)", () => {
  const url = buildWhatsAppURL({ name: "Pelota & Hueso" });
  // El signo '&' debe ir escapado para no romper los query params
  assert.ok(!url.slice(url.indexOf("?text=")).includes("& "), "espacios sin codificar");
  const decoded = decodeURIComponent(url.split("?text=")[1]);
  assert.match(decoded, /Pelota & Hueso|Pelota %26 Hueso/);
});

/* ---------------- lightboxUI: conversor puro de URLs de YouTube ---------------- */

test("toEmbedUrl convierte youtube.com/watch", () => {
  assert.equal(
    toEmbedUrl("https://www.youtube.com/watch?v=3xOdihWVptQ"),
    "https://www.youtube-nocookie.com/embed/3xOdihWVptQ?autoplay=1&rel=0"
  );
});

test("toEmbedUrl convierte youtu.be", () => {
  assert.equal(
    toEmbedUrl("https://youtu.be/3xOdihWVptQ?si=11KqYVNZXEVcNoCH"),
    "https://www.youtube-nocookie.com/embed/3xOdihWVptQ?autoplay=1&rel=0"
  );
});

test("toEmbedUrl pasa through una URL nocookie existente", () => {
  assert.equal(
    toEmbedUrl("https://www.youtube-nocookie.com/embed/abc12345"),
    "https://www.youtube-nocookie.com/embed/abc12345?autoplay=1&rel=0"
  );
});

test("toEmbedUrl devuelve null para URLs ajenas o vacías", () => {
  assert.equal(toEmbedUrl("https://vimeo.com/12345"), null);
  assert.equal(toEmbedUrl(""), null);
  assert.equal(toEmbedUrl(null), null);
  assert.equal(toEmbedUrl(undefined), null);
});

test("toEmbedUrl ignora IDs demasiado cortos (<6 caracteres)", () => {
  assert.equal(toEmbedUrl("https://youtu.be/abc"), null);
});

/* ---------------- icons: generador de SVG ---------------- */

test("icon() devuelve un <svg> con el tamaño pedido", () => {
  const svg = icon("heart", 32);
  assert.match(svg, /^<svg width="32" height="32"/);
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /<\/svg>$/);
});

test("icon() por defecto usa 24px", () => {
  assert.match(icon("brain"), /width="24" height="24"/);
});

test("icon() hace fallback a 'spark' para nombres desconocidos", () => {
  const known = icon("corazón-inexistente");
  assert.equal(known.replace(/spark/g, ""), icon("spark").replace(/spark/g, ""));
  assert.match(known, /circle cx="12" cy="12" r="3"/); // el círculo central de spark
});

test("todos los íconos usados en content.js tienen path propio (no fallback)", () => {
  const usedIcons = [
    ...features.map((f) => f.icon),
    ...resources.map((_, i) => ["pdf", "play", "check"][i] ?? "spark"),
  ];
  for (const name of usedIcons) {
    if (name === "spark") continue;
    assert.notEqual(icon(name), icon("spark"), `ícono '${name}' cae al fallback`);
  }
});

/* ---------------- content.js: invariantes de datos ---------------- */

test("features: cada una tiene icono, título y texto no vacíos", () => {
  assert.ok(features.length > 0);
  for (const f of features) {
    assert.ok(f.icon && f.title && f.text, JSON.stringify(f));
  }
});

test("problems: ids únicos, 3 productos c/u con campos completos", () => {
  const ids = problems.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, "ids de problemas duplicados");
  for (const p of problems) {
    assert.equal(p.products.length, 3, `problema ${p.id} debe listar 3 productos`);
    for (const prod of p.products) {
      assert.ok(prod.name && prod.img, "producto sin nombre o imagen");
      assert.equal(typeof prod.price, "number");
      assert.ok(prod.price >= 0, `precio negativo en ${prod.name}`);
    }
  }
});

test("testimonials, resources y footerColumns no están vacíos", () => {
  assert.ok(testimonials.length > 0 && resources.length > 0);
  assert.ok(footerColumns.length > 0);
  for (const t of testimonials) assert.ok(t.name && t.text && t.avatar);
  for (const r of resources) assert.ok(r.title && r.href && r.cta);
  for (const col of footerColumns) {
    assert.ok(col.title && Array.isArray(col.links) && col.links.length > 0);
  }
});
