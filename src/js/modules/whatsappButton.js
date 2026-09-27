/**
 * whatsappButton.js — Componente reutilizable "Consultar por WhatsApp".
 * Equivalente en ES6 Modules a WhatsAppButton.jsx (recibe props y renderiza).
 *
 * Separación de responsabilidades:
 *  - buildWhatsAppURL(): lógica pura de datos (sin DOM) -> fácil de testear.
 *  - createWhatsAppButton(): capa de UI que consume la URL anterior.
 */

/** Número de WhatsApp de Con2colas con código de país (56). */
export const WHATSAPP_NUMBER = "56984024167";

/**
 * Icono SVG de WhatsApp. Se construye con createElement para que este módulo
 * pueda importarse en entornos sin DOM (por ejemplo, pruebas unitarias en Node),
 * donde no existe document al momento de la carga del módulo.
 */
function buildWaIconSvg() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "product-card__wa-icon");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "currentColor");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute(
    "d",
    "M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91a9.86 9.86 0 0 0-2.91-7.13zM12.05 20.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23a7.5 7.5 0 0 1-1.38-1.72c-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.13.17 1.75 2.68 4.24 3.76.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.28z"
  );
  svg.appendChild(path);
  return svg;
}

/** Renderiza el icono como string de markup (usado dentro de innerHTML). */
function waIconMarkup() {
  return buildWaIconSvg().outerHTML;
}

/**
 * Lógica pura: construye el enlace wa.me con el mensaje prellenado
 * y codificado automáticamente (encodeURIComponent).
 *
 * @param {{ name?: string, color?: string, size?: string }} product
 * @returns {string} URL absoluta de WhatsApp
 */
export function buildWhatsAppURL(product) {
  const details = [product.color && `color ${product.color}`, product.size && `tamaño ${product.size}`]
    .filter(Boolean)
    .join(", ");
  const interest = details ? `${product.name} (${details})` : product.name;
  const message = `Hola Con2colas! 👋 Me interesa el producto: ${interest}. ¿Podrían asesorarme?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Capa de UI: crea el <a> con estilo de botón verde WhatsApp (#25D366),
 * icono + texto "Consultar por WhatsApp", abriendo en pestaña nueva.
 *
 * @param {{ name: string, color?: string, size?: string }} product
 * @returns {HTMLAnchorElement}
 */
export function createWhatsAppButton(product) {
  const link = document.createElement("a");
  link.className = "btn btn--sm product-card__add product-card__wa";
  link.href = buildWhatsAppURL(product);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute(
    "aria-label",
    `Consultar por WhatsApp sobre ${product.name}`
  );
  link.innerHTML = `${waIconMarkup()}<span>Consultar por WhatsApp</span>`;
  return link;
}
