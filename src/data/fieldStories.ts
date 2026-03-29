/**
 * Field Stories — Real market situations from Kasandra's experience.
 * Each story builds trust while showing practical knowledge.
 */

import type { PartnerCategory } from './trustedPartners';

export interface FieldStory {
  id: string;
  title: { en: string; es: string };
  situation: { en: string; es: string };
  outcome: { en: string; es: string };
  category: PartnerCategory;
  /** Optional takeaway line */
  lesson: { en: string; es: string };
}

export const FIELD_STORIES: FieldStory[] = [
  {
    id: 'story-inspection-save',
    title: {
      en: 'The Foundation Issue That Almost Went Unnoticed',
      es: 'El Problema de Cimentación Que Casi Pasa Desapercibido',
    },
    situation: {
      en: 'A first-time buyer fell in love with a home in midtown Tucson. Everything looked perfect on the surface — fresh paint, new carpet, updated kitchen.',
      es: 'Un comprador primerizo se enamoró de una casa en el centro de Tucson. Todo se veía perfecto por fuera — pintura fresca, alfombra nueva, cocina actualizada.',
    },
    outcome: {
      en: 'My inspector caught hairline cracks in the stem wall that indicated settling. The repair estimate came back at $38,000. We negotiated a $40K price reduction — the buyer still got their dream home, just at the right price.',
      es: 'Mi inspector detectó fisuras en el muro de cimentación que indicaban asentamiento. El presupuesto de reparación fue de $38,000. Negociamos una reducción de $40K — el comprador obtuvo su casa soñada, al precio correcto.',
    },
    category: 'inspector',
    lesson: {
      en: 'This is why I never skip the inspection, and why I only recommend inspectors who look beyond the cosmetics.',
      es: 'Por esto nunca omito la inspección, y solo recomiendo inspectores que ven más allá de lo cosmético.',
    },
  },
  {
    id: 'story-lender-creative',
    title: {
      en: 'When the "No" Became a "Yes" With the Right Lender',
      es: 'Cuando el "No" Se Convirtió en "Sí" Con el Prestamista Correcto',
    },
    situation: {
      en: 'A bilingual family had been told by two lenders that they didn\'t qualify. Their credit was fine, but their income documentation was non-traditional — common in self-employment situations.',
      es: 'Una familia bilingüe había sido rechazada por dos prestamistas. Su crédito estaba bien, pero su documentación de ingresos no era tradicional — común en situaciones de autoempleo.',
    },
    outcome: {
      en: 'I connected them with a lender who understood ITIN and non-QM loan programs. They closed on a 3-bedroom in Marana within 60 days. Sometimes the right partner makes all the difference.',
      es: 'Los conecté con un prestamista que entendía programas de préstamos ITIN y no-QM. Cerraron en una casa de 3 recámaras en Marana en 60 días. A veces el socio correcto hace toda la diferencia.',
    },
    category: 'lender',
    lesson: {
      en: "Not all lenders serve every buyer. Having the right network means I can match you with someone who actually understands your situation.",
      es: 'No todos los prestamistas sirven a todos los compradores. Tener la red correcta significa que puedo conectarte con alguien que realmente entiende tu situación.',
    },
  },
  {
    id: 'story-contractor-staging',
    title: {
      en: '$4,200 in Repairs, $27,000 More at Closing',
      es: '$4,200 en Reparaciones, $27,000 Más en el Cierre',
    },
    situation: {
      en: 'A seller in Rita Ranch wanted to list as-is. The home had dated countertops, a leaky guest bath faucet, and peeling exterior paint. She was worried about spending money before selling.',
      es: 'Una vendedora en Rita Ranch quería listar tal cual. La casa tenía encimeras anticuadas, un grifo con fugas y pintura exterior descascarada. Le preocupaba gastar dinero antes de vender.',
    },
    outcome: {
      en: "My contractor handled the targeted repairs for $4,200. The home sold for $27,000 over what comparable as-is properties were getting. That's a 6x return on a strategic investment.",
      es: 'Mi contratista hizo las reparaciones específicas por $4,200. La casa se vendió por $27,000 más que propiedades comparables vendidas tal cual. Un retorno de 6x sobre una inversión estratégica.',
    },
    category: 'contractor',
    lesson: {
      en: "Having completed Idea'l Trade Institute's construction program, I know which repairs actually move the needle — and which ones are just cosmetic noise.",
      es: "Habiendo completado el programa de construcción de Idea'l Trade Institute, sé qué reparaciones realmente mueven la aguja — y cuáles son solo ruido cosmético.",
    },
  },
];
