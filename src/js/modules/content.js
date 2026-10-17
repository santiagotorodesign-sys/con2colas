/**
 * content.js — Datos de contenido del sitio "Con 2 colas".
 * Catálogo real: 15 productos en 3 categorías (Ansiedad, Paseos, Cachorros).
 * Fuente: data/products_data.csv (pipeline: scripts/update_context.py)
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
 * Bloques de "Soluciones por problema" — 3 categorías reales.
 * Cada producto incluye: id, name, price, color, size, img, short_description,
 * description, additional_info, behavioral_function, sales_argument,
 * target_problem, marketplace
 */
export const problems = [
  {
    id: "ansiedad",
    title: "Ansiedad al quedarse solo",
    desc: "Llora, ladra o lo pasa muy mal cada vez que sales por la puerta.",
    products: [
      {
        id: "kong-classic-s",
        name: "Kong Classic talla S",
        price: 8600,
        color: "Rojo",
        size: "S",
        img: "kong-classic-s.jpg",
        short_description: "El juguete rellenable clásico para perros pequeños (hasta 9 kg).",
        description: "El Kong Classic talla S es el estándar de oro en juguetes caninos para perros pequeños.",
        additional_info: "Material: Caucho natural no tóxico. Talla S: Para perros de hasta 9 kg.",
        behavioral_function: "Satisface el instinto natural de masticación y libera endorfinas que calman el sistema nervioso",
        sales_argument: "20 minutos de lamiendo equivalen a un paseo en gasto mental y relajación",
        target_problem: "Ansiedad por separación, masticación destructiva, aburrimiento"
      },
      {
        id: "kong-classic-m",
        name: "Kong Classic talla M",
        price: 11500,
        color: "Rojo",
        size: "M",
        img: "kong-classic.jpg",
        short_description: "El juguete rellenable clásico para perros medianos (7 a 16 kg).",
        description: "El Kong Classic talla M satisface la necesidad instintiva de masticar de tu perro.",
        additional_info: "Material: Caucho natural rojo. Talla M: Para perros de 7 a 16 kg.",
        behavioral_function: "Canaliza la masticación hacia un objeto adecuado, reduciendo niveles de cortisol",
        sales_argument: "Transforma la frustración y la energía acumulada en concentración y calma",
        target_problem: "Masticación destructiva, estrés por soledad, ansiedad"
      },
      {
        id: "benebone-dental-chew",
        name: "Benebone Dental Chew Chicken Small",
        price: 10800,
        color: "Naranja / Pollo",
        size: "Small (< 13 kg)",
        img: "benebone-dental-chew.jpg",
        short_description: "Mordedor ergonómico con crestas estimulantes y sabor 100% a pollo real.",
        description: "Los perros no tienen pulgares, pero el Dental Chew de Benebone está diseñado con crestas y curvas patentadas.",
        additional_info: "Material: Nylon duradero con pollo real infusionado. Talla Small.",
        behavioral_function: "La masticación prolongada activa receptores de dopamina y relaja la mandíbula",
        sales_argument: "Satisface las ganas intensas de morder sin astillarse ni ensuciar tu casa",
        target_problem: "Masticación inapropiada de muebles, tensión por encierro, sarro dental"
      },
      {
        id: "benebone-wishbone",
        name: "Benebone Wishbone Chicken Small",
        price: 10800,
        color: "Naranja / Pollo",
        size: "Small (< 13 kg)",
        img: "benebone-wishbone.jpg",
        short_description: "El icónico diseño en horquilla que permite agarre fácil y masticación prolongada.",
        description: "El diseño curvado del Wishbone permite que el perro mantenga un extremo elevado con sus patas.",
        additional_info: "Material: Nylon resistente con pollo real infusionado. Talla Small.",
        behavioral_function: "Favorece estados de calma profunda mediante la acción motora de roer",
        sales_argument: "El favorito de los perros por su agarre ergonómico: no se les resbala",
        target_problem: "Ansiedad generalizada, hiperactividad vespertina, estrés de soledad"
      }
    ],
  },
  {
    id: "paseo",
    title: "Tirones en el paseo",
    desc: "Pasear se ha vuelto un estrés constante, te duele el brazo y las manos...",
    products: [
      {
        id: "ruffwear-hi-light-xs",
        name: "Ruffwear Hi & Light Harness – Sage Green XS",
        price: 45990,
        color: "Sage Green",
        size: "XS (Pecho 43-56 cm)",
        img: "ruffwear-hi-light-xs.jpg",
        short_description: "Arnés ultraligero y de perfil bajo para máxima libertad de movimiento.",
        description: "El arnés Ruffwear Hi & Light™ es una opción liviana y minimalista para paseos diarios.",
        additional_info: "Material: Ripstop de poliéster 150D. Talla XS: Pecho 43-56 cm.",
        behavioral_function: "Elimina la presión sobre las vías respiratorias y columna cervical",
        sales_argument: "Tu perro casi no sentirá que lo lleva puesto: adiós a las rozaduras",
        target_problem: "Tirones de correa, tos o arcadas durante el paseo, rechazo al arnés"
      },
      {
        id: "ruffwear-hi-light-s",
        name: "Ruffwear Hi & Light Harness – Sage Green S",
        price: 45990,
        color: "Sage Green",
        size: "S (Pecho 56-69 cm)",
        img: "ruffwear-hi-light-s.jpg",
        short_description: "Arnés técnico ultraliviano de perfil bajo para paseos cómodos.",
        description: "Construido para velocidad, ligereza y paseos cómodos sin añadir peso extra.",
        additional_info: "Material: Poliéster ripstop 150D. Talla S: Pecho 56-69 cm.",
        behavioral_function: "Favorece una marcha equilibrada y natural sin puntos de dolor",
        sales_argument: "Máxima ligereza con la durabilidad de montaña que caracteriza a Ruffwear",
        target_problem: "Sensibilidad al tacto, paseos agitados, sobrecalentamiento"
      },
      {
        id: "ruffwear-front-range-s",
        name: "Ruffwear Front Range Harness – Spring Mountains S",
        price: 46800,
        color: "Spring Mountains",
        size: "S (Pecho 56-69 cm)",
        img: "ruffwear-front-range-s.jpg",
        short_description: "El arnés acolchado con doble punto de enganche (anti-tirones en pecho).",
        description: "El Front Range® es el arnés de uso diario definitivo con dos puntos de enganche.",
        additional_info: "Material: Poliéster 300D con relleno de espuma foam. Talla S: Pecho 56-69 cm.",
        behavioral_function: "El punto frontal permite redirigir el eje de marcha suavemente",
        sales_argument: "Paseos agradables y sin forcejeos respetando 100% el bienestar de tu mascota",
        target_problem: "Tirones intensos de correa, perros reactivos ante estímulos externos"
      },
      {
        id: "ruffwear-front-range-m",
        name: "Ruffwear Front Range Harness – Spring Mountains M",
        price: 46800,
        color: "Spring Mountains",
        size: "M (Pecho 69-81 cm)",
        img: "ruffwear-front-range-m.jpg",
        short_description: "Arnés acolchado de alto rendimiento con fijación frontal anti-tirones.",
        description: "Ideal para perros de tamaño mediano a grande con amplio panel acolchado.",
        additional_info: "Material: Poliéster antidesgarro con forro acolchado. Talla M: Pecho 69-81 cm.",
        behavioral_function: "Brinda seguridad corporal al perro y control gentil al tutor sin causar asfixia",
        sales_argument: "El arnés número uno recomendado por educadores caninos respetuosos",
        target_problem: "Fuerza desmedida en el paseo, reactividad, tirones constantes"
      }
    ],
  },
  {
    id: "cachorros",
    title: "Llegada de un nuevo cachorro",
    desc: "Exceso de energía, salta todo el tiempo y muerde por juego.",
    products: [
      {
        id: "benebone-maplestick",
        name: "Benebone Maplestick Puppy Wood",
        price: 7500,
        color: "Madera Natural",
        size: "Puppy / Small (< 13 kg)",
        img: "benebone-mapelstick.jpg",
        short_description: "Mordedor seguro para cachorros hecho con madera de arce real y nylon suave.",
        description: "A los cachorros les fascinan los palos, pero son peligrosos por las astillas. El Maplestick combina arce con nylon no tóxico.",
        additional_info: "Material: Compuesto especial Puppy con madera de arce real de EE. UU.",
        behavioral_function: "Satisface la necesidad biológica de masticar durante el recambio dental",
        sales_argument: "Salva tus zapatillas dándole un palo real que nunca se astilla",
        target_problem: "Mordisqueo de muebles y manos en cachorros, dolor de encías por dentición"
      }
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