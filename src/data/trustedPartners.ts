/**
 * Trusted Partners Registry
 * 
 * Kasandra's personally vetted network. Only people she's actually worked with.
 * Kasandra can replace placeholder entries with real partner info when ready.
 */

export type PartnerCategory = 'lender' | 'inspector' | 'contractor' | 'title_escrow' | 'other';

export interface TrustedPartner {
  id: string;
  name: string;
  company: { en: string; es: string };
  category: PartnerCategory;
  specialty: { en: string; es: string };
  endorsement: { en: string; es: string };
  yearsWorking: string;
  isSponsor?: boolean;
  isPlaceholder?: boolean;
}

export const CATEGORY_LABELS: Record<PartnerCategory, { en: string; es: string }> = {
  lender: { en: 'Lenders', es: 'Prestamistas' },
  inspector: { en: 'Inspectors', es: 'Inspectores' },
  contractor: { en: 'Contractors', es: 'Contratistas' },
  title_escrow: { en: 'Title & Escrow', es: 'Título y Fideicomiso' },
  other: { en: 'Other Pros', es: 'Otros Profesionales' },
};

export const TRUSTED_PARTNERS: TrustedPartner[] = [
  // === LENDERS ===
  {
    id: 'lender-1',
    name: 'Coming Soon',
    company: { en: 'Preferred Lender', es: 'Prestamista Preferido' },
    category: 'lender',
    specialty: { en: 'Conventional, FHA, VA & ITIN Loans', es: 'Préstamos Convencionales, FHA, VA e ITIN' },
    endorsement: {
      en: "I'm building my verified lender list — only people I've personally closed with. Check back soon.",
      es: 'Estoy construyendo mi lista verificada de prestamistas — solo personas con quienes he cerrado personalmente. Vuelve pronto.',
    },
    yearsWorking: '',
    isPlaceholder: true,
  },
  {
    id: 'lender-2',
    name: 'Coming Soon',
    company: { en: 'Preferred Lender', es: 'Prestamista Preferido' },
    category: 'lender',
    specialty: { en: 'First-Time Buyer Programs', es: 'Programas para Compradores Primerizos' },
    endorsement: {
      en: 'Spot reserved for a lender who specializes in down payment assistance and first-time buyer programs.',
      es: 'Lugar reservado para un prestamista especializado en asistencia de pago inicial y programas para compradores primerizos.',
    },
    yearsWorking: '',
    isPlaceholder: true,
  },

  // === INSPECTORS ===
  {
    id: 'inspector-1',
    name: 'Coming Soon',
    company: { en: 'Home Inspector', es: 'Inspector de Viviendas' },
    category: 'inspector',
    specialty: { en: 'General Home Inspection', es: 'Inspección General de Viviendas' },
    endorsement: {
      en: 'A thorough inspector can save your client tens of thousands. I only recommend inspectors who catch what others miss.',
      es: 'Un inspector minucioso puede ahorrar decenas de miles. Solo recomiendo inspectores que encuentran lo que otros no ven.',
    },
    yearsWorking: '',
    isPlaceholder: true,
  },

  // === CONTRACTORS ===
  {
    id: 'contractor-1',
    name: 'Coming Soon',
    company: { en: 'General Contractor', es: 'Contratista General' },
    category: 'contractor',
    specialty: { en: 'Pre-Listing Repairs & Renovations', es: 'Reparaciones y Renovaciones Pre-Venta' },
    endorsement: {
      en: "Having completed a 6-month construction course at Idea'l Trade Institute, I know what's behind the walls. I only recommend contractors who do it right.",
      es: "Habiendo completado un curso de construcción de 6 meses en Idea'l Trade Institute, sé lo que hay detrás de las paredes. Solo recomiendo contratistas que hacen bien el trabajo.",
    },
    yearsWorking: '',
    isPlaceholder: true,
  },

  // === TITLE & ESCROW ===
  {
    id: 'title-1',
    name: 'Coming Soon',
    company: { en: 'Title & Escrow Company', es: 'Compañía de Título y Fideicomiso' },
    category: 'title_escrow',
    specialty: { en: 'Residential Closings', es: 'Cierres Residenciales' },
    endorsement: {
      en: 'A smooth closing starts with a great title company. This spot is reserved for the team that never drops the ball.',
      es: 'Un cierre sin problemas comienza con una gran compañía de título. Este lugar está reservado para el equipo que nunca falla.',
    },
    yearsWorking: '',
    isPlaceholder: true,
  },

  // === OTHER ===
  {
    id: 'other-1',
    name: 'Tucson Appliance',
    company: { en: 'Appliance Sales & Service', es: 'Venta y Servicio de Electrodomésticos' },
    category: 'other',
    specialty: { en: 'Appliances for Home Sellers & Buyers', es: 'Electrodomésticos para Vendedores y Compradores' },
    endorsement: {
      en: "Chris and Corbin Edwards have been incredible partners — they sponsor my podcast 'Lifting You Up' and always take care of my clients. Whether you're staging to sell or outfitting a new home, they're my first call.",
      es: 'Chris y Corbin Edwards han sido socios increíbles — patrocinan mi podcast "Lifting You Up" y siempre cuidan a mis clientes. Ya sea preparando para vender o equipando un hogar nuevo, son mi primera llamada.',
    },
    yearsWorking: '3+ years',
    isSponsor: true,
  },
];

/**
 * Get the "Partner of the Week" based on date rotation.
 * Rotates through non-placeholder partners weekly.
 */
export function getPartnerOfTheWeek(): TrustedPartner | null {
  const realPartners = TRUSTED_PARTNERS.filter(p => !p.isPlaceholder);
  if (realPartners.length === 0) return null;
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return realPartners[weekNumber % realPartners.length];
}
