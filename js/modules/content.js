/**
 * content.js — Datos de contenido del sitio "Con 2 colas".
 * Textos y productos extraídos del diseño Figma (Home - Con 2 colas, node 34-1246).
 */

export const features = [
  {
    icon: "brain",
    title: "Adiós a la ansiedad",
    text: "Juguetes que relajan su mente cuando te vas de casa.",
  },
  {
    icon: "leash",
    title: "Paseos sin tirones",
    text: "Arneses cómodos que protegen su cuello y te dan el control.",
  },
  {
    icon: "heart",
    title: "Cero castigos",
    text: "Educación basada en el respeto, nunca en el dolor.",
  },
  {
    icon: "video",
    title: "Asesoría paso a paso",
    text: "Con cada compra recibes un video tutorial para usarlo correctamente.",
  },
  {
    icon: "spark",
    title: "Mente activa y sana",
    text: "Canalizamos su energía para evitar aburrimiento y destrozos.",
  },
  {
    icon: "link",
    title: "Vínculo inquebrantable",
    text: "Pasamos de la frustración a la comprensión y armonía.",
  },
];

/**
 * Bloques de "Soluciones por problema". Cada problema lista 3 productos
 * recomendados (los placeholders del diseño se reemplazaron por productos
 * reales del catálogo canino).
 */
export const problems = [
  {
    id: "paseo",
    title: "Tirones en el paseo",
    desc: "Pasear se ha vuelto un estrés constante, te duele el brazo y las manos...",
    products: [
      { img: "prod-1.png", name: "Arnés en Y Walk Easy", price: 39.0 },
      { img: "prod-2.png", name: "Correa doble amortiguada", price: 29.0 },
      { img: "prod-3.png", name: "Cinturón de paseo manos libres", price: 25.0 },
    ],
  },
  {
    id: "ansiedad",
    title: "Ansiedad al quedarse solo",
    desc: "Llora, ladra o lo pasa muy mal cada vez que sales por la puerta.",
    products: [
      { img: "prod-4.png", name: "LickiMat Calma + receta", price: 19.0 },
      { img: "prod-5.png", name: "Kong Classic rellenable", price: 22.0 },
      { img: "prod-6.png", name: "Difusor de feromonas apaciguantes", price: 29.0 },
    ],
  },
  {
    id: "energia",
    title: "Exceso de energía",
    desc: "Parece que no se cansa con nada y demanda atención todo el día.",
    products: [
      { img: "prod-7.png", name: "Pelota interactiva ZoomBall", price: 18.0 },
      { img: "prod-8.png", name: "Tapete de olfato Snuffle", price: 26.0 },
      { img: "prod-9.png", name: "Juguete de arrastre TugPro", price: 21.0 },
    ],
  },
  {
    id: "cachorros",
    title: "Llegada de un nuevo cachorro",
    desc: "Exceso de energía, salta todo el tiempo y muerde por juego.",
    products: [
      { img: "prod-10.png", name: "Set de mordillores suaves", price: 24.0 },
      { img: "prod-11.png", name: "Guía de cachorro (PDF + video)", price: 15.0 },
      { img: "prod-12.png", name: "Arnés ajustable Puppy", price: 28.0 },
    ],
  },
  {
    id: "senior",
    title: "Cuidados para los “senior”",
    desc: "Estimulación cognitiva, higiene y otros...",
    products: [
      { img: "prod-13.png", name: "Rompecabezas cognitivo Brainy", price: 27.0 },
      { img: "prod-14.png", name: "Cama ortopédica Senior Rest", price: 59.0 },
      { img: "prod-15.png", name: "Suplemento articular (30 días)", price: 32.0 },
    ],
  },
];

/** Testimonios de transformación (filas superiores del diseño). */
export const testimonials = [
  {
    text: "Era un perro gigante y pasear por la ciudad era imposible por los tirones. Solo podíamos soltarlo en descampados. Con el arnés en Y adecuado y reestructuración del paseo, hoy camina relajado por avenidas concurridas.",
    avatar: "avatar-1.png",
    name: "Luk",
    role: "De la frustración al paseo urbano",
  },
  {
    text: "Vivían en la calle y reaccionaban con mucho miedo e inseguridad ante personas y otros perros. Aplicamos desensibilización conductual para lograr una adaptación feliz y segura con su nueva familia.",
    avatar: "avatar-2.png",
    name: "Mellizos",
    role: "De la calle a una convivencia en paz",
  },
  {
    text: "Realizamos una evaluación etológica exhaustiva para auditar el comportamiento del perro frente a estímulos infantiles, estableciendo pautas de manejo seguro para la llegada de niños a la familia.",
    avatar: "avatar-3.png",
    name: "Trueno",
    role: "Compatibilidad con niños",
  },
];

/** Recursos gratuitos. */
export const resources = [
  {
    title: "Guía de Calma (PDF)",
    text: "Pasos para reducir el estrés en casa.",
    cta: "Descargar PDF",
    href: "#recursos",
  },
  {
    title: "Clase online (video)",
    text: "Entiende lo que intenta decirte.",
    cta: "Ver tutoriales",
    href: "#recursos",
  },
  {
    title: "Micro-evaluación",
    text: "Envíanos un video de 1 min y te orientamos.",
    cta: "Enviar video",
    href: "#contacto",
  },
];

/** Columnas del footer (placeholders del template convertidos a enlaces reales). */
export const footerColumns = [
  {
    title: "Company",
    links: ["Sobre Romina", "Blog de conducta", "Contacto", "Trabaja con nosotros"],
  },
  {
    title: "Products",
    links: ["Paseo sin tirones", "Ansiedad y soledad", "Cachorros", "Senior"],
  },
  {
    title: "Support",
    links: ["Asesoría post-compra", "Guías y tutoriales", "Envíos y devoluciones", "Preguntas frecuentes"],
  },
  {
    title: "Terms",
    links: ["Términos y condiciones", "Privacidad", "Cookies", "Aviso legal"],
  },
];
