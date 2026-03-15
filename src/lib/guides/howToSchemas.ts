/**
 * HowTo JSON-LD Schema Registry
 *
 * Provides structured HowTo schema data for process-oriented guides.
 * Eligible for Google rich results  -  "How-To" cards in SERPs.
 *
 * Criteria for HowTo eligibility:
 *   - Guide must describe a process with discrete, actionable steps
 *   - Steps must have names + text descriptions
 *   - Guide must be evergreen (not time-bound to a specific date)
 *
 * Qualified guides: cost-to-sell, home-prep-staging, pricing-strategy,
 *   how-long-to-sell (framed as timeline steps),
 *   first-time-buyer-guide, va-home-loan-tucson, fha-loan-pima-county-2026,
 *   down-payment-assistance-tucson, itin-loan-guide
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
    description: "A step-by-step breakdown of every cost sellers pay when listing a home in Tucson, Arizona  -  from commission and closing costs to pre-sale prep and holding costs.",
    descriptionEs: "Un desglose paso a paso de cada costo que pagan los vendedores al listar una casa en Tucson, Arizona  -  desde comisión y costos de cierre hasta preparación previa a la venta y costos de tenencia.",
    totalTime: "PT2H",
    steps: [
      {
        name: "Estimate your agent commission",
        nameEs: "Estima la comisión del agente",
        text: "Commission in Tucson runs 5-6% of the sale price, split between listing and buyer's agents. On a $365,000 home that's $18,250-$21,900. Under post-NAR-settlement rules, buyer agent compensation is now negotiated separately  -  confirm structure when interviewing agents.",
        textEs: "La comisión en Tucson es del 5-6% del precio de venta, dividida entre el agente del listado y el del comprador. En una casa de $365,000 eso es $18,250-$21,900. Bajo las reglas post-acuerdo NAR, la compensación del agente comprador ahora se negocia por separado.",
      },
      {
        name: "Calculate Arizona seller closing costs",
        nameEs: "Calcula los costos de cierre del vendedor en Arizona",
        text: "Arizona sellers typically pay 1-2% of the sale price in closing costs: title insurance (~0.5-0.75%), escrow fees ($800-$1,500), Pima County transfer tax ($2 per $1,000), home warranty if offered ($400-$700), and prorated property taxes.",
        textEs: "Los vendedores en Arizona típicamente pagan 1-2% del precio de venta en costos de cierre: seguro de título (~0.5-0.75%), honorarios de fideicomiso ($800-$1,500), impuesto de transferencia del Condado Pima ($2 por $1,000) e impuestos de propiedad prorrateados.",
      },
      {
        name: "Budget for pre-sale repairs and staging",
        nameEs: "Presupuesta reparaciones previas a la venta y staging",
        text: "Most Tucson sellers spend $2,000-$8,000 on pre-sale prep: deep clean ($500-$1,500), interior paint ($2,000-$4,000), landscaping ($500-$2,000), and pre-listing inspection ($300-$800). Skip major kitchen/bath renovations  -  they rarely recover full cost at sale.",
        textEs: "La mayoría de los vendedores en Tucson gastan $2,000-$8,000 en preparación previa: limpieza profunda ($500-$1,500), pintura interior ($2,000-$4,000), paisajismo ($500-$2,000) e inspección previa al listado ($300-$800).",
      },
      {
        name: "Calculate holding costs for time on market",
        nameEs: "Calcula los costos de tenencia durante el tiempo en el mercado",
        text: "Every day on market costs money: mortgage payment, property taxes (~$200-$500/month), insurance (~$100-$200/month), and utilities (~$150-$300/month). At Tucson's median days on market, expect 1-1.5 months of holding costs. Overpriced homes that sit 60-90 days accumulate $4,000-$8,000 in additional costs.",
        textEs: "Cada día en el mercado cuesta dinero: pago hipotecario, impuestos de propiedad (~$200-$500/mes), seguro (~$100-$200/mes) y servicios públicos (~$150-$300/mes). Con los días promedio en el mercado de Tucson, espera 1-1.5 meses de costos de tenencia.",
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
    description: "A prioritized step-by-step guide to preparing a Tucson home for sale  -  what actually moves the needle, what to skip, and desert climate considerations unique to Arizona.",
    descriptionEs: "Una guía priorizada paso a paso para preparar una casa en Tucson para la venta  -  lo que realmente marca la diferencia, qué omitir y consideraciones del clima desértico únicas de Arizona.",
    totalTime: "P3W",
    steps: [
      {
        name: "Understand what Tucson buyers respond to",
        nameEs: "Entiende a qué responden los compradores de Tucson",
        text: "Buyers evaluate condition signals, light, space, and price-condition alignment in the first 30 seconds of photos. In Tucson's desert climate, curb appeal means intentional desert landscaping  -  clean gravel, healthy saguaro, and maintained exterior paint on the front elevation.",
        textEs: "Los compradores evalúan señales de condición, luz, espacio y alineación precio-condición en los primeros 30 segundos de las fotos. En el clima desértico de Tucson, el atractivo exterior significa paisajismo desértico intencional.",
      },
      {
        name: "Focus on high-ROI improvements only",
        nameEs: "Enfócate solo en mejoras de alto retorno",
        text: "The highest-return prep items in Tucson: fresh interior paint ($2,000-$4,000, strongest ROI per dollar), professional deep clean ($500-$1,200), exterior touch-up and landscaping ($500-$2,000), and pre-listing inspection ($300-$800). Skip major kitchen and bath renovations  -  they almost never recover full cost at sale.",
        textEs: "Los artículos de preparación de mayor retorno en Tucson: pintura interior fresca ($2,000-$4,000, el mayor ROI por dólar), limpieza profunda profesional ($500-$1,200) y paisajismo exterior ($500-$2,000). Omite renovaciones importantes de cocina y baño.",
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
        text: "Remove 30-40% of furniture and personal items so buyers can see the space. Depersonalize  -  remove family photos and personal artwork. Maximize light with bright LED bulbs throughout. Clear kitchen and bathroom counters almost completely. Address pet odors and cooking smells before photography.",
        textEs: "Elimina 30-40% de los muebles y artículos personales para que los compradores puedan ver el espacio. Despersonaliza  -  elimina fotos familiares y obras de arte personales. Maximiza la luz con focos LED brillantes en todas partes.",
      },
      {
        name: "Schedule professional photography before listing",
        nameEs: "Programa fotografía profesional antes de listar",
        text: "Professional photos are non-negotiable in Tucson's market. Your listing photos are your first showing  -  buyers decide whether to schedule a visit based on photos alone. Schedule photography only after all prep is complete. Include an early morning or late afternoon exterior shot for the best desert light.",
        textEs: "Las fotos profesionales son innegociables en el mercado de Tucson. Tus fotos de listado son tu primera visita. Programa la fotografía solo después de que toda la preparación esté completa.",
      },
    ],
  },

  'pricing-strategy': {
    name: "How to Price Your Home to Sell in Tucson",
    nameEs: "Cómo Fijar el Precio de tu Casa para Vender en Tucson",
    description: "A step-by-step guide to pricing a Tucson home correctly  -  how to read a CMA, choose a pricing strategy, and avoid the costly overpricing trap.",
    descriptionEs: "Una guía paso a paso para fijar correctamente el precio de una casa en Tucson  -  cómo leer un CMA, elegir una estrategia de precios y evitar la costosa trampa del precio excesivo.",
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
        text: "Ask your agent for a CMA showing: closed sales (most important), active listings (your competition), and pending sales (current velocity). Look at the price-per-square-foot of closed comps. Ask why specific comps were included or excluded. A good CMA has a tight comp range  -  wide ranges signal uncertainty.",
        textEs: "Pide a tu agente un CMA que muestre: ventas cerradas (las más importantes), listados activos (tu competencia) y ventas pendientes (velocidad actual). Observa el precio por metro cuadrado de los comparables cerrados.",
      },
      {
        name: "Choose your pricing strategy",
        nameEs: "Elige tu estrategia de precios",
        text: "Three main strategies: at-market pricing (list at fair value, target quick sale with multiple offers), slightly below market (generate urgency and competing offers, maximize final price), or aspirational pricing (list above market for negotiating room  -  use only in very low inventory). In Tucson's current market, at-market or slightly below outperforms aspirational pricing in most situations.",
        textEs: "Tres estrategias principales: precio de mercado (venta rápida con múltiples ofertas), ligeramente por debajo del mercado (generar urgencia y ofertas competidoras) o precio aspiracional (solo en inventario muy bajo). En el mercado actual de Tucson, el precio de mercado o ligeramente por debajo supera al precio aspiracional en la mayoría de situaciones.",
      },
      {
        name: "Understand the true cost of overpricing",
        nameEs: "Entiende el costo real del precio excesivo",
        text: "Overpriced homes accumulate days on market, which signals problems to buyers and leads to lower offers. A home priced 5% above market typically sits 45-60 days before a reduction. The final sale price is usually lower than if priced correctly from day one  -  plus you've paid holding costs throughout. The first two weeks on market are your highest-traffic window.",
        textEs: "Las casas con precio excesivo acumulan días en el mercado, lo que señala problemas a los compradores y lleva a ofertas más bajas. Una casa con un precio del 5% por encima del mercado típicamente permanece 45-60 días antes de una reducción.",
      },
      {
        name: "Respond strategically to offers and negotiate",
        nameEs: "Responde estratégicamente a las ofertas y negocia",
        text: "In Tucson's market, the sale-to-list ratio guides what's reasonable to counter. Review every element of an offer: price, down payment, financing type, inspection contingency, and possession date. Low offers aren't personal  -  counter based on comps, not emotion. A buyer willing to write an offer is a buyer worth engaging.",
        textEs: "En el mercado de Tucson, la proporción precio de venta vs. lista guía lo que es razonable contraofertar. Revisa cada elemento de una oferta: precio, pago inicial, tipo de financiamiento, contingencia de inspección y fecha de posesión.",
      },
    ],
  },

  'how-long-to-sell-tucson': {
    name: "How Long It Takes to Sell a House in Tucson",
    nameEs: "Cuánto Tiempo Tarda en Venderse una Casa en Tucson",
    description: "A phase-by-phase breakdown of the Tucson home sale timeline  -  from the decision to sell through closing day, with what affects each phase.",
    descriptionEs: "Un desglose fase por fase del cronograma de venta de casas en Tucson  -  desde la decisión de vender hasta el día del cierre, con lo que afecta cada fase.",
    totalTime: "P10W",
    steps: [
      {
        name: "Complete the preparation phase (1-3 weeks)",
        nameEs: "Completa la fase de preparación (1-3 semanas)",
        text: "Before listing: schedule a CMA and pricing meeting with your agent, complete priority repairs and touch-ups, arrange professional photography, and prepare MLS listing details. Some sellers skip prep and list immediately  -  acceptable for as-is sales, but typically costs more than prep time saves.",
        textEs: "Antes de listar: programa un CMA y reunión de precios con tu agente, completa reparaciones prioritarias, organiza fotografía profesional y prepara los detalles del listado MLS. Saltarse la preparación es aceptable para ventas tal como están, pero típicamente cuesta más de lo que ahorra.",
      },
      {
        name: "Navigate the active listing phase (14-45 days)",
        nameEs: "Navega la fase de listado activo (14-45 días)",
        text: "The active listing phase ends when a buyer's offer is accepted. Correctly priced homes in good condition go under contract in 10-21 days. Overpriced or high-maintenance homes sit 60-90+ days. Spring (February-May) is Tucson's fastest selling season. The first 7-10 days generate the most showing traffic.",
        textEs: "La fase de listado activo termina cuando se acepta la oferta de un comprador. Las casas con precio correcto y en buena condición van bajo contrato en 10-21 días. Las casas con precio excesivo permanecen 60-90+ días. La primavera (febrero-mayo) es la temporada de venta más rápida de Tucson.",
      },
      {
        name: "Complete the under-contract phase (30-45 days)",
        nameEs: "Completa la fase bajo contrato (30-45 días)",
        text: "Once under contract, the timeline includes: inspection period and BINSR negotiation (10 days), appraisal for financed buyers (7-14 days), loan underwriting and final approval (10-20 days), and title and escrow work (runs concurrently). Cash sales compress to 7-21 days total.",
        textEs: "Una vez bajo contrato, el cronograma incluye: período de inspección y negociación BINSR (10 días), tasación para compradores financiados (7-14 días), suscripción del préstamo y aprobación final (10-20 días) y trabajo de título y fideicomiso.",
      },
      {
        name: "Close and hand over possession",
        nameEs: "Cierra y entrega la posesión",
        text: "The closing appointment takes 1-2 hours. You'll sign the deed and closing documents. Funds are wired to your account (or cashier's check) typically same-day or next business day. Hand over keys, garage openers, and any documentation on appliances and systems. Your possession date is negotiated in the contract.",
        textEs: "La cita de cierre toma 1-2 horas. Firmarás la escritura y los documentos de cierre. Los fondos se transfieren a tu cuenta típicamente el mismo día o el siguiente día hábil. Entrega las llaves, controles del garaje y documentación de electrodomésticos y sistemas.",
      },
    ],
  },

  // ─── SEO-03/06: Buyer Guide HowTo Schemas ──────────────────────────────────

  'first-time-buyer-guide': {
    name: "How to Buy Your First Home in Tucson, Arizona",
    nameEs: "Cómo Comprar tu Primera Casa en Tucson, Arizona",
    description: "A step-by-step process for first-time home buyers in Tucson  -  from checking credit and getting pre-approved through closing day.",
    descriptionEs: "Un proceso paso a paso para compradores de primera vivienda en Tucson  -  desde revisar tu crédito y obtener pre-aprobación hasta el día del cierre.",
    totalTime: "P8W",
    steps: [
      {
        name: "Check your credit and build your financial baseline",
        nameEs: "Revisa tu crédito y establece tu base financiera",
        text: "Pull your free credit report at AnnualCreditReport.com. For a conventional loan in Tucson, you'll need a 620+ score; FHA accepts 580+. Pay down revolving balances to below 30% utilization and avoid opening new credit lines for at least 6 months before applying. Fix any errors you find  -  disputes can take 30-60 days to resolve.",
        textEs: "Obtén tu reporte de crédito gratuito en AnnualCreditReport.com. Para un préstamo convencional en Tucson necesitarás 620+; FHA acepta 580+. Reduce los saldos rotativos por debajo del 30% de utilización y evita abrir nuevas líneas de crédito por al menos 6 meses antes de aplicar.",
      },
      {
        name: "Research down payment assistance programs",
        nameEs: "Investiga programas de asistencia para el pago inicial",
        text: "Arizona offers several first-time buyer programs: HOME Plus provides up to 5% down payment assistance as a forgivable grant. Pima Tucson Homebuyers Solution offers low-rate mortgages with DPA. FHA loans require only 3.5% down with a 580 score. Income and purchase price limits apply  -  confirm eligibility before selecting a program.",
        textEs: "Arizona ofrece varios programas para compradores primerizos: HOME Plus ofrece hasta 5% de asistencia para el pago inicial como una subvención perdonable. Pima Tucson Homebuyers Solution ofrece hipotecas de bajo interés con asistencia para el pago inicial. Los préstamos FHA requieren solo 3.5% con 580 puntos.",
      },
      {
        name: "Get pre-approved  -  not just pre-qualified",
        nameEs: "Obtén una pre-aprobación  -  no solo una pre-calificación",
        text: "Pre-qualification is a soft estimate; pre-approval is a lender's written commitment based on verified income, assets, and credit. In Tucson's competitive market, sellers take pre-approved buyers seriously. Gather: 2 years of W-2s or tax returns, 2 months of pay stubs, 3 months of bank statements, and your government-issued ID.",
        textEs: "La pre-calificación es una estimación suave; la pre-aprobación es el compromiso escrito de un prestamista basado en ingresos, activos y crédito verificados. En el mercado competitivo de Tucson, los vendedores toman en serio a los compradores pre-aprobados.",
      },
      {
        name: "Search neighborhoods and attend showings",
        nameEs: "Busca vecindarios y asiste a visitas",
        text: "Identify your non-negotiables: commute to work, school district, proximity to base (if military), price range, and minimum square footage. Tour homes with your agent in person  -  photos flatter. In Tucson, check HVAC age, roof condition, and water heater age at every showing. Make notes immediately after each visit before details blur.",
        textEs: "Identifica tus elementos no negociables: tiempo de viaje al trabajo, distrito escolar, proximidad a la base (si es militar), rango de precio y metros cuadrados mínimos. Visita casas en persona con tu agente. En Tucson, verifica la edad del HVAC, condición del techo y la edad del calentador de agua.",
      },
      {
        name: "Make an offer, negotiate, and go under contract",
        nameEs: "Haz una oferta, negocia y firma el contrato",
        text: "Your agent will prepare a purchase contract based on current market comps. Include an earnest money deposit (typically 1% of purchase price in Tucson). Negotiate inspection contingencies and possession dates. Once both parties sign, you're under contract  -  typically 30-45 days to closing from this point.",
        textEs: "Tu agente preparará un contrato de compra basado en comparables del mercado actual. Incluye un depósito de buena fe (típicamente 1% del precio de compra en Tucson). Negocia contingencias de inspección y fechas de posesión.",
      },
      {
        name: "Complete due diligence and close",
        nameEs: "Completa la debida diligencia y cierra",
        text: "Schedule a home inspection within the first 10 days of contract (Arizona BINSR period). Review the inspection report and negotiate repairs or credits. Your lender will order an appraisal. Complete final walkthrough the day before closing. At closing, bring government-issued ID and a cashier's check or wire for your closing costs and down payment.",
        textEs: "Programa una inspección del hogar dentro de los primeros 10 días del contrato (período BINSR de Arizona). Revisa el informe de inspección y negocia reparaciones o créditos. Tu prestamista ordenará una tasación. Completa el recorrido final el día antes del cierre.",
      },
    ],
  },

  'va-home-loan-tucson': {
    name: "How to Use a VA Loan to Buy a Home in Tucson",
    nameEs: "Cómo Usar un Préstamo VA para Comprar una Casa en Tucson",
    description: "A step-by-step guide to using your VA home loan benefit to buy near Davis-Monthan AFB or anywhere in the Tucson area  -  from eligibility through closing.",
    descriptionEs: "Una guía paso a paso para usar tu beneficio de préstamo VA para comprar cerca de la Base Davis-Monthan o en cualquier parte del área de Tucson  -  desde elegibilidad hasta el cierre.",
    totalTime: "P6W",
    steps: [
      {
        name: "Confirm your VA loan eligibility",
        nameEs: "Confirma tu elegibilidad para el préstamo VA",
        text: "VA loans are available to active-duty service members, veterans, National Guard, and surviving spouses. Obtain your Certificate of Eligibility (COE) through eBenefits, your lender, or by mailing VA Form 26-1880. Most lenders can pull your COE electronically in minutes. No minimum credit score is set by VA, but most lenders require 620+.",
        textEs: "Los préstamos VA están disponibles para militares en servicio activo, veteranos, Guardia Nacional y cónyuges sobrevivientes. Obtén tu Certificado de Elegibilidad (COE) a través de eBenefits, tu prestamista o enviando el Formulario VA 26-1880 por correo.",
      },
      {
        name: "Understand VA loan benefits in Tucson",
        nameEs: "Entiende los beneficios del préstamo VA en Tucson",
        text: "VA loans offer: zero down payment (no PMI), competitive interest rates below conventional, seller can pay up to 4% in concessions, and no prepayment penalty. The 2026 VA loan limit in Pima County has no set cap for buyers with full entitlement  -  you can buy up to your approved amount with no down payment required.",
        textEs: "Los préstamos VA ofrecen: cero pago inicial (sin PMI), tasas de interés competitivas por debajo de los convencionales, el vendedor puede pagar hasta 4% en concesiones y sin penalidad por pago anticipado.",
      },
      {
        name: "Get pre-approved with a VA-experienced lender",
        nameEs: "Obtén pre-aprobación con un prestamista con experiencia en VA",
        text: "Choose a lender experienced with VA loans  -  they understand the appraisal process and Minimum Property Requirements (MPRs). Gather: DD-214 (discharge), recent LES (if active duty), W-2s for 2 years, pay stubs for 30 days, and bank statements for 60 days. VA loans may take slightly longer to close  -  factor 45-60 days.",
        textEs: "Elige un prestamista con experiencia en préstamos VA que entienda el proceso de tasación y los Requisitos Mínimos de Propiedad (MPRs). Reúne: DD-214, LES reciente (si estás en servicio activo), W-2s de 2 años y estados de cuenta bancarios de 60 días.",
      },
      {
        name: "Find a VA-savvy real estate agent and search homes",
        nameEs: "Encuentra un agente inmobiliario con experiencia en VA y busca casas",
        text: "Work with an agent who understands VA Minimum Property Requirements  -  the property must be safe, sound, and sanitary. Common VA MPR issues in Tucson: peeling paint, roof deficiencies, water heater not strapped, missing handrails. Your agent should know to flag these before writing offers to avoid costly surprises during the VA appraisal.",
        textEs: "Trabaja con un agente que entienda los Requisitos Mínimos de Propiedad VA. Problemas comunes de MPR VA en Tucson: pintura descascarada, deficiencias en el techo, calentador de agua sin correa, barandillas faltantes.",
      },
      {
        name: "Make an offer and navigate the VA appraisal",
        nameEs: "Haz una oferta y navega la tasación VA",
        text: "Write a competitive offer  -  VA buyers are equally competitive as conventional buyers when working with experienced agents. The VA will assign an appraiser who checks both value and MPRs. If the appraisal comes in low, negotiate with the seller or use your Tidewater option to provide comps before the value is finalized.",
        textEs: "Escribe una oferta competitiva. La VA asignará un tasador que verifica tanto el valor como los MPRs. Si la tasación resulta baja, negocia con el vendedor o usa tu opción Tidewater para proporcionar comparables antes de que el valor sea finalizado.",
      },
      {
        name: "Close and take ownership",
        nameEs: "Cierra y toma posesión",
        text: "VA loans require a VA Funding Fee (0.5%-3.3% of loan amount, depending on use and down payment)  -  this can be financed into the loan. Veterans with 10%+ service-connected disability are exempt. At closing, review the Closing Disclosure, sign documents, and receive your keys. Your COE entitlement is restored when you sell or refinance.",
        textEs: "Los préstamos VA requieren una Tarifa de Financiamiento VA (0.5%-3.3% del monto del préstamo)  -  esto puede financiarse en el préstamo. Los veteranos con 10%+ de discapacidad por servicio están exentos. Al cerrar, revisa la Divulgación de Cierre, firma los documentos y recibe tus llaves.",
      },
    ],
  },

  'fha-loan-pima-county-2026': {
    name: "How to Get an FHA Loan to Buy a Home in Pima County (2026)",
    nameEs: "Cómo Obtener un Préstamo FHA para Comprar una Casa en el Condado de Pima (2026)",
    description: "A step-by-step guide to qualifying for and using an FHA loan to purchase a home in Tucson or Pima County, Arizona  -  current 2026 loan limits, requirements, and process.",
    descriptionEs: "Una guía paso a paso para calificar y usar un préstamo FHA para comprar una casa en Tucson o el Condado de Pima, Arizona  -  límites de préstamo 2026 actuales, requisitos y proceso.",
    totalTime: "P7W",
    steps: [
      {
        name: "Understand 2026 FHA loan limits for Pima County",
        nameEs: "Entiende los límites de préstamo FHA 2026 para el Condado de Pima",
        text: "For 2026, the FHA loan limit for a single-family home in Pima County is $524,225 (standard area limit). FHA loans are government-backed mortgages insured by HUD, allowing lower credit scores and down payments than conventional loans. They're especially useful for buyers with credit scores between 580-619 who don't qualify for conventional financing.",
        textEs: "Para 2026, el límite de préstamo FHA para una casa unifamiliar en el Condado de Pima es $524,225. Los préstamos FHA son hipotecas respaldadas por el gobierno aseguradas por HUD, permitiendo puntajes de crédito y pagos iniciales más bajos que los préstamos convencionales.",
      },
      {
        name: "Check your credit score and debt-to-income ratio",
        nameEs: "Verifica tu puntaje de crédito y relación deuda-ingresos",
        text: "FHA minimum: 580 credit score for 3.5% down; 500-579 requires 10% down. Your debt-to-income ratio (DTI) should be below 43% (total monthly debts ÷ gross monthly income). FHA allows up to 57% DTI with compensating factors. Calculate your DTI: add up all monthly debt payments and divide by gross monthly income.",
        textEs: "Mínimo FHA: 580 de puntaje de crédito para 3.5% de pago inicial; 500-579 requiere 10% de pago inicial. Tu relación deuda-ingresos (DTI) debe estar por debajo del 43%. FHA permite hasta 57% DTI con factores compensatorios.",
      },
      {
        name: "Understand FHA mortgage insurance requirements",
        nameEs: "Entiende los requisitos de seguro hipotecario FHA",
        text: "FHA loans require two types of mortgage insurance: upfront MIP (1.75% of loan amount, typically financed into the loan) and annual MIP (0.55%-1.05% of loan amount, paid monthly). For loans with less than 10% down, MIP stays for the life of the loan. For 10%+ down, MIP falls off after 11 years. Factor monthly MIP into your budget.",
        textEs: "Los préstamos FHA requieren dos tipos de seguro hipotecario: MIP inicial (1.75% del monto del préstamo, típicamente financiado en el préstamo) y MIP anual (0.55%-1.05%, pagado mensualmente). Con menos del 10% de pago inicial, el MIP permanece por la vida del préstamo.",
      },
      {
        name: "Get pre-approved and find an FHA-approved property",
        nameEs: "Obtén pre-aprobación y encuentra una propiedad aprobada por FHA",
        text: "Apply with a HUD-approved FHA lender. Most homes in Tucson qualify for FHA, but the property must meet FHA Minimum Property Standards: functioning utilities, no major safety hazards, adequate roof and foundation condition. Condos must be on HUD's approved condo list. New construction requires FHA builder certification.",
        textEs: "Solicita con un prestamista FHA aprobado por HUD. La mayoría de las casas en Tucson califican para FHA, pero la propiedad debe cumplir con los Estándares Mínimos de Propiedad FHA: servicios públicos funcionando, sin peligros de seguridad mayores, condición adecuada de techo y cimentación.",
      },
      {
        name: "Make your offer and complete the FHA appraisal",
        nameEs: "Haz tu oferta y completa la tasación FHA",
        text: "FHA appraisals check both value and property condition. The appraiser will flag health and safety issues that must be repaired before closing. Common FHA appraisal flags in Tucson: roof with less than 3 years remaining life, exposed wiring, broken windows, missing handrails. Budget for potential seller repair requests or negotiate a repair credit.",
        textEs: "Las tasaciones FHA verifican tanto el valor como la condición de la propiedad. El tasador señalará problemas de salud y seguridad que deben repararse antes del cierre. Problemas comunes de tasación FHA en Tucson: techo con menos de 3 años de vida útil, cableado expuesto, ventanas rotas.",
      },
      {
        name: "Close your FHA loan",
        nameEs: "Cierra tu préstamo FHA",
        text: "At closing, you'll pay your 3.5% down payment, closing costs (typically 2-5% of the loan), and the upfront MIP (if not financing it into the loan). FHA closing costs in Tucson typically run $5,000-$10,000 on a $300,000 home. Down payment assistance programs like HOME Plus can cover your down payment and some closing costs  -  stack them with FHA for maximum benefit.",
        textEs: "Al cerrar, pagarás tu pago inicial del 3.5%, costos de cierre (típicamente 2-5% del préstamo) y el MIP inicial. Los costos de cierre FHA en Tucson típicamente son $5,000-$10,000 en una casa de $300,000. Los programas de asistencia para el pago inicial como HOME Plus pueden cubrir tu pago inicial.",
      },
    ],
  },

  'down-payment-assistance-tucson': {
    name: "How to Get Down Payment Assistance to Buy a Home in Tucson",
    nameEs: "Cómo Obtener Asistencia para el Pago Inicial para Comprar una Casa en Tucson",
    description: "A step-by-step guide to finding, qualifying for, and stacking down payment assistance programs available to Tucson and Pima County home buyers in 2026.",
    descriptionEs: "Una guía paso a paso para encontrar, calificar y combinar programas de asistencia para el pago inicial disponibles para compradores de casas en Tucson y el Condado de Pima en 2026.",
    totalTime: "P4W",
    steps: [
      {
        name: "Know which programs are available in Tucson",
        nameEs: "Conoce qué programas están disponibles en Tucson",
        text: "Key down payment assistance programs for Tucson buyers: (1) HOME Plus  -  up to 5% DPA as a forgivable grant, available statewide with FHA, VA, USDA, or conventional loans. (2) Pima/Tucson Homebuyers Solution  -  below-market rate first mortgage + DPA for income-qualified buyers. (3) ADOH programs  -  Arizona Department of Housing grants for low-to-moderate income. (4) USDA Rural Development  -  100% financing for eligible rural areas outside Tucson proper.",
        textEs: "Programas clave de asistencia para el pago inicial para compradores de Tucson: (1) HOME Plus  -  hasta 5% DPA como subvención perdonable. (2) Pima/Tucson Homebuyers Solution  -  hipoteca de primera con tasa por debajo del mercado + DPA. (3) Programas ADOH. (4) Desarrollo Rural USDA  -  financiamiento al 100% para áreas rurales elegibles.",
      },
      {
        name: "Check your income and purchase price eligibility",
        nameEs: "Verifica tu elegibilidad de ingresos y precio de compra",
        text: "Most DPA programs in Arizona have income limits based on area median income (AMI). For Pima County in 2026, HOME Plus income limit is typically 80-120% AMI depending on household size. Purchase price limits also apply  -  verify current limits at the program's official source. First-time buyer requirement applies to most programs (no ownership in 3 years counts as first-time).",
        textEs: "La mayoría de los programas DPA en Arizona tienen límites de ingresos basados en el ingreso mediano del área (AMI). Para el Condado de Pima en 2026, el límite de ingresos de HOME Plus es típicamente 80-120% AMI según el tamaño del hogar.",
      },
      {
        name: "Complete a HUD-approved homebuyer education course",
        nameEs: "Completa un curso de educación para compradores aprobado por HUD",
        text: "Most DPA programs require a HUD-approved homebuyer education course. Options: online (Frameworks, eHomeAmerica  -  typically $75-$99, takes 6-8 hours) or in-person through local nonprofits. You'll receive a completion certificate  -  keep this as lenders will request it. Complete this before submitting your loan application to avoid delays.",
        textEs: "La mayoría de los programas DPA requieren un curso de educación para compradores aprobado por HUD. Opciones: en línea (Frameworks, eHomeAmerica  -  típicamente $75-$99, toma 6-8 horas) o en persona a través de organizaciones sin fines de lucro locales.",
      },
      {
        name: "Find a participating lender and apply",
        nameEs: "Encuentra un prestamista participante y solicita",
        text: "DPA programs are delivered through approved lenders  -  not all lenders participate. Ask specifically: 'Do you originate HOME Plus loans?' or 'Are you a Pima Tucson Homebuyers Solution participating lender?' Apply simultaneously for your first mortgage and DPA program  -  they're bundled. Provide all income verification documents upfront to speed the process.",
        textEs: "Los programas DPA se entregan a través de prestamistas aprobados. Pregunta específicamente: '¿Originan préstamos HOME Plus?' Aplica simultáneamente para tu primera hipoteca y el programa DPA. Proporciona todos los documentos de verificación de ingresos por adelantado.",
      },
      {
        name: "Stack programs for maximum benefit",
        nameEs: "Combina programas para el máximo beneficio",
        text: "DPA programs can often be layered. Example stack: FHA loan (3.5% down) + HOME Plus grant (covers 5% → zero out of pocket for down payment) + seller concessions for closing costs. Or: USDA loan (0% down) + ADOH grant for closing costs. Work with your lender to identify the optimal stack for your income level and target price range.",
        textEs: "Los programas DPA a menudo se pueden combinar. Ejemplo: préstamo FHA (3.5% de pago inicial) + subvención HOME Plus (cubre 5% → cero de tu bolsillo para el pago inicial) + concesiones del vendedor para los costos de cierre.",
      },
      {
        name: "Close and maintain program compliance",
        nameEs: "Cierra y mantén el cumplimiento del programa",
        text: "Some DPA grants are forgivable only if you stay in the home for a minimum period (typically 3 years for HOME Plus). If you sell or refinance before the compliance period, you may owe back a portion of the grant. Read your DPA agreement carefully  -  your lender must disclose all recapture provisions. For forgivable grants, the compliance period forgives automatically with no action needed.",
        textEs: "Algunas subvenciones DPA son perdonables solo si permaneces en la casa por un período mínimo (típicamente 3 años para HOME Plus). Si vendes o refinancias antes del período de cumplimiento, es posible que debas devolver una parte de la subvención.",
      },
    ],
  },

  'itin-loan-guide': {
    name: "How to Buy a Home in Tucson with an ITIN (No Social Security Number)",
    nameEs: "Cómo Comprar una Casa en Tucson con un ITIN (Sin Número de Seguro Social)",
    description: "A step-by-step guide for non-citizens and undocumented buyers to purchase a home in Tucson using an ITIN mortgage  -  what's required, which lenders offer them, and how to prepare.",
    descriptionEs: "Una guía paso a paso para no ciudadanos y compradores indocumentados para comprar una casa en Tucson usando una hipoteca ITIN  -  qué se requiere, qué prestamistas las ofrecen y cómo prepararse.",
    totalTime: "P10W",
    steps: [
      {
        name: "Understand your legal right to buy property in Arizona",
        nameEs: "Entiende tu derecho legal a comprar propiedad en Arizona",
        text: "U.S. federal and Arizona law do not restrict home ownership based on immigration status. Non-citizens  -  including undocumented immigrants  -  can legally own real property in Arizona. An ITIN (Individual Taxpayer Identification Number) is a tax processing number issued by the IRS that can substitute for a Social Security number in mortgage applications with participating lenders.",
        textEs: "Las leyes federales de EE.UU. y de Arizona no restringen la propiedad de vivienda basándose en el estatus migratorio. Los no ciudadanos, incluidos los inmigrantes indocumentados, pueden poseer legalmente bienes raíces en Arizona. Un ITIN es un número de procesamiento de impuestos emitido por el IRS que puede sustituir al número de Seguro Social con prestamistas participantes.",
      },
      {
        name: "Obtain your ITIN if you don't have one",
        nameEs: "Obtén tu ITIN si no tienes uno",
        text: "Apply for an ITIN by filing IRS Form W-7 with a valid federal income tax return and identity/foreign status documentation (passport, national ID, or birth certificate + photo ID). Processing takes 7-11 weeks. Some Acceptance Agents  -  including many tax preparers and Certifying Acceptance Agents (CAAs)  -  can expedite the process. Your ITIN is separate from your immigration status.",
        textEs: "Solicita un ITIN presentando el Formulario W-7 del IRS con una declaración de impuestos federal válida y documentación de identidad (pasaporte, identificación nacional o acta de nacimiento + identificación con foto). El procesamiento tarda 7-11 semanas.",
      },
      {
        name: "Build a credit profile using your ITIN",
        nameEs: "Construye un perfil de crédito usando tu ITIN",
        text: "ITIN mortgage lenders typically require 12-24 months of credit history under your ITIN. Build credit with: a secured credit card (deposit $200-$500, use and pay monthly), a credit-builder loan from a credit union, or by becoming an authorized user on a family member's account. Keep utilization below 30% and pay on time every month. Some ITIN lenders accept non-traditional credit (rent, utilities, insurance payments).",
        textEs: "Los prestamistas de hipotecas ITIN típicamente requieren 12-24 meses de historial de crédito bajo tu ITIN. Construye crédito con: una tarjeta de crédito asegurada, un préstamo constructor de crédito de una cooperativa de crédito o como usuario autorizado en la cuenta de un familiar.",
      },
      {
        name: "Find ITIN mortgage lenders in Tucson",
        nameEs: "Encuentra prestamistas de hipotecas ITIN en Tucson",
        text: "ITIN loans are not offered by all lenders  -  ask specifically: 'Do you offer ITIN mortgages?' Look for community banks, credit unions, and non-QM (non-qualified mortgage) lenders. Down payment requirements for ITIN loans are typically 10-20%. Interest rates are slightly higher than conventional loans due to the non-QM classification. Avoid anyone who promises a Social Security number is not needed for any loan type without disclosing it's an ITIN product.",
        textEs: "Los préstamos ITIN no los ofrecen todos los prestamistas. Busca bancos comunitarios, cooperativas de crédito y prestamistas no-QM. Los requisitos de pago inicial para préstamos ITIN son típicamente 10-20%. Las tasas de interés son ligeramente más altas que los préstamos convencionales.",
      },
      {
        name: "Prepare your documentation package",
        nameEs: "Prepara tu paquete de documentación",
        text: "ITIN lender documentation typically requires: ITIN number and IRS assignment letter, 2 years of tax returns filed with ITIN, 12-24 months of bank statements (for bank statement loans), proof of employment or self-employment income, identification (passport or consular ID), and reference letters if using non-traditional credit. Organize everything before contacting a lender.",
        textEs: "La documentación del prestamista ITIN típicamente requiere: número ITIN y carta de asignación del IRS, 2 años de declaraciones de impuestos, 12-24 meses de estados de cuenta bancarios, prueba de empleo o ingresos por trabajo independiente e identificación (pasaporte o identificación consular).",
      },
      {
        name: "Buy and close on your Tucson home",
        nameEs: "Compra y cierra en tu casa en Tucson",
        text: "Once pre-approved, the buying process mirrors a conventional purchase: find a property, make an offer, inspection, appraisal, and close. ITIN closings may take slightly longer (45-60 days). Title companies in Tucson regularly handle ITIN transactions  -  your immigration status is not disclosed or recorded in public records. You have full ownership rights as a property owner in Arizona regardless of immigration status.",
        textEs: "Una vez pre-aprobado, el proceso de compra es similar a una compra convencional: encontrar una propiedad, hacer una oferta, inspección, tasación y cierre. Los cierres ITIN pueden tomar un poco más de tiempo (45-60 días). Tu estatus migratorio no se divulga ni se registra en los registros públicos.",
      },
    ],
  },


  // SEO-SPRINT-02: HowTo schemas for 10 high-priority guides

  'selling-for-top-dollar': {
    name: 'How to Sell Your Tucson Home for Top Dollar',
    nameEs: 'Cómo Vender tu Casa en Tucson al Mejor Precio',
    description: 'Step-by-step guide to maximizing your Tucson home sale price through strategic pricing, staging, and negotiation.',
    descriptionEs: 'Guía paso a paso para maximizar el precio de venta de tu casa en Tucson con precios estratégicos, presentación y negociación.',
    totalTime: 'P60D',
    steps: [
      {
        name: 'Get a Comparative Market Analysis (CMA)',
        nameEs: 'Obten un Análisis Comparativo de Mercado (CMA)',
        text: 'Before pricing, get a free CMA from Kasandra Prieto. A CMA shows recent sales of similar Tucson homes in your ZIP code  -  the baseline for smart pricing.',
        textEs: 'Antes de fijar el precio, obtén un CMA gratuito de Kasandra Prieto. Un CMA muestra ventas recientes de casas similares en tu código postal de Tucson.',
      },
      {
        name: 'Price to attract, not to test',
        nameEs: 'Fija el precio para atraer, no para probar',
        text: "In Tucson's market, overpriced homes sit and accumulate stigma. Homes priced 2-3% below peak attract multiple offers and often close above list. Strategic pricing = top dollar.",
        textEs: 'En el mercado de Tucson, las casas sobrevaloradas se estancan y acumulan estigma. Las casas con precio 2-3% por debajo del pico atraen múltiples ofertas.',
      },
      {
        name: 'Complete targeted pre-sale improvements',
        nameEs: 'Completa mejoras previas a la venta específicas',
        text: 'Focus on curb appeal, deep cleaning, and desert-specific landscaping. Avoid over-improving. Kitchen and bath refreshes (paint, hardware) yield 80-120% ROI in Tucson.',
        textEs: 'Concéntrate en el atractivo exterior, limpieza profunda y jardinería específica del desierto. Evita mejorar en exceso. Los retoques de cocina y baño ofrecen 80-120% de retorno.',
      },
      {
        name: 'Stage for Tucson buyers',
        nameEs: 'Prepara la casa para compradores de Tucson',
        text: 'Stage to highlight indoor-outdoor living, natural light, and desert views. Remove personalization. Professional photos with golden-hour lighting are non-negotiable for top-dollar results.',
        textEs: 'Prepara la casa para destacar la vida interior-exterior, la luz natural y las vistas al desierto. Fotos profesionales con luz dorada son imprescindibles.',
      },
      {
        name: 'Negotiate from strength, not desperation',
        nameEs: 'Negocia desde una posición de fuerza, no de desesperación',
        text: 'Kasandra uses proven negotiation tactics: counter-offer strategy, inspection response frameworks, and appraisal gap management to protect your net proceeds at every step.',
        textEs: 'Kasandra usa tácticas de negociación comprobadas: estrategia de contraoferta, respuesta a inspecciones y manejo de brechas de tasación para proteger tus ganancias.',
      },
    ],
  },

  'inherited-probate-property': {
    name: 'How to Sell an Inherited Home in Tucson Through Probate',
    nameEs: 'Cómo Vender una Casa Heredada en Tucson a Través de Sucesión',
    description: 'Step-by-step process for Tucson families navigating probate and selling an inherited property in Arizona.',
    descriptionEs: 'Proceso paso a paso para familias de Tucson que navegan la sucesión y venden una propiedad heredada en Arizona.',
    totalTime: 'P120D',
    steps: [
      {
        name: 'Confirm whether probate is required',
        nameEs: 'Confirma si se requiere proceso de sucesión',
        text: 'In Arizona, probate is generally required if the estate is over $100,000 in real property. Check if the home had a living trust or joint tenancy  -  those bypass probate entirely.',
        textEs: 'En Arizona, la sucesión generalmente es requerida si el patrimonio supera $100,000 en bienes raíces. Verifica si la casa tenía un fideicomiso  -  eso omite la sucesión.',
      },
      {
        name: 'File for Letters Testamentary or Administration',
        nameEs: 'Solicita Cartas Testamentarias o de Administración',
        text: 'File with Pima County Superior Court to be appointed Personal Representative. This gives you legal authority to sell the property. Timeline: 3-6 weeks for standard cases.',
        textEs: 'Presenta en el Tribunal Superior del Condado Pima para ser nombrado Representante Personal. Esto te da autoridad legal para vender. Plazo: 3-6 semanas.',
      },
      {
        name: 'Get a professional home valuation',
        nameEs: 'Obtén una valuación profesional de la vivienda',
        text: 'Get a licensed appraisal for estate tax and probate purposes, plus a CMA for pricing. Kasandra provides free CMAs for inherited properties throughout Tucson and Pima County.',
        textEs: 'Obtén un avalúo con licencia para fines fiscales y de sucesión, más un CMA para precios. Kasandra proporciona CMAs gratuitos para propiedades heredadas en Tucson.',
      },
      {
        name: 'Choose your selling path: cash offer vs. listing',
        nameEs: 'Elige tu camino de venta: oferta en efectivo vs. listado',
        text: 'Inherited homes often need repairs that reduce traditional listing appeal. A cash offer through Corner Connect closes in 7-30 days with no repairs required  -  ideal for estates with timelines.',
        textEs: 'Las casas heredadas a menudo necesitan reparaciones. Una oferta en efectivo cierra en 7-30 días sin reparaciones requeridas  -  ideal para herencias con plazos.',
      },
      {
        name: 'Close and distribute proceeds',
        nameEs: 'Cierra y distribuye los fondos',
        text: 'After probate court approval, the sale closes and proceeds are distributed to heirs per the will or intestate succession law. Kasandra coordinates directly with estate attorneys throughout Tucson.',
        textEs: 'Tras la aprobación del tribunal, la venta se cierra y los fondos se distribuyen a los herederos. Kasandra coordina directamente con abogados de sucesiones en Tucson.',
      },
    ],
  },

  'cash-vs-traditional-sale': {
    name: 'How to Decide Between a Cash Offer and Traditional Listing in Tucson',
    nameEs: 'Cómo Decidir Entre Oferta en Efectivo y Venta Tradicional en Tucson',
    description: 'A structured comparison to help Tucson homeowners choose the right selling path based on their timeline, equity, and goals.',
    descriptionEs: 'Comparación estructurada para ayudar a propietarios de Tucson a elegir el camino de venta correcto según su plazo, capital y metas.',
    totalTime: 'P7D',
    steps: [
      {
        name: 'Estimate your net proceeds for both paths',
        nameEs: 'Estima tus ganancias netas para ambos caminos',
        text: 'Use the free Tucson net proceeds calculator on this site. Enter your estimated home value and see side-by-side cash vs. traditional net numbers after commissions, closing costs, and holding costs.',
        textEs: 'Usa la calculadora gratuita de ganancias netas de Tucson. Ingresa el valor estimado de tu casa y ve los números netos de efectivo vs. tradicional lado a lado.',
      },
      {
        name: 'Assess your timeline',
        nameEs: 'Evalúa tu plazo',
        text: 'Cash offers close in 7-30 days. Traditional listings average 45-90 days in Tucson (2026). If you need speed  -  relocation, estate, financial urgency  -  cash wins on certainty, even if the net is slightly lower.',
        textEs: 'Las ofertas en efectivo cierran en 7-30 días. Los listados tradicionales promedian 45-90 días en Tucson. Si necesitas rapidez, el efectivo gana en certeza.',
      },
      {
        name: "Evaluate your home's condition",
        nameEs: 'Evalúa el estado de tu casa',
        text: 'Cash buyers purchase as-is  -  no repairs, no inspections. Traditional listings require your home to pass buyer inspections. Factor in repair costs (average $8,000-$15,000 in Tucson) when comparing.',
        textEs: 'Los compradores en efectivo compran tal como está  -  sin reparaciones ni inspecciones. Los listados tradicionales requieren pasar inspecciones. Considera los costos de reparación.',
      },
      {
        name: 'Compare certainty vs. potential upside',
        nameEs: 'Compara certeza vs. potencial de ganancia',
        text: 'Traditional listings have upside  -  multiple offers can push price above asking. But 23% of Tucson traditional sales fall through after acceptance. Cash offers have ~98% close rate.',
        textEs: 'Los listados tradicionales tienen potencial de ganancia  -  múltiples ofertas pueden superar el precio pedido. Pero el 23% de las ventas tradicionales fracasan. Las ofertas en efectivo cierran ~98%.',
      },
    ],
  },

  'sell-or-rent-tucson': {
    name: 'How to Decide Whether to Sell or Rent Your Tucson Home',
    nameEs: 'Cómo Decidir si Vender o Rentar tu Casa en Tucson',
    description: 'A financial and lifestyle framework for Tucson homeowners deciding between selling for proceeds vs. keeping as a rental investment.',
    descriptionEs: 'Marco financiero y de estilo de vida para propietarios de Tucson que deciden entre vender o mantener como propiedad de renta.',
    totalTime: 'P14D',
    steps: [
      {
        name: 'Calculate your potential net proceeds from selling',
        nameEs: 'Calcula tus ganancias netas potenciales de vender',
        text: 'Get a CMA and estimate closing costs (5-8% of sale price in Tucson). Subtract your remaining mortgage balance. This is your equity-out number if you sell today.',
        textEs: 'Obtén un CMA y estima los costos de cierre (5-8% del precio de venta en Tucson). Resta tu saldo hipotecario restante. Este es tu número de capital si vendes hoy.',
      },
      {
        name: 'Estimate rental cash flow',
        nameEs: 'Estima el flujo de caja por renta',
        text: 'Research comparable Tucson rentals in your ZIP. Subtract: mortgage payment, property management (8-10%), insurance, taxes, vacancy (7-10% of annual rent), and repairs. Is the net positive?',
        textEs: 'Investiga rentas comparables en tu código postal de Tucson. Resta: pago de hipoteca, administración de propiedad (8-10%), seguro, impuestos, vacancia (7-10%) y reparaciones.',
      },
      {
        name: 'Consider your involvement and risk tolerance',
        nameEs: 'Considera tu disponibilidad y tolerancia al riesgo',
        text: "Being a landlord in Arizona means handling tenant issues, maintenance, and compliance with ARS Title 33. If you're relocating out of Tucson, factor in remote management costs.",
        textEs: 'Ser arrendador en Arizona significa manejar problemas de inquilinos, mantenimiento y cumplimiento. Si te mudas fuera de Tucson, considera los costos de gestión remota.',
      },
      {
        name: 'Run the 5-year scenario',
        nameEs: 'Ejecuta el escenario a 5 años',
        text: 'Model both paths over 5 years: selling today and reinvesting vs. holding as rental. Tucson home appreciation has averaged 4.2% annually  -  but rental income compounds too. Compare total wealth at year 5.',
        textEs: 'Modela ambos caminos a 5 años: vender hoy y reinvertir vs. mantener como renta. La apreciación de casas en Tucson ha promediado 4.2% anual. Compara la riqueza total al año 5.',
      },
    ],
  },

  'capital-gains-home-sale-arizona': {
    name: 'How to Handle Capital Gains When Selling Your Tucson Home',
    nameEs: 'Cómo Manejar las Ganancias de Capital al Vender tu Casa en Tucson',
    description: 'Understanding federal and Arizona capital gains tax exemptions, exclusions, and strategies for Tucson homeowners.',
    descriptionEs: 'Entendiendo las exenciones de impuestos sobre ganancias de capital federales y de Arizona para propietarios de Tucson.',
    totalTime: 'P30D',
    steps: [
      {
        name: 'Check if you qualify for the primary residence exclusion',
        nameEs: 'Verifica si calificas para la exclusión de residencia principal',
        text: 'Under IRS Section 121, single filers can exclude up to $250,000 in capital gains; married filing jointly, up to $500,000. You must have lived in the home 2 of the last 5 years.',
        textEs: 'Bajo la Sección 121 del IRS, los solteros pueden excluir hasta $250,000 en ganancias de capital; casados declarando conjuntamente, hasta $500,000. Debes haber vivido en la casa 2 de los últimos 5 años.',
      },
      {
        name: 'Calculate your adjusted cost basis',
        nameEs: 'Calcula tu base de costo ajustado',
        text: 'Start with your original purchase price. Add qualifying improvements (roof, HVAC, additions) and subtract depreciation if the home was ever rented. This is your adjusted basis.',
        textEs: 'Comienza con tu precio de compra original. Agrega mejoras calificadas y resta la depreciación si la casa alguna vez fue rentada. Esta es tu base ajustada.',
      },
      {
        name: 'Determine Arizona state tax liability',
        nameEs: 'Determina la obligación del impuesto estatal de Arizona',
        text: 'Arizona taxes capital gains as ordinary income (2.5% flat rate as of 2023 reforms). If you exceed the federal exclusion, the excess gain is taxable at both federal (15-20%) and Arizona rates.',
        textEs: 'Arizona grava las ganancias de capital como ingresos ordinarios (tasa fija del 2.5% desde las reformas de 2023). Si superas la exclusión federal, la ganancia excedente está gravada.',
      },
      {
        name: 'Consult a CPA before closing',
        nameEs: 'Consulta un CPA antes del cierre',
        text: 'Kasandra works with Tucson CPAs and can provide referrals. A pre-sale tax consultation costs $200-$500 but can save thousands in avoidable capital gains tax.',
        textEs: 'Kasandra trabaja con CPAs de Tucson y puede dar referencias. Una consulta fiscal previa a la venta cuesta $200-$500 pero puede ahorrar miles en impuestos sobre ganancias de capital.',
      },
    ],
  },

  'divorce-selling': {
    name: 'How to Sell a Home During Divorce in Arizona',
    nameEs: 'Cómo Vender una Casa Durante un Divorcio en Arizona',
    description: 'A step-by-step process for Tucson couples navigating home sale during divorce under Arizona community property law.',
    descriptionEs: 'Proceso paso a paso para parejas de Tucson que venden su casa durante un divorcio bajo la ley de propiedad comunitaria de Arizona.',
    totalTime: 'P90D',
    steps: [
      {
        name: 'Understand Arizona community property rules',
        nameEs: 'Entiende las reglas de propiedad comunitaria de Arizona',
        text: 'Arizona is a community property state. Any home purchased during marriage is typically owned 50/50. Homes owned before marriage or received as gifts/inheritance may be separate property.',
        textEs: 'Arizona es un estado de propiedad comunitaria. Cualquier casa comprada durante el matrimonio generalmente es 50/50. Las casas de antes del matrimonio pueden ser propiedad separada.',
      },
      {
        name: 'Agree on the disposition of the home',
        nameEs: 'Acuerden la disposición de la casa',
        text: 'Options: (1) Sell now and split proceeds, (2) one spouse buys out the other, (3) deferred sale until children leave school. Document the agreement in a Marital Settlement Agreement (MSA).',
        textEs: 'Opciones: (1) Vender ahora y dividir fondos, (2) un cónyuge compra la parte del otro, (3) venta diferida hasta que los hijos terminen la escuela. Documenta en un Acuerdo de Liquidación Marital.',
      },
      {
        name: 'List with a neutral REALTOR®',
        nameEs: 'Lista con un REALTOR® neutral',
        text: 'Use a single bilingual agent  -  like Kasandra Prieto  -  both parties trust to avoid coordination problems. Kasandra has worked with divorce sales in Tucson and prioritizes efficiency and fairness.',
        textEs: 'Usa un solo agente bilingüe en quien ambas partes confíen para evitar problemas de coordinación. Kasandra ha trabajado con ventas de divorcio en Tucson.',
      },
      {
        name: 'Coordinate timing with your divorce decree',
        nameEs: 'Coordina el timing con tu decreto de divorcio',
        text: 'If your divorce is finalized before the home sells, ensure the decree specifies how proceeds are divided and who handles decisions (repairs, price reductions, offer acceptance).',
        textEs: 'Si tu divorcio se finaliza antes de vender la casa, asegúrate de que el decreto especifique cómo se dividen los fondos y quién toma decisiones sobre reparaciones y aceptación de oferta.',
      },
    ],
  },

  'senior-downsizing': {
    name: 'How to Downsize Your Tucson Home as a Senior',
    nameEs: 'Cómo Reducir tu Vivienda en Tucson como Mayor de Edad',
    description: 'A calm, step-by-step guide for Tucson seniors planning to downsize  -  timing, possessions, community options, and selling the family home.',
    descriptionEs: 'Guía tranquila y paso a paso para mayores de Tucson que planean reducir su vivienda  -  timing, pertenencias, opciones de comunidad y venta de la casa familiar.',
    totalTime: 'P120D',
    steps: [
      {
        name: 'Start with the "why"  -  clarify your goals',
        nameEs: 'Comienza con el "por qué"  -  clarifica tus metas',
        text: 'Common reasons to downsize in Tucson: reduce maintenance, access equity, move closer to family, transition to age-restricted communities (55+), or simplify daily life. Your reason shapes your timeline.',
        textEs: 'Razones comunes para reducir en Tucson: reducir mantenimiento, acceder al capital, mudarte cerca de la familia o simplificar la vida diaria. Tu razón da forma a tu plazo.',
      },
      {
        name: 'Sort belongings with a system',
        nameEs: 'Organiza las pertenencias con un sistema',
        text: 'Use the "keep, gift, sell, donate" framework room by room. Start 3-4 months before listing. Tucson has estate sale services and senior move managers who specialize in this process.',
        textEs: 'Usa el marco "guardar, regalar, vender, donar" habitación por habitación. Comienza 3-4 meses antes de listar. Tucson tiene servicios de ventas de herencia especializados.',
      },
      {
        name: 'Explore your next home options in Tucson',
        nameEs: 'Explora tus opciones de próxima vivienda en Tucson',
        text: 'Tucson has active adult communities (Sun City Vistoso, Saddlebrooke), independent living, assisted living, and smaller single-family homes. Define your ideal next step before listing your current home.',
        textEs: 'Tucson tiene comunidades para adultos activos (Sun City Vistoso, Saddlebrooke), vida independiente, asistida y casas unifamiliares más pequeñas. Define tu próximo paso antes de listar.',
      },
      {
        name: 'Review tax implications of selling',
        nameEs: 'Revisa las implicaciones fiscales de vender',
        text: "Seniors often qualify for the full $250K/$500K federal capital gains exclusion. Arizona's flat 2.5% rate applies to gains above the exclusion. Consult a CPA before closing  -  Kasandra can refer you.",
        textEs: 'Los mayores a menudo califican para la exclusión completa de ganancias de capital de $250K/$500K. La tasa plana del 2.5% de Arizona se aplica a las ganancias sobre la exclusión.',
      },
    ],
  },

  'distressed-preforeclosure': {
    name: 'How to Avoid Foreclosure by Selling Your Tucson Home',
    nameEs: 'Cómo Evitar la Ejecución Hipotecaria Vendiendo tu Casa en Tucson',
    description: 'Options and steps for Tucson homeowners facing foreclosure  -  short sale, loan modification, or selling before the bank acts.',
    descriptionEs: 'Opciones y pasos para propietarios de Tucson que enfrentan ejecución hipotecaria  -  venta corta, modificación de préstamo o vender antes de que el banco actúe.',
    totalTime: 'P30D',
    steps: [
      {
        name: 'Understand Arizona foreclosure timelines',
        nameEs: 'Entiende los plazos de ejecución hipotecaria en Arizona',
        text: 'Arizona allows non-judicial (trustee sale) foreclosure. Once a Notice of Trustee Sale is filed, you have 91 days before the auction. Acting within those 91 days is critical  -  contact Kasandra immediately.',
        textEs: 'Arizona permite la ejecución hipotecaria no judicial. Una vez presentado el Aviso de Venta del Fiduciario, tienes 91 días antes de la subasta. Actuar dentro de esos 91 días es crítico.',
      },
      {
        name: 'Contact your lender  -  request a hardship review',
        nameEs: 'Contacta a tu prestamista  -  solicita una revisión de dificultades',
        text: 'Call your servicer's loss mitigation department. Request a forbearance, loan modification, or repayment plan. Document every call. This can pause foreclosure proceedings while options are evaluated.',
        textEs: 'Llama al departamento de mitigación de pérdidas de tu prestamista. Solicita una moratoria, modificación de préstamo o plan de pago. Documenta cada llamada.',
      },
      {
        name: 'Evaluate a short sale if you're underwater',
        nameEs: 'Evalúa una venta corta si debes más de lo que vale la casa',
        text: 'A short sale lets you sell for less than you owe with lender approval. It damages credit less than foreclosure, avoids a deficiency judgment in most Arizona cases, and stops the clock.',
        textEs: 'Una venta corta te permite vender por menos de lo que debes con aprobación del prestamista. Daña menos el crédito que una ejecución y evita una sentencia de deficiencia en Arizona.',
      },
      {
        name: 'Sell quickly before the trustee sale date',
        nameEs: 'Vende rápido antes de la fecha de subasta',
        text: 'If you have equity, a quick cash sale (7-14 days) via Corner Connect pays off the mortgage, stops foreclosure, and returns remaining equity to you. This is the fastest, cleanest exit.',
        textEs: 'Si tienes capital, una venta rápida en efectivo (7-14 días) a través de Corner Connect paga la hipoteca, detiene la ejecución y te devuelve el capital restante.',
      },
    ],
  },

  'sell-now-or-wait': {
    name: 'How to Decide Whether to Sell Your Tucson Home Now or Wait',
    nameEs: 'Cómo Decidir si Vender tu Casa en Tucson Ahora o Esperar',
    description: 'A data-driven framework for Tucson sellers evaluating market timing in 2026.',
    descriptionEs: 'Marco basado en datos para vendedores de Tucson que evalúan el timing del mercado en 2026.',
    totalTime: 'P14D',
    steps: [
      {
        name: 'Check current Tucson market conditions',
        nameEs: 'Revisa las condiciones actuales del mercado de Tucson',
        text: 'Review days-on-market (DOM), list-to-sale price ratio, and active inventory in your ZIP code. Kasandra's market intelligence page has live Tucson housing data updated monthly.',
        textEs: 'Revisa los días en el mercado (DOM), la relación precio lista vs. venta e inventario activo en tu código postal. La página de inteligencia de mercado de Kasandra tiene datos en vivo.',
      },
      {
        name: 'Calculate your carrying cost of waiting',
        nameEs: 'Calcula tu costo de espera',
        text: 'Every month you wait costs: mortgage payment, taxes, insurance, HOA (if applicable), and maintenance. In Tucson, average monthly holding cost is $1,800-$3,200 depending on home value.',
        textEs: 'Cada mes que esperas cuesta: pago de hipoteca, impuestos, seguro, HOA y mantenimiento. En Tucson, el costo de espera mensual promedio es $1,800-$3,200 según el valor de la casa.',
      },
      {
        name: 'Model your net at different sale prices',
        nameEs: 'Modela tu neto a diferentes precios de venta',
        text: 'Use the net proceeds calculator to model: what if I sell today for $X vs. wait 6 months for $X+5%? Subtract 6 months of holding costs from the higher figure. Is the net difference worth the wait?',
        textEs: 'Usa la calculadora de ganancias netas para modelar: ¿qué pasa si vendo hoy por $X vs. espero 6 meses por $X+5%? Resta 6 meses de costos de tenencia. ¿Vale la pena la diferencia?',
      },
      {
        name: 'Consider personal timeline above all',
        nameEs: 'Considera tu plazo personal por encima de todo',
        text: 'Market timing matters less than personal readiness. The best time to sell is when it aligns with your life. Kasandra's role is to give you honest data  -  not pressure you to list or wait.',
        textEs: 'El timing del mercado importa menos que tu preparación personal. El mejor momento para vender es cuando se alinea con tu vida. El rol de Kasandra es darte datos honestos.',
      },
    ],
  },

  'move-up-buyer': {
    name: 'How to Buy Your Next Home While Selling Your Current Tucson Home',
    nameEs: 'Cómo Comprar tu Próxima Casa Mientras Vendes tu Casa Actual en Tucson',
    description: 'Step-by-step guide for Tucson move-up buyers coordinating the simultaneous sale and purchase without owning two homes.',
    descriptionEs: 'Guía paso a paso para compradores de actualización en Tucson que coordinan la venta y compra simultánea sin tener dos casas.',
    totalTime: 'P90D',
    steps: [
      {
        name: 'Get pre-approved for your next purchase',
        nameEs: 'Obtén preaprobación para tu próxima compra',
        text: 'Before listing your current home, get pre-approved using your existing equity + income. Your lender needs to underwrite the purchase independently of your sale  -  contingency offers are harder to win in Tucson's market.',
        textEs: 'Antes de listar tu casa, obtén preaprobación usando tu capital actual + ingresos. Las ofertas contingentes son más difíciles de ganar en el mercado de Tucson.',
      },
      {
        name: 'Understand your bridge options',
        nameEs: 'Entiende tus opciones de financiamiento puente',
        text: 'Options: (1) sell first, rent temporarily, then buy; (2) bridge loan using existing equity; (3) HELOC on current home; (4) contingency offer (risky in seller's market). Each has cost implications.',
        textEs: 'Opciones: (1) vender primero, rentar temporalmente, luego comprar; (2) préstamo puente usando el capital actual; (3) HELOC en la casa actual; (4) oferta contingente.',
      },
      {
        name: 'List your current home strategically',
        nameEs: 'Lista tu casa actual estratégicamente',
        text: 'Use a sale-leaseback if available: sell your home but negotiate a 30-60 day post-close occupancy so you have time to find and close on your next Tucson home. Kasandra structures these routinely.',
        textEs: 'Usa un leaseback de venta si está disponible: vende tu casa pero negocia 30-60 días de ocupación posterior al cierre para tener tiempo de encontrar y cerrar tu próxima casa.',
      },
      {
        name: 'Coordinate closings within the same 30-day window',
        nameEs: 'Coordina los cierres dentro de la misma ventana de 30 días',
        text: 'The cleanest move-up strategy: close on the sale and purchase within 5-10 days of each other. Kasandra coordinates both transactions as a dual-agent or with a trusted buyer's agent referral.',
        textEs: 'La estrategia de actualización más limpia: cierra la venta y la compra con 5-10 días de diferencia. Kasandra coordina ambas transacciones.',
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
