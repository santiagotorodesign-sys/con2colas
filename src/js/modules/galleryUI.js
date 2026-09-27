/**
 * galleryUI.js — renderiza secciones dinámicas desde content.js:
 * características, problemas+productos, testimonios, recursos y footer.
 */

import { icon } from "./icons.js";
import { createWhatsAppButton } from "./whatsappButton.js";
import { showSkeletons, hideSkeletons } from "./skeletonUI.js";
import {
  features,
  problems,
  testimonials,
  resources,
  footerColumns,
} from "./content.js";

const IMG_BASE = "/images/";

/** Helper para crear elementos con markup interno. */
function el(tag, className, html = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.innerHTML = html;
  return node;
}

/* ---------- Características ---------- */
function renderFeatures() {
  const grid = document.getElementById("features-grid");
  if (!grid) return;

  features.forEach((f) => {
    const card = el("li", "feature-card");
    card.innerHTML = `
      <span class="feature-card__icon">${icon(f.icon)}</span>
      <h3 class="feature-card__title">${f.title}</h3>
      <p class="feature-card__text">${f.text}</p>`;
    grid.appendChild(card);
  });
}

/* ---------- Problemas + productos ---------- */
function renderProblems() {
  const list = document.getElementById("problems-list");
  if (!list) return;

  problems.forEach((p) => {
    const block = el("article", "problem");
    block.id = p.id;

    // CAMBIO 3: cada tarjeta usa el componente reutilizable WhatsAppButton
    // ("Consultar por WhatsApp" con mensaje prellenado dinámico).
    const cards = p.products
      .map(
        (prod, i) => `
        <li class="product-card">
          <div class="product-card__media">
            <img class="product-card__img" src="${IMG_BASE}${prod.img}"
                 alt="${prod.name}" loading="lazy" width="380" height="285" />
          </div>
          <h4 class="product-card__title">${prod.name}</h4>
          <p class="product-card__price">$${prod.price.toFixed(2)}</p>
          <div class="product-card__actions" data-wa-slot="${i}"></div>
        </li>`
      )
      .join("");

    block.innerHTML = `
      <header class="problem__head">
        <div>
          <h3 class="problem__title">${p.title}</h3>
          <p class="problem__desc">${p.desc}</p>
        </div>
        <a href="#contacto" class="btn btn--ghost btn--sm">Ver más →</a>
      </header>
      <ul class="problem__grid" role="list">${cards}</ul>
      <hr class="problem__divider" />`;

    // Insertar los botones de WhatsApp (componente reutilizable)
    block.querySelectorAll("[data-wa-slot]").forEach((slot) => {
      slot.appendChild(createWhatsAppButton(p.products[Number(slot.dataset.waSlot)]));
    });

    list.appendChild(block);
  });
}

/* ---------- Testimonios ---------- */
function renderTestimonials() {
  const grid = document.getElementById("testimonials-grid");
  if (!grid) return;

  testimonials.forEach((t) => {
    const card = el("li", "testimonial-card");
    card.innerHTML = `
      <span class="testimonial-card__quote-icon" aria-hidden="true">${icon("quote", 26)}</span>
      <blockquote class="testimonial-card__text">${t.text}</blockquote>
      <figcaption class="testimonial-card__author">
        <img class="testimonial-card__avatar" src="${IMG_BASE}${t.avatar}"
             alt="Foto de ${t.name}" loading="lazy" width="48" height="48" />
        <div>
          <p class="testimonial-card__name">${t.name}</p>
          <p class="testimonial-card__role">${t.role}</p>
        </div>
      </figcaption>`;
    grid.appendChild(card);
  });
}

/* ---------- Recursos gratuitos ---------- */
function renderResources() {
  const grid = document.getElementById("resources-grid");
  if (!grid) return;

  const icons = ["pdf", "play", "check"];
  resources.forEach((r, i) => {
    const card = el("li", "resource-card");
    card.innerHTML = `
      <span class="feature-card__icon">${icon(icons[i] ?? "spark")}</span>
      <h3 class="resource-card__title">${r.title}</h3>
      <p class="resource-card__text">${r.text}</p>
      <a class="resource-card__link" href="${r.href}">${r.cta} →</a>`;
    grid.appendChild(card);
  });
}

/* ---------- Footer ---------- */
function renderFooter() {
  const cols = document.getElementById("footer-cols");
  if (!cols) return;

  footerColumns.forEach((col) => {
    const wrap = el("div", "footer__col");
    wrap.innerHTML = `
      <h3 class="footer__col-title">${col.title}</h3>
      <ul class="footer__list" role="list">
        ${col.links.map((l) => `<li><a class="footer__link" href="#">${l}</a></li>`).join("")}
      </ul>`;
    cols.appendChild(wrap);
  });
}

/**
 * Inicializa todas las secciones dinámicas.
 * Muestra skeleton shimmer mientras se montan los datos (cero pantallas en blanco).
 */
export function initGallery() {
  const targets = ["features-grid", "problems-list", "testimonials-grid"].map((id) =>
    document.getElementById(id)
  );
  targets.forEach((t) => t && showSkeletons(t, 3));

  // Simula el tick de render para que el skeleton sea perceptible sin retrasar UX
  requestAnimationFrame(() => {
    window.setTimeout(() => {
      targets.forEach((t) => t && hideSkeletons(t));
      renderFeatures();
      renderProblems();
      renderTestimonials();
      renderResources();
      renderFooter();
    }, 250);
  });
}
