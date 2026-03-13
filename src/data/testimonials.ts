// Centralized testimonial data with bilingual content
// Each testimonial has explicit EN and ES versions - no auto-translation

export interface Testimonial {
  id: string;
  source: "Birdeye" | "Google" | "Realtor.com" | "Experience.com";
  clientName: string;
  neighborhood?: string;
  stars: number;
  role: {
    en: string;
    es: string;
  };
  content: {
    en: string;
    es: string;
  };
  category?: "buyer" | "seller" | "general";
}

// ─── Column 1: Emotional / Heart ────────────────────────────
export const column1Testimonials: Testimonial[] = [
  {
    id: "col1-jessica",
    source: "Google",
    clientName: "Jessica J.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      en: "Kasandra really has a heart of gold. She was so patient and so kind. She said to me, 'I know that you want to find a place of safety and sanctuary — and we're going to do that for you.'",
      es: "Kasandra realmente tiene un corazón de oro. Fue tan paciente y amable. Me dijo: 'Sé que quieres un lugar de seguridad y refugio — y lo vamos a lograr para ti.'",
    },
    category: "buyer",
  },
  {
    id: "col1-kendra",
    source: "Experience.com",
    clientName: "Kendra W.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      en: "She went above and beyond to make sure we were not staying in a hotel. When issues came up right before we got the keys, Kasandra stepped in everywhere we needed.",
      es: "Fue más allá de lo esperado para asegurarse de que no nos quedáramos en un hotel. Cuando surgieron problemas justo antes de recibir las llaves, Kasandra intervino donde la necesitábamos.",
    },
    category: "buyer",
  },
  {
    id: "col1-mariem",
    source: "Experience.com",
    clientName: "Mariem B.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      en: "Kasandra is probably the most dedicated, detail-oriented, communicative and understanding real estate person you will ever meet. She helped us find the home of our dreams.",
      es: "Kasandra es probablemente la persona de bienes raíces más dedicada, detallista, comunicativa y comprensiva que conocerás. Nos ayudó a encontrar la casa de nuestros sueños.",
    },
    category: "buyer",
  },
  {
    id: "col1-rosy",
    source: "Experience.com",
    clientName: "Rosy G.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      en: "We only had two days to find a home and with her help we accomplished it! She is always available and ready to meet with you.",
      es: "¡Solo teníamos dos días para encontrar una casa y con su ayuda lo logramos! Siempre está disponible y lista para reunirse contigo.",
    },
    category: "buyer",
  },
];

// ─── Column 2: Professional Credibility ─────────────────────
export const column2Testimonials: Testimonial[] = [
  {
    id: "col2-cj-buy",
    source: "Realtor.com",
    clientName: "CJ",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Client", es: "Cliente Verificado" },
    content: {
      en: "I have worked with Kasandra twice — once when I bought my first home and again when I sold it 5 years later. Both times she brought the highest level of professionalism and expertise.",
      es: "He trabajado con Kasandra dos veces — cuando compré mi primera casa y cuando la vendí 5 años después. Ambas veces trajo el más alto nivel de profesionalismo y experiencia.",
    },
    category: "general",
  },
  {
    id: "col2-sebastian",
    source: "Google",
    clientName: "Sebastian M.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Client", es: "Cliente Verificado" },
    content: {
      en: "She made the entire process feel smooth, stress-free, and even enjoyable. Kasandra is incredibly knowledgeable — not just about the market, but about the many little details that come up.",
      es: "Hizo que todo el proceso se sintiera fluido, sin estrés, e incluso agradable. Kasandra es increíblemente conocedora — no solo del mercado, sino de todos los pequeños detalles que surgen.",
    },
    category: "seller",
  },
  {
    id: "col2-cj-sell",
    source: "Realtor.com",
    clientName: "CJ",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Client", es: "Cliente Verificado" },
    content: {
      en: "I was out of state while selling my home which would have added levels of stress — but Kasandra stepped in everywhere I needed and took those worries away.",
      es: "Estaba fuera del estado mientras vendía mi casa, lo que habría agregado niveles de estrés — pero Kasandra intervino donde la necesitaba y eliminó esas preocupaciones.",
    },
    category: "seller",
  },
  {
    id: "col2-ar",
    source: "Experience.com",
    clientName: "Ar M.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Comprador Verificado" },
    content: {
      en: "She got us a brand new house with a lower payment than what we expected and a low down payment. She is extremely helpful and patient.",
      es: "Nos consiguió una casa nueva con un pago menor al esperado y un enganche bajo. Es extremadamente servicial y paciente.",
    },
    category: "buyer",
  },
];

// ─── Column 3: Bilingual + Fighter ─────────────────────────
export const column3Testimonials: Testimonial[] = [
  {
    id: "col3-viribambam",
    source: "Google",
    clientName: "Viribambam M.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      // Spanish original — kept in both slots intentionally as a bilingual authenticity signal
      en: "La mejor agente de bienes raíces que pude tener. Tiene la capacidad de escuchar y de conectar con su cliente. Quedé sorprendida con su forma tan rápida de trabajar.",
      es: "La mejor agente de bienes raíces que pude tener. Tiene la capacidad de escuchar y de conectar con su cliente. Quedé sorprendida con su forma tan rápida de trabajar.",
    },
    category: "buyer",
  },
  {
    id: "col3-tony",
    source: "Google",
    clientName: "Tony T.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Client", es: "Cliente Verificado" },
    content: {
      en: "She is a fighter and will help you accomplish your dreams and goals. This is a difficult market — having Kasandra on your side should be a priority.",
      es: "Es una luchadora y te ayudará a lograr tus sueños y metas. Este es un mercado difícil — tener a Kasandra de tu lado debería ser prioridad.",
    },
    category: "general",
  },
  {
    id: "col3-alejandra",
    source: "Experience.com",
    clientName: "Alejandra N.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Buyer", es: "Compradora Verificada" },
    content: {
      en: "Kasandra is the best realtor there is. I'm a first-time home buyer and she made me feel like I was her first priority from the very first day I met her.",
      es: "Kasandra es la mejor agente que existe. Soy compradora primeriza y me hizo sentir como su primera prioridad desde el primer día que la conocí.",
    },
    category: "buyer",
  },
  {
    id: "col3-riley",
    source: "Experience.com",
    clientName: "Riley V.",
    neighborhood: "Tucson",
    stars: 5,
    role: { en: "Verified Client", es: "Cliente Verificado" },
    content: {
      en: "Exceptionally helpful throughout the whole process. Super nice to work with as a first-time buyer. Kasandra is very supportive and has great energy.",
      es: "Excepcionalmente servicial durante todo el proceso. Súper agradable para trabajar como comprador primerizo. Kasandra es muy solidaria y tiene gran energía.",
    },
    category: "buyer",
  },
];

// ─── Aggregated exports for backward compatibility ──────────
export const allTestimonials: Testimonial[] = [
  ...column1Testimonials,
  ...column2Testimonials,
  ...column3Testimonials,
];

export const primaryTestimonials = allTestimonials.slice(0, 3);
export const secondaryTestimonials = allTestimonials.slice(3, 6);

export const buyerTestimonials = allTestimonials.filter((t) => t.category === "buyer");
export const sellerTestimonials = allTestimonials.filter((t) => t.category === "seller");

export const funnelTestimonials: Record<string, Testimonial> = {
  buyer: column1Testimonials[0],
  seller: column2Testimonials[1],
  general: column3Testimonials[1],
};
