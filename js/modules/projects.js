/**
 * projects.js — Capa de DATOS (lógica pura, sin acceso al DOM).
 * Provee los proyectos de la galería y utilidades de filtrado/formato.
 */

const CATEGORY_LABELS = {
  diseno: "Diseño",
  codigo: "Código",
  arte: "Arte",
};

const PROJECTS = [
  {
    id: 1,
    title: "Dashboard Analítico",
    description: "Panel de métricas con gráficos interactivos y modo oscuro.",
    category: "diseno",
    author: "Lucía Fernández",
    likes: 328,
    image: "./assets/images/project-1.svg",
  },
  {
    id: 2,
    title: "API de Tareas",
    description: "Backend REST en Node con documentación abierta.",
    category: "codigo",
    author: "Marco Ruiz",
    likes: 214,
    image: "./assets/images/project-2.svg",
  },
  {
    id: 3,
    title: "Composición Abstracta",
    description: "Serie de arte generativo creada con shaders.",
    category: "arte",
    author: "Ana Torres",
    likes: 502,
    image: "./assets/images/project-3.svg",
  },
  {
    id: 4,
    title: "E-commerce Minimal",
    description: "Tienda de una página con carrito lateral y checkout simple.",
    category: "diseno",
    author: "Diego Salas",
    likes: 176,
    image: "./assets/images/project-4.svg",
  },
  {
    id: 5,
    title: "CLI de Deploy",
    description: "Herramienta de línea de comandos para publicar estáticos.",
    category: "codigo",
    author: "Paula Medina",
    likes: 98,
    image: "./assets/images/project-5.svg",
  },
  {
    id: 6,
    title: "Retratos Neón",
    description: "Ilustración digital con paleta de colores saturados.",
    category: "arte",
    author: "Sofía Lima",
    likes: 441,
    image: "./assets/images/project-6.svg",
  },
];

/** Devuelve todos los proyectos (copia inmutable). */
export const getProjects = () => [...PROJECTS];

/** Filtra por categoría; "all" devuelve todo. */
export const filterProjects = (category) =>
  category === "all"
    ? [...PROJECTS]
    : PROJECTS.filter((project) => project.category === category);

/** Traduce la clave interna de categoría a su etiqueta visible. */
export const getCategoryLabel = (category) =>
  CATEGORY_LABELS[category] ?? category;

/** Formatea un número con separadores locales (es-ES). */
export const formatNumber = (value) => new Intl.NumberFormat("es-ES").format(value);
