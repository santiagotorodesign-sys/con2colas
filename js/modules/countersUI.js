/**
 * countersUI.js — Animación de contadores del hero (UI only).
 * La lógica numérica pura se mantiene separada en countUp().
 */

/** Calcula el valor interpolado para un progreso dado (0..1). Lógica pura. */
export const countUp = (target, progress) =>
  Math.round(target * (1 - (1 - progress) ** 3)); // ease-out cúbico

const DURATION_MS = 1600;

const animateElement = (element) => {
  const target = Number(element.dataset.counter ?? 0);
  const start = performance.now();

  const frame = (now) => {
    const progress = Math.min((now - start) / DURATION_MS, 1);
    element.textContent = new Intl.NumberFormat("es-ES").format(countUp(target, progress));
    if (progress < 1) requestAnimationFrame(frame);
  };

  requestAnimationFrame(frame);
};

/** Anima los contadores cuando entran en viewport (una sola vez). */
export const initCounters = () => {
  const elements = document.querySelectorAll("[data-counter]");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateElement(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  elements.forEach((el) => observer.observe(el));
};
