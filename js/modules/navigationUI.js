/**
 * navigationUI.js — Capa de UI del menú (hamburguesa + estado activo).
 */

const OPEN_CLASS = "nav--open";
const TOGGLE_OPEN_CLASS = "nav-toggle--open";

/** Alterna la visibilidad del menú móvil y sincroniza ARIA. */
export const initMobileNav = ({ nav, toggle }) => {
  if (!nav || !toggle) return;

  const setOpen = (open) => {
    nav.classList.toggle(OPEN_CLASS, open);
    toggle.classList.toggle(TOGGLE_OPEN_CLASS, open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  };

  toggle.addEventListener("click", () => {
    setOpen(!nav.classList.contains(OPEN_CLASS));
  });

  // Cierra el menú al elegir una opción (mejora UX en móvil).
  nav.addEventListener("click", (event) => {
    if (event.target.closest(".nav__link")) setOpen(false);
  });

  // Accesibilidad: cerrar con Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains(OPEN_CLASS)) {
      setOpen(false);
      toggle.focus();
    }
  });
};

/** Marca el enlace correspondiente a la sección visible al hacer scroll. */
export const initScrollSpy = ({ links, offset = 80 }) => {
  if (!links.length) return;

  const sections = links
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);

  const onScroll = () => {
    const scrollY = window.scrollY + offset;
    let current = sections[0];

    sections.forEach((section) => {
      if (section.offsetTop <= scrollY) current = section;
    });

    links.forEach((link) => {
      link.classList.toggle(
        "nav__link--active",
        current && link.hash === `#${current.id}`
      );
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
};
