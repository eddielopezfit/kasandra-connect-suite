// Centralized testimonial data with bilingual content
// Each testimonial has explicit EN and ES versions - no auto-translation

export interface Testimonial {
  id: string;
  source: "Birdeye" | "Experience.com" | "Realtor.com";
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

// Primary testimonials for homepage
export const primaryTestimonials: Testimonial[] = [
  {
    id: "buyer-emotional-01",
    source: "Birdeye",
    role: {
      en: "Verified Buyer",
      es: "Compradora Verificada",
    },
    content: {
      en: "Kasandra really has a heart of gold… I thought my dream wouldn't come true. She looked at me and said, 'I know you want a place of safety and sanctuary—and we're going to do that for you.'",
      es: "Kasandra realmente tiene un corazón de oro… Pensé que mi sueño no se haría realidad. Ella me miró y dijo: 'Sé que quieres un lugar de seguridad y refugio—y lo vamos a lograr para ti.'",
    },
    category: "buyer",
  },
  {
    id: "client-process-01",
    source: "Birdeye",
    role: {
      en: "Verified Client",
      es: "Cliente Verificada",
    },
    content: {
      en: "She made the entire process feel smooth, stress-free, and even enjoyable. She always made me feel like her top priority.",
      es: "Hizo que todo el proceso se sintiera fluido, sin estrés, e incluso agradable. Siempre me hizo sentir como su prioridad.",
    },
    category: "seller",
  },
  {
    id: "buyer-spanish-01",
    source: "Birdeye",
    role: {
      en: "Verified Buyer",
      es: "Compradora Verificada",
    },
    content: {
      en: "The best real estate agent I could have. She has the ability to listen and connect with her client.",
      es: "La mejor agente de bienes raíces que pude tener. Tiene la capacidad de escuchar y conectar con su cliente.",
    },
    category: "buyer",
  },
];

// Secondary testimonials for carousel
export const secondaryTestimonials: Testimonial[] = [
  {
    id: "client-fighter-01",
    source: "Birdeye",
    role: {
      en: "Verified Client",
      es: "Cliente Verificado",
    },
    content: {
      en: "She is a fighter and will help you accomplish your dreams and goals.",
      es: "Es una luchadora y te ayudará a lograr tus sueños y metas.",
    },
    category: "general",
  },
  {
    id: "buyer-firsttime-01",
    source: "Experience.com",
    role: {
      en: "Verified Buyer",
      es: "Comprador Verificado",
    },
    content: {
      en: "As a first-time home buyer, she made me feel like her first priority from day one.",
      es: "Como comprador primerizo, me hizo sentir su prioridad desde el primer día.",
    },
    category: "buyer",
  },
  {
    id: "client-kind-01",
    source: "Realtor.com",
    role: {
      en: "Verified Client",
      es: "Cliente Verificado",
    },
    content: {
      en: "Kind, patient, and genuinely cares about her clients.",
      es: "Amable, paciente, y genuinamente se preocupa por sus clientes.",
    },
    category: "general",
  },
];

// Buyer-specific testimonials
export const buyerTestimonials: Testimonial[] = [
  primaryTestimonials[0], // "heart of gold" testimonial
  secondaryTestimonials[1], // first-time buyer testimonial
  primaryTestimonials[2], // Spanish original about listening
];

// Seller-specific testimonials
export const sellerTestimonials: Testimonial[] = [
  primaryTestimonials[1], // "smooth, stress-free" testimonial
  secondaryTestimonials[0], // "fighter" testimonial
];

// Funnel testimonials (short, impactful)
export const funnelTestimonials: Record<string, Testimonial> = {
  buyer: {
    id: "funnel-buyer-01",
    source: "Birdeye",
    role: {
      en: "Verified Buyer",
      es: "Compradora Verificada",
    },
    content: {
      en: "She made me feel like my dream was possible, even when I was unsure.",
      es: "Me hizo sentir que mi sueño era posible, incluso cuando tenía dudas.",
    },
    category: "buyer",
  },
  seller: {
    id: "funnel-seller-01",
    source: "Birdeye",
    role: {
      en: "Verified Client",
      es: "Cliente Verificada",
    },
    content: {
      en: "She handled everything with clarity and professionalism.",
      es: "Manejó todo con claridad y profesionalismo.",
    },
    category: "seller",
  },
  general: {
    id: "funnel-general-01",
    source: "Birdeye",
    role: {
      en: "Verified Buyer",
      es: "Compradora Verificada",
    },
    content: {
      en: "She made me feel like my dream was possible, even when I was unsure.",
      es: "La mejor agente… supo escuchar y guiarme con confianza.",
    },
    category: "general",
  },
};
