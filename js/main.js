/**
 * main.js — Punto de entrada (ES Module).
 * Orquesta los módulos de UI; no contiene lógica de negocio ni de datos.
 */

import { initGallery } from "./modules/galleryUI.js";
import { initMobileNav, initScrollSpy } from "./modules/navigationUI.js";
import { initCounters } from "./modules/countersUI.js";
import { initSignupForm } from "./modules/formUI.js";

const bootstrap = () => {
  initMobileNav({
    nav: document.querySelector("#primary-nav"),
    toggle: document.querySelector("#nav-toggle"),
  });

  initScrollSpy({
    links: [...document.querySelectorAll(".nav__link")],
  });

  initGallery({
    container: document.querySelector("#gallery"),
    filterGroup: document.querySelector(".filter"),
  });

  initCounters();

  initSignupForm({
    form: document.querySelector("#signup-form"),
    input: document.querySelector("#signup-email"),
    feedback: document.querySelector("#signup-feedback"),
  });
};

document.addEventListener("DOMContentLoaded", bootstrap);
