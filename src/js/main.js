/**
 * main.js — punto de entrada ES Modules.
 * Orquesta navegación, render dinámico, lightbox y efectos de scroll.
 */

import { initNavigation } from "./modules/navigationUI.js";
import { initGallery } from "./modules/galleryUI.js";
import { initLightbox } from "./modules/lightboxUI.js";
import { initScrollFX } from "./modules/scrollFX.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initLightbox();
  initGallery();
  // El reveal se inicializa tras el render dinámico (los nodos animados ya existen)
  window.setTimeout(initScrollFX, 300);
});
