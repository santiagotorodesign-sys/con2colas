/**
 * lightboxUI.js — Lightbox accesible para reproducir el video de YouTube.
 * Fuente del enlace: comentario en Figma (node 34-1246):
 *   https://youtu.be/3xOdihWVptQ?si=11KqYVNZXEVcNoCH
 * La URL embebible se lee de [data-video-src] en el botón disparador,
 * manteniendo la configuración fuera de la lógica (separación datos/UI).
 */

const SELECTORS = {
  openButton: "#video-open",
  lightbox: "#video-lightbox",
  frameHost: "[data-lightbox-frame]",
  closeButtons: "[data-lightbox-close]",
};

/**
 * Convierte cualquier URL de YouTube (watch / youtu.be / embed)
 * en una URL de embed con autoplay. Lógica pura, sin DOM.
 * @param {string} url
 * @returns {string|null}
 */
export const toEmbedUrl = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube-nocookie\.com\/embed\/)([\w-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
  }
  return null;
};

const createVideoFrame = (src) => {
  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.title = "Reproductor de video de presentación";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.allowFullscreen = true;
  return iframe;
};

/**
 * Inicializa el lightbox: apertura desde el botón de video,
 * cierre con backdrop, botón ✕, tecla Escape, foco atrapado
 * y destrucción del <iframe> al cerrar (detiene la reproducción).
 */
export const initLightbox = () => {
  const openButton = document.querySelector(SELECTORS.openButton);
  const lightbox = document.querySelector(SELECTORS.lightbox);
  const frameHost = lightbox?.querySelector(SELECTORS.frameHost);

  if (!openButton || !lightbox || !frameHost) return;

  let lastFocusedElement = null;

  const close = () => {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightbox.classList.remove("lightbox--open");
    document.body.classList.remove("no-scroll");
    frameHost.innerHTML = ""; // detiene el video
    openButton.focus();
    document.removeEventListener("keydown", onKeydown);
  };

  const open = () => {
    const embedSrc = toEmbedUrl(openButton.dataset.videoSrc);
    if (!embedSrc) return;

    lastFocusedElement = document.activeElement;
    frameHost.innerHTML = "";
    frameHost.appendChild(createVideoFrame(embedSrc));
    lightbox.hidden = false;
    requestAnimationFrame(() =>
      lightbox.classList.add("lightbox--open")
    );
    document.body.classList.add("no-scroll");
    lightbox.querySelector(".lightbox__close").focus();
    document.addEventListener("keydown", onKeydown);
  };

  function onKeydown(event) {
    if (event.key === "Escape") {
      close();
      return;
    }
    // Trampa de foco simple dentro del diálogo
    if (event.key === "Tab") {
      const focusables = [...lightbox.querySelectorAll("button, iframe")];
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  openButton.addEventListener("click", open);
  lightbox
    .querySelectorAll(SELECTORS.closeButtons)
    .forEach((btn) => btn.addEventListener("click", close));
};
