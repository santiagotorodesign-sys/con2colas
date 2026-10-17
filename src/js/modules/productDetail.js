/**
 * productDetail.js — Carga y renderiza la página de detalle de producto
 * usando la estructura JSON generada por procesador_csv_a_json.py
 * 
 * Uso: en cada página src/producto/{slug}.html incluir:
 *   <script type="module">
 *     import { initProductDetail } from '../js/modules/productDetail.js';
 *     initProductDetail('kong-classic'); // slug del producto
 *   </script>
 */

import { createWhatsAppButton } from "./whatsappButton.js";

// Cache de productos cargados
let productsCache = null;

/**
 * Carga el catálogo completo desde data/products_detail.json
 */
async function loadProductsCatalog() {
  if (productsCache) return productsCache;
  
  try {
    const basePath = window.location.pathname.split('/').slice(0,-1).join('/') + '/';
    const response = await fetch(basePath + "data/products_detail.json");
    if (!response.ok) throw new Error("No se pudo cargar el catálogo");
    productsCache = await response.json();
    return productsCache;
  } catch (error) {
    console.error("Error cargando productos:", error);
    return [];
  }
}

/**
 * Busca un producto por slug
 */
async function getProductBySlug(slug) {
  const products = await loadProductsCatalog();
  return products.find(p => p.slug === slug) || null;
}

/**
 * Formatea precio en CLP
 */
function formatCLP(price) {
  return new Intl.NumberFormat("es-CL", { 
    style: "currency", 
    currency: "CLP", 
    maximumFractionDigits: 0 
  }).format(price);
}

/**
 * Genera JSON-LD Product structured data
 */
function generateJsonLd(product) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.short_description,
    "image": product.image_main,
    "sku": product.id,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": "Con 2 colas"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "CLP",
      "price": product.price,
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Con 2 colas"
      }
    }
  };
}

/**
 * Actualiza el breadcrumb
 */
function updateBreadcrumb(product) {
  const categoryMap = {
    "Ansiedad": "Ansiedad",
    "Paseos": "Paseo", 
    "Cachorros": "Cachorros"
  };
  
  document.getElementById("breadcrumb-category").textContent = categoryMap[product.category] || product.category;
  document.getElementById("breadcrumb-category").href = `../index.html#${product.category.toLowerCase()}`;
  document.getElementById("breadcrumb-product").textContent = product.name;
}

/**
 * Renderiza toda la información del producto en la página
 */
function renderProduct(product) {
  // Meta tags
  document.title = `${product.name} — Con 2 colas`;
  document.getElementById("meta-description").content = product.short_description;
  document.getElementById("page-title").textContent = `${product.name} — Con 2 colas`;
  
  // Breadcrumb
  updateBreadcrumb(product);
  
  // Imagen principal
  const img = document.getElementById("product-main-image");
  img.src = product.image_main;
  img.alt = product.image_alt || product.name;
  
  // Categoría
  document.getElementById("product-category-label").textContent = product.category;
  
  // Título y precio
  document.getElementById("product-title").textContent = product.name;
  document.getElementById("product-price").textContent = formatCLP(product.price);
  
  // Marketplace badge
  const mpEl = document.getElementById("product-marketplace");
  const marketplaceLabels = {
    "MercadoLibre": { label: "MercadoLibre", class: "marketplace--mercadolibre" },
    "Falabella": { label: "Falabella", class: "marketplace--falabella" },
    "Consultor WSP": { label: "Consultor WSP", class: "marketplace--wsp" }
  };
  const mp = marketplaceLabels[product.marketplace] || { label: product.marketplace, class: "" };
  if (mp.label) {
    mpEl.textContent = mp.label;
    mpEl.className = `product-detail__marketplace ${mp.class}`;
  } else {
    mpEl.style.display = "none";
  }
  
  // Descripción pestaña 1
  document.getElementById("product-behavioral-function").textContent = product.behavioral_function;
  document.getElementById("product-sales-argument").textContent = product.sales_argument;
  document.getElementById("product-description").textContent = product.description;
  
  // Información adicional pestaña 2
  const attrsContainer = document.getElementById("product-attributes");
  const attrs = [];
  if (product.color && product.color !== "—") {
    attrs.push({ label: "Color", value: product.color });
  }
  if (product.size && product.size !== "—") {
    attrs.push({ label: "Talla / Medida", value: product.size });
  }
  attrs.push({ label: "Categoría", value: product.category });
  attrs.push({ label: "Disponible en", value: product.marketplace });
  
  attrsContainer.innerHTML = attrs.map(attr => `
    <div class="product-detail__attr">
      <span class="product-detail__attr-label">${attr.label}</span>
      <span class="product-detail__attr-value">${attr.value}</span>
    </div>
  `).join("");
  
  document.getElementById("product-additional-info").textContent = product.additional_info;
  
  // Target problems
  const targetEl = document.getElementById("product-target");
  if (product.target_problem) {
    targetEl.textContent = `Ideal para: ${product.target_problem}`;
    targetEl.style.display = "block";
  } else {
    targetEl.style.display = "none";
  }
  
  // Botón WhatsApp
  const waBtn = document.getElementById("product-wa-btn");
  const waUrl = `https://wa.me/56984024167?text=${encodeURIComponent(
    `Hola Con2colas! 👋 Me interesa el producto: ${product.name} (${product.color || ""} ${product.size || ""}). ¿Podrían asesorarme?`
  )}`;
  waBtn.href = waUrl;
  

  
  // JSON-LD structured data
  const jsonLd = generateJsonLd(product);
  document.getElementById("json-ld").textContent = JSON.stringify(jsonLd, null, 2);
  
  // Inicializar tabs
  initTabs();
}

