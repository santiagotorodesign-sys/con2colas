/**
 * galleryUI.js — Capa de UI de la galería.
 * Renderiza tarjetas desde datos y gestiona el filtrado por categoría.
 * (La lógica de datos vive en ./projects.js; aquí solo se toca el DOM.)
 */

import { getProjects, filterProjects, getCategoryLabel, formatNumber } from "./projects.js";

/** Genera el HTML de una tarjeta de proyecto a partir de sus datos. */
const buildCardMarkup = (project) => `
  <article class="card-project" data-category="${project.category}" role="listitem">
    <img
      class="card-project__media"
      src="${project.image}"
      alt="Captura del proyecto ${project.title}"
      width="400"
      height="300"
      loading="lazy"
    />
    <div class="card-project__body">
      <span class="card-project__category">${getCategoryLabel(project.category)}</span>
      <h3 class="card-project__title">${project.title}</h3>
      <p class="card-project__desc">${project.description}</p>
      <div class="card-project__meta">
        <span>${project.author}</span>
        <span class="card-project__likes" aria-label="${formatNumber(project.likes)} me gusta">
          ♥ ${formatNumber(project.likes)}
        </span>
      </div>
    </div>
  </article>
`;

/** Renderiza todas las tarjetas en el contenedor de la galería. */
export const renderGallery = (container) => {
  container.innerHTML = getProjects().map(buildCardMarkup).join("");
};

/** Muestra u oculta tarjetas según la categoría elegida. */
export const applyFilter = (container, category) => {
  const visibleIds = new Set(filterProjects(category).map((p) => p.title));

  container.querySelectorAll(".card-project").forEach((card) => {
    const title = card.querySelector(".card-project__title")?.textContent ?? "";
    card.hidden = !visibleIds.has(title);
  });
};

/** Enlaza los botones de filtro con el renderizado de la galería. */
export const initGallery = ({ container, filterGroup }) => {
  if (!container || !filterGroup) return;

  renderGallery(container);

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".filter__btn");
    if (!button) return;

    filterGroup
      .querySelectorAll(".filter__btn")
      .forEach((btn) => btn.classList.toggle("filter__btn--active", btn === button));

    applyFilter(container, button.dataset.filter ?? "all");
  });
};
