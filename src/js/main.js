/**
 * main.js — punto de entrada ES Modules.
 * Orquesta navegación, render de secciones dinámicas y lightbox.
 */

import { initNavigation } from "./modules/navigationUI.js";
import { initGallery } from "./modules/galleryUI.js";
import { initLightbox } from "./modules/lightboxUI.js";

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initLightbox();
  initGallery();
});
