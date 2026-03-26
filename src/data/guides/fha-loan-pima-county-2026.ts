import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'FHA Loan Limits in Pima County 2026: What Every Tucson Buyer Needs to Know',
  titleEs: 'Límites de Préstamos FHA en el Condado de Pima 2026: Lo Que Todo Comprador de Tucson Necesita Saber',
  category: 'Buying a Home',
  categoryEs: 'Comprando una Casa',
  author: 'Kasandra Prieto',
  intro: "If you're worried about the down payment, FHA is probably the first conversation we should have. It's the most common loan I see first-time buyers use in Tucson — low down payment, flexible credit requirements, and it pairs beautifully with Pima County's assistance programs. Here's what the 2026 limits actually mean for you.",
  introEs: "Los préstamos FHA son el camino más común hacia la propiedad de vivienda para compradores primerizos en Tucson — pero el límite del préstamo determina cuánta casa pueden financiar. Aquí está exactamente lo que los límites de 2026 significan para los compradores en el Condado de Pima y cómo usar esta herramienta de financiamiento de manera efectiva.",
  sections: [
    {
      heading: '2026 FHA Loan Limits for Pima County',
      headingEs: 'Límites de Préstamos FHA 2026 para el Condado de Pima',
      content: "The Federal Housing Administration sets loan limits annually based on local home prices. For 2026, Pima County FHA limits are:\n\n• **One-unit (single-family home):** $524,225\n• **Two-unit (duplex):** $638,100\n• **Three-unit (triplex):** $771,125\n• **Four-unit (fourplex):** $958,350\n\nFor context, the Tucson metro median home price is approximately $365,000 — which means the FHA limit covers the vast majority of homes in the market. Only luxury properties and certain Foothills homes price above the FHA ceiling.\n\n**The national floor** (for the lowest-cost areas in the U.S.) is $524,225 for a single-family home in 2026. Pima County falls below this floor, reflecting that Tucson remains one of the more affordable major metros in the Southwest.",
      contentEs: "La Administración Federal de Vivienda establece límites de préstamos anualmente basándose en los precios locales de viviendas. Para 2026, los límites FHA del Condado de Pima son:\n\n• **Una unidad (casa unifamiliar):** $524,225\n• **Dos unidades (dúplex):** $638,100\n• **Tres unidades (tríplex):** $771,125\n• **Cuatro unidades (cuadruplex):** $958,350\n\nPara contexto, el precio medio de vivienda del área metropolitana de Tucson es aproximadamente $365,000 — lo que significa que el límite FHA cubre la gran mayoría de las casas en el mercado.",
      variant: 'stats-grid' as const,
      statsData: [
        { value: '$524,225', valueEs: '$524,225', label: 'Pima County FHA limit — single family (2026)', labelEs: 'Límite FHA Condado de Pima — unifamiliar (2026)', dynamicKey: 'fhaLimit' },
        { value: '3.5%', valueEs: '3.5%', label: 'Minimum down payment with 580+ credit score', labelEs: 'Pago inicial mínimo con puntaje 580+' },
        { value: '580', valueEs: '580', label: 'Minimum credit score for 3.5% down FHA', labelEs: 'Puntaje mínimo para FHA con 3.5% inicial' },
        { value: '43%', valueEs: '43%', label: 'Maximum debt-to-income ratio (typically)', labelEs: 'Relación deuda-ingreso máxima (típicamente)' },
      ],
    },
    {
      heading: 'How FHA Loans Work: The Basics',
      headingEs: 'Cómo Funcionan los Préstamos FHA: Lo Básico',
      content: "FHA loans are government-backed mortgages insured by the Federal Housing Administration. Because the government insures the lender against default, lenders can offer more flexible terms — lower credit scores, lower down payments, and more lenient debt-to-income ratios.\n\n**Key FHA features for Tucson buyers in 2026:**\n\n**Down payment:**\n• 580+ credit score: 3.5% minimum down payment\n• 500–579 credit score: 10% minimum down payment\n• Below 500: not eligible for FHA\n\n**Mortgage Insurance:**\nFHA requires two types of mortgage insurance:\n• Upfront MIP: 1.75% of loan amount (can be rolled into the loan)\n• Annual MIP: 0.55%–1.05% depending on loan term and LTV, paid monthly\n\nFor most Tucson buyers putting 3.5% down on a 30-year loan, the annual MIP rate is 0.55% — approximately $134/month on a $292,500 loan.\n\n**MIP removal:** FHA MIP on loans originated after June 2013 with less than 10% down is permanent for the life of the loan. Borrowers who want to remove MIP must refinance into a conventional loan once they have sufficient equity (typically 20%).\n\n**Debt-to-income:** FHA allows higher DTI than conventional in many cases — up to 43–50% with compensating factors. This is why FHA is accessible for buyers with student loans, car payments, and other monthly obligations.",
      contentEs: "Los préstamos FHA son hipotecas respaldadas por el gobierno aseguradas por la Administración Federal de Vivienda. Debido a que el gobierno asegura al prestamista contra el incumplimiento, los prestamistas pueden ofrecer términos más flexibles — puntajes de crédito más bajos, pagos iniciales más bajos y relaciones deuda-ingreso más indulgentes.\n\n**Características clave de FHA para compradores de Tucson en 2026:**\n\n**Pago inicial:**\n• Puntaje de crédito 580+: mínimo 3.5% de pago inicial\n• Puntaje de crédito 500–579: mínimo 10% de pago inicial\n\n**Seguro Hipotecario:**\nFHA requiere dos tipos de seguro hipotecario:\n• MIP inicial: 1.75% del monto del préstamo (se puede incluir en el préstamo)\n• MIP anual: 0.55%–1.05% dependiendo del plazo del préstamo y LTV, pagado mensualmente",
    },
    {
      heading: 'FHA vs. Conventional: When Does Each Make Sense?',
      headingEs: 'FHA vs. Convencional: ¿Cuándo Tiene Sentido Cada Uno?',
      content: "FHA and conventional loans serve different buyer profiles. Here's how to think about which is right for you:\n\n**Choose FHA if:**\n• Your credit score is 580–679 (FHA is more forgiving in this range)\n• You have a higher debt-to-income ratio (student loans, car payments)\n• You have limited savings and need the 3.5% down option\n• You're a DACA recipient (FHA explicitly allows DACA borrowers as of 2021)\n• You're using down payment assistance that pairs with FHA\n\n**Choose Conventional if:**\n• Your credit score is 740+ (you'll get better rates and lower PMI)\n• You can put 20% down (eliminates PMI entirely)\n• You have a low DTI and strong financial profile\n• You want to avoid the permanent MIP requirement of FHA\n• Your purchase price is above the FHA limit ($524,225 in Pima County)\n\n**The credit score crossover point:**\nRoughly speaking, buyers with scores of 680–720 should compare FHA and conventional side by side. At 720+, conventional almost always wins on total cost. Below 680, FHA typically wins on access and rate.\n\nKasandra can connect you with a trusted local lender who can run both scenarios with your actual numbers — showing you exactly what the monthly payment, total cost, and break-even point would be for each option.",
      contentEs: "Los préstamos FHA y convencionales sirven a diferentes perfiles de compradores. Así es como pensar sobre cuál es el correcto para ti:\n\n**Elige FHA si:**\n• Tu puntaje de crédito es 580–679\n• Tienes una relación deuda-ingreso más alta (préstamos estudiantiles, pagos de automóvil)\n• Tienes ahorros limitados y necesitas la opción de 3.5% inicial\n• Eres beneficiario de DACA (FHA permite explícitamente a los prestatarios DACA desde 2021)\n\n**Elige Convencional si:**\n• Tu puntaje de crédito es 740+\n• Puedes poner 20% inicial (elimina PMI por completo)\n• Tu precio de compra está por encima del límite FHA ($524,225 en el Condado de Pima)",
    },
    {
      heading: 'FHA and Down Payment Assistance: The Power Combination',
      headingEs: 'FHA y Asistencia para el Pago Inicial: La Combinación Poderosa',
      content: "The best-kept secret in Tucson homebuying is that FHA loans pair beautifully with Pima County's down payment assistance programs. Here's a real example:\n\n**Scenario: First-time buyer, $300K home, 600 credit score**\n\nWithout assistance:\n• 3.5% down payment: $10,500\n• Closing costs (estimate): $7,000\n• Total cash needed: $17,500\n\nWith PTHS (5% of purchase price):\n• DPA received: $15,000\n• Cash from buyer: $2,500 + reserves\n• Net out-of-pocket: dramatically reduced\n\nWith City of Tucson HOME Program (up to 20%):\n• Potential DPA: up to $60,000\n• Could eliminate down payment AND closing costs entirely\n• Requires HUD counseling and income qualification\n\nSee our dedicated Down Payment Assistance guide for a full breakdown of available programs, income limits, and how to stack them effectively.",
      contentEs: "El secreto mejor guardado en la compra de vivienda en Tucson es que los préstamos FHA se combinan perfectamente con los programas de asistencia para pago inicial del Condado de Pima.\n\n**Escenario: Comprador primerizo, casa de $300K, puntaje de crédito 600**\n\nSin asistencia:\n• Pago inicial del 3.5%: $10,500\n• Costos de cierre (estimado): $7,000\n• Total en efectivo necesario: $17,500\n\nCon PTHS (5% del precio de compra):\n• DPA recibido: $15,000\n• Efectivo del comprador: $2,500 + reservas",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "If FHA looks like the right path for you, the next step is a pre-approval conversation with a lender — not just to confirm eligibility, but to understand exactly how much house you can buy with today's numbers, and which down payment assistance programs you qualify for.\n\nKasandra works with Tucson buyers every week who are using FHA + local DPA programs to buy their first homes. She can make the right lender introduction and walk you through the process from your first question to closing day.",
      contentEs: "Si FHA parece el camino correcto para ti, el siguiente paso es una conversación de pre-aprobación con un prestamista — no solo para confirmar la elegibilidad, sino para entender exactamente cuánta casa puedes comprar con los números de hoy, y qué programas de asistencia para pago inicial calificas.\n\nKasandra trabaja con compradores de Tucson cada semana que están usando FHA + programas DPA locales para comprar sus primeras casas.",
    },
    {
      heading: '',
      headingEs: '',
      content: '',
      contentEs: '',
      variant: 'tool-bridge' as const,
    },
    {
      heading: 'Frequently Asked Questions',
      headingEs: 'Preguntas Frecuentes',
      content: '',
      contentEs: '',
      variant: 'faq' as const,
      faqItems: [
        {
          question: 'What is the FHA loan limit in Pima County for 2026?',
          questionEs: '¿Cuál es el límite del préstamo FHA en el Condado de Pima para 2026?',
          answer: 'The 2026 FHA loan limit for a single-family home in Pima County is $524,225. This covers the vast majority of homes in the Tucson market, where the median price is approximately $365,000. If the home you want is priced above $524,225, you would need to explore conventional financing or a jumbo loan.',
          answerEs: 'El límite del préstamo FHA de 2026 para una casa unifamiliar en el Condado de Pima es $524,225. Esto cubre la gran mayoría de las casas en el mercado de Tucson, donde el precio medio es aproximadamente $365,000.',
        },
        {
          question: 'Can I use an FHA loan to buy a duplex or investment property in Tucson?',
          questionEs: '¿Puedo usar un préstamo FHA para comprar un dúplex o propiedad de inversión en Tucson?',
          answer: "FHA loans can be used for 2–4 unit properties, but you must live in one of the units as your primary residence. The 2026 FHA limit for a duplex in Pima County is $638,100, and for a fourplex it's $958,350. This is a legitimate strategy for buyers who want to offset their mortgage with rental income — often called 'house hacking.' I can walk you through how this works in Tucson's current market.",
          answerEs: 'Los préstamos FHA se pueden usar para propiedades de 2–4 unidades, pero debes vivir en una de las unidades como tu residencia principal. El límite FHA de 2026 para un dúplex en el Condado de Pima es $638,100, y para un cuadruplex es $958,350.',
        },
        {
          question: 'Does FHA require a home inspection?',
          questionEs: '¿FHA requiere una inspección de la casa?',
          answer: "FHA requires an appraisal by an FHA-approved appraiser — which includes a basic property condition assessment as part of the appraisal. This is NOT the same as a full home inspection. FHA appraisers check for major safety or livability issues (missing handrails, roof condition, exposed wiring) but they don't provide the detailed assessment a private inspector does. I always recommend a full independent inspection for any buyer, regardless of loan type.",
          answerEs: 'FHA requiere una tasación por un tasador aprobado por FHA — que incluye una evaluación básica de las condiciones de la propiedad. Esto NO es lo mismo que una inspección completa de la casa. Siempre recomiendo una inspección independiente completa para cualquier comprador, independientemente del tipo de préstamo.',
        },
      ],
    },
  ],

  externalLinks: [
    {
      label: 'FHA Loan Limits 2026 — HUD.gov',
      labelEs: 'Límites de Préstamos FHA 2026 — HUD.gov',
      url: 'https://www.hud.gov/program_offices/housing/sfh/lender/origination/mortgage_limits',
      description: 'Verify the current 2026 FHA loan limits for Pima County directly from the U.S. Department of Housing and Urban Development.',
      descriptionEs: 'Verifique los límites actuales del préstamo FHA 2026 para el Condado de Pima directamente del Departamento de Vivienda y Desarrollo Urbano de EE.UU.',
    },
    {
      label: 'FHA Requirements — HUD.gov',
      labelEs: 'Requisitos FHA — HUD.gov',
      url: 'https://www.hud.gov/buying/loans',
      description: 'Official FHA loan requirements, down payment minimums, and credit score guidelines from HUD.',
      descriptionEs: 'Requisitos oficiales del préstamo FHA, mínimos de pago inicial y pautas de puntaje de crédito de HUD.',
    },
    {
      label: 'Find FHA-Approved Lenders in Arizona',
      labelEs: 'Encontrar Prestamistas Aprobados por FHA en Arizona',
      url: 'https://apps.hud.gov/apps/nclll/index.cfm',
      description: "Search for FHA-approved lenders in Tucson and Pima County through HUD's official lender locator.",
      descriptionEs: "Busque prestamistas aprobados por FHA en Tucson y el Condado de Pima a través del localizador oficial de prestamistas de HUD.",
    },
  ],
};

export default data;
