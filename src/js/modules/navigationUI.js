/**
 * navigationUI.js — menú móvil (hamburguesa) y resaltado de link activo
 * según la sección visible (IntersectionObserver).
 */

export function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("nav--open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Cerrar al elegir una opción o al salir del foco con Escape
  nav.addEventListener("click", (e) => {
    if (e.target.closest(".nav__link")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  highlightActiveLink();
}

/** Marca con .nav__link--active el enlace de la sección más visible. */
function highlightActiveLink() {
  const links = [...document.querySelectorAll(".nav__link[href^='#']")];
  if (!links.length || !("IntersectionObserver" in window)) return;

  const sections = links
    .map((l) => document.querySelector(l.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) =>
          l.classList.toggle(
            "nav__link--active",
            l.getAttribute("href") === `#${entry.target.id}`
          )
        );
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((s) => observer.observe(s));
}