/**
 * Inicializa el sistema de tabs
 */
function initTabs() {
  const tabButtons = document.querySelectorAll(".product-detail__tab-btn");
  const tabPanels = document.querySelectorAll(".product-detail__tab-panel");
  
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.dataset.tab;
      
      tabButtons.forEach(b => {
        b.classList.remove("product-detail__tab-btn--active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("product-detail__tab-btn--active");
      btn.setAttribute("aria-selected", "true");
      
      tabPanels.forEach(panel => {
        panel.hidden = true;
        panel.classList.remove("product-detail__tab-panel--active");
      });
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) {
        targetPanel.hidden = false;
        targetPanel.classList.add("product-detail__tab-panel--active");
      }
    });
  });
}

/**
 * Renderiza productos relacionados (misma categoría, excluyendo el actual)
 */
async function renderRelatedProducts(product) {
  const products = await loadProductsCatalog();
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  const grid = document.getElementById("related-grid");
  if (!grid || related.length === 0) {
    if (grid) grid.closest(".related-products").style.display = "none";
    return;
  }
  
  grid.innerHTML = related.map(p => `
    <li class="product-card" data-product-id="${p.id}" style="cursor:pointer;">
      <div class="product-card__media">
        <img class="product-card__img" src="${p.image_main}" alt="${p.name}" loading="lazy" width="380" height="285" />
      </div>
      <h4 class="product-card__title">${p.name}</h4>
      <p class="product-card__price">${formatCLP(p.price)}</p>
      <p class="product-card__short-desc">${p.short_description}</p>
      <div class="product-card__meta">
        ${p.color && p.color !== "—" ? `<span class="product-card__color">${p.color}</span>` : ""}
        ${p.size && p.size !== "—" ? `<span class="product-card__size">${p.size}</span>` : ""}
      </div>
    </li>
  `).join("");
  
  // Click en tarjetas relacionadas
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => {
      const pid = card.dataset.productId;
      window.location.href = `../producto/${pid}.html`;
    });
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/**
 * Función principal: inicializa la página de detalle
 * @param {string} slug - Slug del producto (ej. 'kong-classic')
 */
export async function initProductDetail(slug) {
  const product = await getProductBySlug(slug);
  
  if (!product) {
    console.error(`Producto no encontrado: ${slug}`);
    // Redirigir a página principal o 404
    window.location.href = "../index.html#soluciones";
    return;
  }
  
  renderProduct(product);
  await renderRelatedProducts(product);
  
  // Disparar evento para que otros scripts sepan que el producto cargó
  document.dispatchEvent(new CustomEvent("productDetailLoaded", { detail: product }));
}

// Exportar utilidades
export { loadProductsCatalog, getProductBySlug, formatCLP };