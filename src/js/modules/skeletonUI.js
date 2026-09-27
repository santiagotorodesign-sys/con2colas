/**
 * skeletonUI.js — estados de carga "shimmer" que imitan la estructura
 * exacta de la tarjeta de producto (imagen, título, texto, botón).
 * Cero pantallas en blanco: nunca un spinner genérico.
 */

const SKELETON_CARD = `
  <div class="skeleton-card" aria-hidden="true">
    <div class="skeleton skeleton-card__media"></div>
    <div class="skeleton skeleton-card__title"></div>
    <div class="skeleton skeleton-card__text"></div>
    <div class="skeleton skeleton-card__text"></div>
    <div class="skeleton skeleton-card__btn"></div>
  </div>
`;

/** Renderiza `count` skeletons en el contenedor dado. */
export function showSkeletons(container, count = 6) {
  if (!container) return;
  container.setAttribute("aria-busy", "true");
  container.innerHTML = Array.from({ length: count }, () => SKELETON_CARD).join("");
}

/** Limpia los skeletons y devuelve el contenedor al estado normal. */
export function hideSkeletons(container) {
  if (!container) return;
  container.removeAttribute("aria-busy");
  container.innerHTML = "";
}

/** Micro-interacción de confirmación: bounce único sobre un elemento. */
export function pulseOnce(element) {
  if (!element) return;
  element.classList.remove("bounce-once");
  // fuerza reflujo para reiniciar la animación aunque ya estuviera aplicada
  void element.offsetWidth;
  element.classList.add("bounce-once");
  element.addEventListener(
    "animationend",
    () => element.classList.remove("bounce-once"),
    { once: true }
  );
}
