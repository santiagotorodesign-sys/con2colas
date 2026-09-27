/**
 * icons.js — íconos SVG inline (24x24, stroke currentColor) usados en las
 * tarjetas de características y recursos.
 */

const ICON_PATHS = {
  brain:
    '<path d="M9.5 2a3.5 3.5 0 0 0-3.45 4.09A3.5 3.5 0 0 0 4 13a3.5 3.5 0 0 0 2.05 5.91A3.5 3.5 0 0 0 12.5 22V5.5A3.5 3.5 0 0 0 9.5 2Z"/><path d="M14.5 2a3.5 3.5 0 0 1 3.45 4.09A3.5 3.5 0 0 1 20 13a3.5 3.5 0 0 1-2.05 5.91A3.5 3.5 0 0 1 12.5 22"/>',
  leash:
    '<circle cx="6" cy="18" r="3"/><path d="M8.5 16.5 14 6a3.5 3.5 0 1 1 6 3.5"/><path d="M12.5 9.5 17 18"/>',
  heart:
    '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .8-4.5 2.5C10.5 3.8 9.3 3 7.5 3A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/>',
  video:
    '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m22 8-6 4 6 4V8Z"/>',
  spark:
    '<path d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l2.8 2.8M16.2 16.2 19 19M19 5l-2.8 2.8M7.8 16.2 5 19"/><circle cx="12" cy="12" r="3"/>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  quote:
    '<path d="M3 21c3 0 7-1 7-8V5H3v7c0 3 1 4 3 4-1 3-3 3-3 3v2Zm11 0c3 0 7-1 7-8V5h-7v7c0 3 1 4 3 4-1 3-3 3-3 3v2Z"/>',
  pdf:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M9 15h6M9 12h2"/>',
  play:
    '<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4V8Z"/>',
  check:
    '<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
};

/**
 * Devuelve un <svg> como string para el nombre de ícono dado.
 * @param {string} name clave de ICON_PATHS
 * @param {number} size lado del cuadrado en px
 * @returns {string} markup SVG
 */
export function icon(name, size = 24) {
  const path = ICON_PATHS[name] ?? ICON_PATHS.spark;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
    stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
