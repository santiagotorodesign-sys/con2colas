/**
 * scrollFX.js — animaciones de scroll: reveal escalado (IntersectionObserver)
 * y parallax suave 0.5x en elementos decorativos.
 * Respeta prefers-reduced-motion: si está activo, no anima nada.
 */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Aplica .reveal--visible a los elementos al entrar en viewport. */
function initReveal() {
  const targets = document.querySelectorAll(".reveal");
  if (!targets.length) return;

  // Con motion reducido o sin soporte: mostrar todo de inmediato
  if (REDUCED_MOTION.matches || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("reveal--visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("reveal--visible");
        observer.unobserve(entry.target); // solo anima una vez
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/** Parallax 0.5x: desplaza .parallax según su posición en viewport. */
function initParallax() {
  const items = [...document.querySelectorAll(".parallax")];
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // distancia del centro del elemento al centro del viewport
      const offset = (rect.top + rect.height / 2 - vh / 2) * 0.5;
      el.style.setProperty("--parallax-y", `${(offset * -0.15).toFixed(2)}px`);
    });
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  if (REDUCED_MOTION.matches) return; // sin parallax con motion reducido
  window.addEventListener("scroll", onScroll, { passive: true });
  update();
}

export function initScrollFX() {
  initReveal();
  initParallax();
}
