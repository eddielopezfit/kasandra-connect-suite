/**
 * HowTo JSON-LD Schema Registry
 *
 * Provides structured HowTo schema data for process-oriented guides.
 * Eligible for Google rich results — "How-To" cards in SERPs.
 *
 * Criteria for HowTo eligibility:
 *   - Guide must describe a process with discrete, actionable steps
 *   - Steps must have names + text descriptions
 *   - Guide must be evergreen (not time-bound to a specific date)
 *
 * Qualified guides: cost-to-sell, home-prep-staging, pricing-strategy,
 *   how-long-to-sell (framed as timeline steps)
 *
 * Schema.org spec: https://schema.org/HowTo
 */

export interface HowToStep {
  name: string;
  nameEs: string;
  text: string;
  textEs: string;
}

export interface HowToSchemaData {
  name: string;
  nameEs: string;
  description: string;
  descriptionEs: string;
  totalTime?: string; // ISO 8601 duration, e.g. "PT6W"
  steps: HowToStep[];
}

export const HOWTO_SCHEMAS: Record<string, HowToSchemaData> = {
  'cost-to-sell-tucson': {
    name: "How to Calculate the True Cost of Selling Your Home in Tucson",
    nameEs: "Cómo Calcular el Costo Real de Vender tu Casa en Tucson",
    description: "A step-by-step breakdown of every cost sellers pay when listing a home in Tucson, Arizona — from commission and closing costs to pre-sale prep and holding costs.",
    descriptionEs: "Un desglose paso a paso de cada costo que pagan los vendedores al listar una casa en Tucson, Arizona — desde comisión y costos de cierre hasta preparación previa a la venta y costos de tenencia.",
    totalTime: "PT2H",
    steps: [
      {
        name: "Estimate your agent commission",
        nameEs: "Estima la comisión del agente",
        text: "Commission in Tucson runs 5–6% of the sale price, split between listing and buyer's agents. On a $365,000 home that's $18,250–$21,900. Under post-NAR-settlement rules, buyer agent compensation is now negotiated separately — confirm structure when interviewing agents.",
        textEs: "La comisión en Tucson es del 5–6% del precio de venta, dividida entre el agente del listado y el del comprador. En una casa de $365,000 eso es $18,250–$21,900. Bajo las reglas post-acuerdo NAR, la compensación del agente comprador ahora se negocia por separado.",
      },
      {
        name: "Calculate Arizona seller closing costs",
        nameEs: "Calcula los costos de cierre del vendedor en Arizona",
        text: "Arizona sellers typically pay 1–2% of the sale price in closing costs: title insurance (~0.5–0.75%), escrow fees ($800–$1,500), Pima County transfer tax ($2 per $1,000), home warranty if offered ($400–$700), and prorated property taxes.",
        textEs: "Los vendedores en Arizona típicamente pagan 1–2% del precio de venta en costos de cierre: seguro de título (~0.5–0.75%), honorarios de fideicomiso ($800–$1,500), impuesto de transferencia del Condado Pima ($2 por $1,000) e impuestos de propiedad prorrateados.",
      },
      {
        name: "Budget for pre-sale repairs and staging",
        nameEs: "Presupuesta reparaciones previas a la venta y staging",
        text: "Most Tucson sellers spend $2,000–$8,000 on pre-sale prep: deep clean ($500–$1,500), interior paint ($2,000–$4,000), landscaping ($500–$2,000), and pre-listing inspection ($300–$800). Skip major kitchen/bath renovations — they rarely recover full cost at sale.",
        textEs: "La mayoría de los vendedores en Tucson gastan $2,000–$8,000 en preparación previa: limpieza profunda ($500–$1,500), pintura interior ($2,000–$4,000), paisajismo ($500–$2,000) e inspección previa al listado ($300–$800).",
      },
      {
        name: "Calculate holding costs for time on market",
        nameEs: "Calcula los costos de tenencia durante el tiempo en el mercado",
        text: "Every day on market costs money: mortgage payment, property taxes (~$200–$500/month), insurance (~$100–$200/month), and utilities (~$150–$300/month). At Tucson's median days on market, expect 1–1.5 months of holding costs. Overpriced homes that sit 60–90 days accumulate $4,000–$8,000 in additional costs.",
        textEs: "Cada día en el mercado cuesta dinero: pago hipotecario, impuestos de propiedad (~$200–$500/mes), seguro (~$100–$200/mes) y servicios públicos (~$150–$300/mes). Con los días promedio en el mercado de Tucson, espera 1–1.5 meses de costos de tenencia.",
      },
      {
        name: "Run your seller net sheet",
        nameEs: "Calcula tu hoja de neto del vendedor",
        text: "Add commission + closing costs + prep + holding costs, then subtract from sale price. Also subtract your mortgage payoff balance. The result is your estimated net proceeds. Use Kasandra's Seller Net Calculator at kasandraoasis.com to run your specific numbers.",
        textEs: "Suma comisión + costos de cierre + preparación + costos de tenencia, luego réstalos del precio de venta. También resta el saldo de tu hipoteca. El resultado son tus ganancias netas estimadas.",
      },
    ],
  },

  'home-prep-staging': {
    name: "How to Prepare Your Home for Sale in Tucson",
    nameEs: "Cómo Preparar tu Casa para Vender en Tucson",
    description: "A prioritized step-by-step guide to preparing a Tucson home for sale — what actually moves the needle, what to skip, and desert climate considerations unique to Arizona.",
    descriptionEs: "Una guía priorizada paso a paso para preparar una casa en Tucson para la venta — lo que realmente marca la diferencia, qué omitir y consideraciones del clima desértico únicas de Arizona.",
    totalTime: "P3W",
    steps: [
      {
        name: "Understand what Tucson buyers respond to",
        nameEs: "Entiende a qué responden los compradores de Tucson",
        text: "Buyers evaluate condition signals, light, space, and price-condition alignment in the first 30 seconds of photos. In Tucson's desert climate, curb appeal means intentional desert landscaping — clean gravel, healthy saguaro, and maintained exterior paint on the front elevation.",
        textEs: "Los compradores evalúan señales de condición, luz, espacio y alineación precio-condición en los primeros 30 segundos de las fotos. En el clima desértico de Tucson, el atractivo exterior significa paisajismo desértico intencional.",
      },
      {
        name: "Focus on high-ROI improvements only",
        nameEs: "Enfócate solo en mejoras de alto retorno",
        text: "The highest-return prep items in Tucson: fresh interior paint ($2,000–$4,000, strongest ROI per dollar), professional deep clean ($500–$1,200), exterior touch-up and landscaping ($500–$2,000), and pre-listing inspection ($300–$800). Skip major kitchen and bath renovations — they almost never recover full cost at sale.",
        textEs: "Los artículos de preparación de mayor retorno en Tucson: pintura interior fresca ($2,000–$4,000, el mayor ROI por dólar), limpieza profunda profesional ($500–$1,200) y paisajismo exterior ($500–$2,000). Omite renovaciones importantes de cocina y baño.",
      },
      {
        name: "Address Tucson-specific desert climate issues",
        nameEs: "Atiende los problemas específicos del clima desértico de Tucson",
        text: "Check HVAC system and document recent service (buyers always ask). Inspect roof for sun and monsoon damage. Check exterior paint and stucco for UV fade and cracking. Inspect weatherstripping and window seals. Clear any standing water areas from monsoon season.",
        textEs: "Revisa el sistema HVAC y documenta el servicio reciente. Inspecciona el techo por daños de sol y monzones. Revisa la pintura exterior y estuco por decoloración UV y grietas. Inspecciona burletes y sellos de ventanas.",
      },
      {
        name: "Stage for photos, not just showings",
        nameEs: "Haz staging para fotos, no solo para visitas",
        text: "Remove 30–40% of furniture and personal items so buyers can see the space. Depersonalize — remove family photos and personal artwork. Maximize light with bright LED bulbs throughout. Clear kitchen and bathroom counters almost completely. Address pet odors and cooking smells before photography.",
        textEs: "Elimina 30–40% de los muebles y artículos personales para que los compradores puedan ver el espacio. Despersonaliza — elimina fotos familiares y obras de arte personales. Maximiza la luz con focos LED brillantes en todas partes.",
      },
      {
        name: "Schedule professional photography before listing",
        nameEs: "Programa fotografía profesional antes de listar",
        text: "Professional photos are non-negotiable in Tucson's market. Your listing photos are your first showing — buyers decide whether to schedule a visit based on photos alone. Schedule photography only after all prep is complete. Include an early morning or late afternoon exterior shot for the best desert light.",
        textEs: "Las fotos profesionales son innegociables en el mercado de Tucson. Tus fotos de listado son tu primera visita. Programa la fotografía solo después de que toda la preparación esté completa.",
      },
    ],
  },

  'pricing-strategy': {
    name: "How to Price Your Home to Sell in Tucson",
    nameEs: "Cómo Fijar el Precio de tu Casa para Vender en Tucson",
    description: "A step-by-step guide to pricing a Tucson home correctly — how to read a CMA, choose a pricing strategy, and avoid the costly overpricing trap.",
    descriptionEs: "Una guía paso a paso para fijar correctamente el precio de una casa en Tucson — cómo leer un CMA, elegir una estrategia de precios y evitar la costosa trampa del precio excesivo.",
    totalTime: "PT4H",
    steps: [
      {
        name: "Understand what determines market value",
        nameEs: "Entiende qué determina el valor de mercado",
        text: "Market value is set by recent comparable sales (comps), not by what you paid, what you need, or Zestimate estimates. The four primary drivers: recent closed sales within 0.5 miles and 90 days, square footage and bedroom/bath count, condition relative to comps, and location premiums or discounts.",
        textEs: "El valor de mercado lo establecen las ventas comparables recientes, no lo que pagaste, lo que necesitas o las estimaciones de Zestimate. Los cuatro factores principales: ventas cerradas recientes en un radio de 0.5 millas y 90 días, metros cuadrados, condición relativa a los comparables y primas de ubicación.",
      },
      {
        name: "Request and review a Comparative Market Analysis",
        nameEs: "Solicita y revisa un Análisis Comparativo de Mercado",
        text: "Ask your agent for a CMA showing: closed sales (most important), active listings (your competition), and pending sales (current velocity). Look at the price-per-square-foot of closed comps. Ask why specific comps were included or excluded. A good CMA has a tight comp range — wide ranges signal uncertainty.",
        textEs: "Pide a tu agente un CMA que muestre: ventas cerradas (las más importantes), listados activos (tu competencia) y ventas pendientes (velocidad actual). Observa el precio por metro cuadrado de los comparables cerrados.",
      },
      {
        name: "Choose your pricing strategy",
        nameEs: "Elige tu estrategia de precios",
        text: "Three main strategies: at-market pricing (list at fair value, target quick sale with multiple offers), slightly below market (generate urgency and competing offers, maximize final price), or aspirational pricing (list above market for negotiating room — use only in very low inventory). In Tucson's current market, at-market or slightly below outperforms aspirational pricing in most situations.",
        textEs: "Tres estrategias principales: precio de mercado (venta rápida con múltiples ofertas), ligeramente por debajo del mercado (generar urgencia y ofertas competidoras) o precio aspiracional (solo en inventario muy bajo). En el mercado actual de Tucson, el precio de mercado o ligeramente por debajo supera al precio aspiracional en la mayoría de situaciones.",
      },
      {
        name: "Understand the true cost of overpricing",
        nameEs: "Entiende el costo real del precio excesivo",
        text: "Overpriced homes accumulate days on market, which signals problems to buyers and leads to lower offers. A home priced 5% above market typically sits 45–60 days before a reduction. The final sale price is usually lower than if priced correctly from day one — plus you've paid holding costs throughout. The first two weeks on market are your highest-traffic window.",
        textEs: "Las casas con precio excesivo acumulan días en el mercado, lo que señala problemas a los compradores y lleva a ofertas más bajas. Una casa con un precio del 5% por encima del mercado típicamente permanece 45–60 días antes de una reducción.",
      },
      {
        name: "Respond strategically to offers and negotiate",
        nameEs: "Responde estratégicamente a las ofertas y negocia",
        text: "In Tucson's market, the sale-to-list ratio guides what's reasonable to counter. Review every element of an offer: price, down payment, financing type, inspection contingency, and possession date. Low offers aren't personal — counter based on comps, not emotion. A buyer willing to write an offer is a buyer worth engaging.",
        textEs: "En el mercado de Tucson, la proporción precio de venta vs. lista guía lo que es razonable contraofertar. Revisa cada elemento de una oferta: precio, pago inicial, tipo de financiamiento, contingencia de inspección y fecha de posesión.",
      },
    ],
  },

  'how-long-to-sell-tucson': {
    name: "How Long It Takes to Sell a House in Tucson",
    nameEs: "Cuánto Tiempo Tarda en Venderse una Casa en Tucson",
    description: "A phase-by-phase breakdown of the Tucson home sale timeline — from the decision to sell through closing day, with what affects each phase.",
    descriptionEs: "Un desglose fase por fase del cronograma de venta de casas en Tucson — desde la decisión de vender hasta el día del cierre, con lo que afecta cada fase.",
    totalTime: "P10W",
    steps: [
      {
        name: "Complete the preparation phase (1–3 weeks)",
        nameEs: "Completa la fase de preparación (1–3 semanas)",
        text: "Before listing: schedule a CMA and pricing meeting with your agent, complete priority repairs and touch-ups, arrange professional photography, and prepare MLS listing details. Some sellers skip prep and list immediately — acceptable for as-is sales, but typically costs more than prep time saves.",
        textEs: "Antes de listar: programa un CMA y reunión de precios con tu agente, completa reparaciones prioritarias, organiza fotografía profesional y prepara los detalles del listado MLS. Saltarse la preparación es aceptable para ventas tal como están, pero típicamente cuesta más de lo que ahorra.",
      },
      {
        name: "Navigate the active listing phase (14–45 days)",
        nameEs: "Navega la fase de listado activo (14–45 días)",
        text: "The active listing phase ends when a buyer's offer is accepted. Correctly priced homes in good condition go under contract in 10–21 days. Overpriced or high-maintenance homes sit 60–90+ days. Spring (February–May) is Tucson's fastest selling season. The first 7–10 days generate the most showing traffic.",
        textEs: "La fase de listado activo termina cuando se acepta la oferta de un comprador. Las casas con precio correcto y en buena condición van bajo contrato en 10–21 días. Las casas con precio excesivo permanecen 60–90+ días. La primavera (febrero–mayo) es la temporada de venta más rápida de Tucson.",
      },
      {
        name: "Complete the under-contract phase (30–45 days)",
        nameEs: "Completa la fase bajo contrato (30–45 días)",
        text: "Once under contract, the timeline includes: inspection period and BINSR negotiation (10 days), appraisal for financed buyers (7–14 days), loan underwriting and final approval (10–20 days), and title and escrow work (runs concurrently). Cash sales compress to 7–21 days total.",
        textEs: "Una vez bajo contrato, el cronograma incluye: período de inspección y negociación BINSR (10 días), tasación para compradores financiados (7–14 días), suscripción del préstamo y aprobación final (10–20 días) y trabajo de título y fideicomiso.",
      },
      {
        name: "Close and hand over possession",
        nameEs: "Cierra y entrega la posesión",
        text: "The closing appointment takes 1–2 hours. You'll sign the deed and closing documents. Funds are wired to your account (or cashier's check) typically same-day or next business day. Hand over keys, garage openers, and any documentation on appliances and systems. Your possession date is negotiated in the contract.",
        textEs: "La cita de cierre toma 1–2 horas. Firmarás la escritura y los documentos de cierre. Los fondos se transfieren a tu cuenta típicamente el mismo día o el siguiente día hábil. Entrega las llaves, controles del garaje y documentación de electrodomésticos y sistemas.",
      },
    ],
  },
};

/**
 * Returns serialized HowTo schema for a given guide ID and language.
 * Returns null if no HowTo schema is defined for the guide.
 */
export function getHowToSchema(guideId: string, language: 'en' | 'es'): object | null {
  const data = HOWTO_SCHEMAS[guideId];
  if (!data) return null;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: language === 'es' ? data.nameEs : data.name,
    description: language === 'es' ? data.descriptionEs : data.description,
    ...(data.totalTime ? { totalTime: data.totalTime } : {}),
    step: data.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: language === 'es' ? step.nameEs : step.name,
      text: language === 'es' ? step.textEs : step.text,
    })),
  };
}
