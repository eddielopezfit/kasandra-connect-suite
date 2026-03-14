import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'First-Time Home Buyer Programs in Pima County 2026: The Complete Guide',
  titleEs: 'Programas para Compradores de Primera Vivienda en el Condado de Pima 2026: La Guía Completa',
  category: 'Buying a Home',
  categoryEs: 'Comprando una Casa',
  author: 'Kasandra Prieto',
  intro: "I love this conversation. The moment I tell a first-time buyer everything that's available in Pima County — the programs, the income limits, how to stack them — I can see the relief on their face. It's more help than they thought existed, and they didn't know to ask. So here's the full picture, because you deserve to know what you qualify for before you talk to a single lender.",
  introEs: "Si estás comprando tu primera casa — o no has sido propietario en los últimos tres años — el Condado de Pima tiene más asistencia financiera disponible de lo que la mayoría de los compradores se da cuenta. Esta guía cubre cada programa activo, cómo combinarlos, y el camino realista desde 'pensándolo' hasta las llaves en mano.",
  sections: [
    {
      heading: 'What "First-Time Buyer" Actually Means (Hint: You May Still Qualify)',
      headingEs: 'Lo Que Realmente Significa "Comprador por Primera Vez" (Pista: Aún Puedes Calificar)',
      content: "The federal and state definition of a first-time homebuyer is broader than most people assume:\n\n**You are considered a first-time buyer if you:**\n• Have never owned a home\n• Have not owned a home as your primary residence in the past 3 years\n• Are a single parent who has only owned with a former spouse during marriage\n• Are a displaced homemaker who has only owned with a spouse\n• Have only owned a principal residence that was not permanently affixed to a permanent foundation (mobile home)\n\n**This means:**\nIf you owned a home that you sold or lost to foreclosure more than 3 years ago, you qualify as a first-time buyer today. If you owned an investment property but never a primary residence, you may qualify. If you've been renting for the past several years after a previous ownership, you're likely eligible.\n\nThe 3-year look-back is the most important number. Don't disqualify yourself based on a misunderstanding of the definition — confirm with a lender.",
      contentEs: "La definición federal y estatal de comprador de primera vivienda es más amplia de lo que la mayoría de las personas asumen:\n\n**Se te considera comprador primerizo si:**\n• Nunca has sido propietario de una casa\n• No has sido propietario de una casa como tu residencia principal en los últimos 3 años\n• Eres un padre soltero que solo ha sido propietario con un ex cónyuge durante el matrimonio\n• Solo has sido propietario de una residencia principal que no estaba permanentemente adherida a una base permanente (casa móvil)\n\n**Esto significa:**\nSi eras propietario de una casa que vendiste o perdiste en una ejecución hipotecaria hace más de 3 años, hoy calificas como comprador primerizo.",
      variant: 'stats-grid' as const,
      statsData: [
        { value: '3 years', valueEs: '3 años', label: 'Look-back period for first-time buyer qualification', labelEs: 'Período de revisión para calificación de comprador primerizo' },
        { value: '4+', valueEs: '4+', label: 'Active DPA programs in Pima County (2026)', labelEs: 'Programas DPA activos en el Condado de Pima (2026)' },
        { value: '$0', valueEs: '$0', label: 'Possible out-of-pocket with stacked programs', labelEs: 'Posible gasto de bolsillo combinando programas' },
        { value: '$146K', valueEs: '$146K', label: 'PTHS income limit — covers most Tucson families', labelEs: 'Límite de ingresos PTHS — cubre la mayoría de las familias de Tucson' },
      ],
    },
    {
      heading: 'Program 1: Pima Tucson Homebuyer\'s Solution (PTHS)',
      headingEs: 'Programa 1: Pima Tucson Homebuyer\'s Solution (PTHS)',
      content: "**The most accessible program in Pima County — and the one most buyers should start with.**\n\n• **Assistance amount:** Up to 5% of purchase price (covers down payment and/or closing costs)\n• **Loan types:** FHA, VA, USDA, Fannie Mae HFA Preferred, Freddie Mac Advantage\n• **Income limit:** $146,503 (all household members combined)\n• **First-time buyer requirement:** None — can be used by repeat buyers\n• **Purchase price cap:** No separate cap — limited only by the underlying loan program's limits\n• **Repayment:** Forgiven monthly over 5 years as a silent second mortgage\n• **Credit score:** Minimum varies by loan type (580+ for FHA, 620+ for conventional)\n\n**Best for:** Most first-time buyers in Pima County, particularly those who want flexibility in loan type and don't need the maximum income restriction\n\n**Real example:** Buyer with $80,000 income, 620 credit score, purchasing a $320,000 home with FHA + PTHS:\n• FHA requires 3.5% down ($11,200)\n• PTHS provides 5% ($16,000)\n• Remaining after down payment: $4,800 toward closing costs\n• Buyer's actual cash need: potentially under $3,000\n\nwww.pimatucsonhomebuyers.com",
      contentEs: "**El programa más accesible en el Condado de Pima — y el que la mayoría de los compradores deberían iniciar.**\n\n• **Cantidad de asistencia:** Hasta 5% del precio de compra (cubre pago inicial y/o costos de cierre)\n• **Tipos de préstamos:** FHA, VA, USDA, Fannie Mae HFA Preferred, Freddie Mac Advantage\n• **Límite de ingresos:** $146,503 (todos los miembros del hogar combinados)\n• **Requisito de comprador primerizo:** Ninguno — puede ser usado por compradores repetidos\n• **Reembolso:** Perdonado mensualmente durante 5 años como segunda hipoteca silenciosa\n\n**Mejor para:** La mayoría de los compradores primerizos en el Condado de Pima",
    },
    {
      heading: 'Program 2: City of Tucson / Pima County HOME Program (CIC)',
      headingEs: 'Programa 2: Programa HOME de la Ciudad de Tucson / Condado de Pima (CIC)',
      content: "**The most generous assistance available — up to 20% of purchase price.**\n\nAdministered by Community Investment Corporation (CIC), this program provides the largest down payment assistance in the Tucson area:\n\n• **Assistance amount:** Up to 20% of purchase price\n• **Requirements:**\n  — Must be a primary residence\n  — HUD-certified homebuyer counseling required before contract\n  — $1,000 minimum own funds required\n  — 2 months mortgage payment reserves required\n  — Maximum 45% debt-to-income ratio (above 35% needs compensating factors)\n  — Property must be inspected by program-approved inspector\n  — No adjustable-rate mortgages (ARM) permitted\n• **Income limits:** Vary by household size — contact CIC for current figures\n• **Affordability period:** Longer term than PTHS — assistance is a second mortgage with an affordability period\n\n**Best for:** Buyers with limited savings but stable income who need maximum down payment assistance\n\n**Note:** The HUD counseling requirement is often the biggest hurdle — it's an 8-hour course (available online) required BEFORE signing a purchase contract. Start this early. It typically costs $50–$125.\n\nwww.cictucson.org",
      contentEs: "**La asistencia más generosa disponible — hasta el 20% del precio de compra.**\n\nAdministrado por Community Investment Corporation (CIC), este programa proporciona la mayor asistencia para pago inicial en el área de Tucson:\n\n• **Cantidad de asistencia:** Hasta 20% del precio de compra\n• **Requisitos:**\n  — Debe ser residencia principal\n  — Se requiere asesoramiento para compradores certificado por HUD antes del contrato\n  — $1,000 mínimo en fondos propios requeridos\n  — 2 meses de reservas de pago hipotecario requeridos\n  — Máximo 45% de relación deuda-ingreso\n\n**Mejor para:** Compradores con ahorros limitados pero ingresos estables que necesitan la máxima asistencia para el pago inicial",
    },
    {
      heading: 'Program 3: Lighthouse (Pima IDA)',
      headingEs: 'Programa 3: Lighthouse (Pima IDA)',
      content: "**The rate advantage program — combines down payment help with a below-market interest rate.**\n\n• **Assistance:** 4% of loan amount (average ~$15,000)\n• **Rate:** 5.84% fixed (vs. ~6.5–6.8% market rate as of 2026) — a meaningful rate reduction\n• **Income limits (targeted areas):** $113,000 for couples, $131,000 for families\n• **Income limits (non-targeted areas):** Lower — confirm with lender\n• **Purchase price limit:** $624,000 (targeted areas), $501,000 (non-targeted)\n• **First-time buyer requirement:** Yes — no ownership in past 3 years\n• **Forgivable:** 5-year lien, forgiven if you stay without refinancing\n\n**Critical note:** Lighthouse opens in funding rounds. Each round has limited funds (~90 buyers). Rounds often exhaust within weeks. You need to be pre-approved and ready when a round opens.\n\n**Best for:** First-time buyers who want the double benefit of a reduced interest rate AND down payment help, and who can move quickly when funding opens.\n\nwww.housinginnovationhub.org/program-lighthouse",
      contentEs: "**El programa de ventaja de tasa — combina ayuda para el pago inicial con una tasa de interés por debajo del mercado.**\n\n• **Asistencia:** 4% del monto del préstamo (promedio ~$15,000)\n• **Tasa:** 5.84% fija (vs. ~6.5–6.8% tasa de mercado en 2026)\n• **Límites de ingresos (áreas objetivo):** $113,000 para parejas, $131,000 para familias\n• **Requisito de comprador primerizo:** Sí — sin propiedad en los últimos 3 años\n• **Condonable:** Gravamen de 5 años, perdonado si te quedas sin refinanciar\n\n**Nota crítica:** Lighthouse abre en rondas de financiamiento. Cada ronda tiene fondos limitados (~90 compradores). Las rondas a menudo se agotan en semanas.",
    },
    {
      heading: 'Program 4: Arizona Home Plus',
      headingEs: 'Programa 4: Arizona Home Plus',
      content: "**The statewide option — useful when Pima County-specific programs are exhausted.**\n\n• **Assistance:** Up to 5% of loan amount (varies by program option selected)\n• **Loan types:** FHA, VA, USDA, conventional\n• **Income limit:** Varies by program option — currently $122,100+ for most options\n• **Credit score:** Typically 640+ for most options\n• **No first-time buyer requirement** for most options\n• **Available statewide** including Pima County\n\n**Best for:** Buyers who don't qualify for Pima County-specific programs due to income or other factors, or when local funding is temporarily exhausted.\n\n**How it compares to PTHS:** Arizona Home Plus and PTHS are different programs with different income limits and loan requirements. Your lender can determine which provides the better benefit for your specific situation.\n\nwww.homeplusaz.com",
      contentEs: "**La opción estatal — útil cuando los programas específicos del Condado de Pima se agotan.**\n\n• **Asistencia:** Hasta 5% del monto del préstamo\n• **Tipos de préstamos:** FHA, VA, USDA, convencional\n• **Límite de ingresos:** Varía según la opción del programa — actualmente $122,100+ para la mayoría de las opciones\n• **Sin requisito de comprador primerizo** para la mayoría de las opciones\n\n**Mejor para:** Compradores que no califican para programas específicos del Condado de Pima, o cuando el financiamiento local está temporalmente agotado.",
    },
    {
      heading: 'The Path from Start to Keys: A Realistic Timeline',
      headingEs: 'El Camino desde el Inicio hasta las Llaves: Un Cronograma Realista',
      content: "**Month 1 — Foundation:**\n• Review your credit at AnnualCreditReport.com (free)\n• Calculate your debt-to-income ratio\n• Determine which DPA programs you likely qualify for based on income\n• If credit needs work: start credit repair now (paying down cards, disputing errors)\n• If credit is ready: contact a DPA-experienced lender for pre-approval\n\n**Month 2 — Pre-Approval:**\n• Complete HUD counseling if required for your chosen program ($50–$125 online, ~8 hours)\n• Get fully underwritten pre-approval with DPA factored in\n• Confirm your actual buying power with programs included\n\n**Months 3–4 — Home Search:**\n• Work with Kasandra to find homes matching your pre-approved budget\n• Make offers with confidence knowing your financing is structured\n• Most buyers in this range find a home within 30–60 days of active searching\n\n**Month 4–5 — Under Contract to Close:**\n• Inspection period (typically 10 days in Arizona)\n• DPA lender processes the assistance in parallel with the loan\n• Appraisal\n• Clear to close\n• Keys\n\n**Total realistic timeline from decision to close: 3–5 months**\nThis assumes no major credit repair needed. If credit repair is required, add 3–12 months to this timeline.",
      contentEs: "**Mes 1 — Fundamento:**\n• Revisa tu crédito en AnnualCreditReport.com (gratis)\n• Calcula tu relación deuda-ingreso\n• Determina qué programas DPA calificas probablemente según tus ingresos\n\n**Mes 2 — Pre-Aprobación:**\n• Completa el asesoramiento HUD si es requerido\n• Obtén pre-aprobación completamente suscrita con DPA incluido\n\n**Meses 3–4 — Búsqueda de Casa:**\n• Trabaja con Kasandra para encontrar casas que coincidan con tu presupuesto pre-aprobado\n• Haz ofertas con confianza sabiendo que tu financiamiento está estructurado\n\n**Mes 4–5 — Bajo Contrato hasta el Cierre:**\n• Período de inspección, tasación, cierre\n\n**Cronograma total realista desde la decisión hasta el cierre: 3–5 meses**",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "The combination of Tucson's affordable prices, Pima County's generous DPA programs, and the current market conditions creates a genuine window for first-time buyers to build equity rather than paying rent. The main barriers — down payment and closing costs — are addressable with the right programs.\n\nKasandra has walked hundreds of first-time buyers through this process in Tucson. She can connect you with DPA-experienced lenders, guide you through program selection, and represent you through the entire purchase. The first step is a conversation.",
      contentEs: "La combinación de los precios asequibles de Tucson, los generosos programas DPA del Condado de Pima y las condiciones actuales del mercado crea una ventana genuina para que los compradores primerizos construyan capital en lugar de pagar renta. Los principales obstáculos — el pago inicial y los costos de cierre — son abordables con los programas correctos.\n\nKasandra ha guiado a cientos de compradores primerizos a través de este proceso en Tucson. El primer paso es una conversación.",
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
          question: 'What is the best first-time home buyer program in Tucson for 2026?',
          questionEs: '¿Cuál es el mejor programa para compradores de primera vivienda en Tucson para 2026?',
          answer: "It depends on your income, credit score, and how much savings you have. For most buyers, the Pima Tucson Homebuyer's Solution (PTHS) is the most accessible because it has the highest income limit ($146,503) and no first-time buyer requirement. For buyers who qualify for the Lighthouse program, the below-market interest rate adds significant long-term savings on top of the down payment help. I recommend starting with a lender conversation to see which programs you qualify for — I can make that introduction.",
          answerEs: "Depende de tus ingresos, puntaje de crédito y cuánto tienes ahorrado. Para la mayoría de los compradores, la Solución Pima Tucson Homebuyer's (PTHS) es la más accesible porque tiene el límite de ingresos más alto ($146,503) y no requiere ser comprador primerizo. Para los compradores que califican para el programa Lighthouse, la tasa de interés por debajo del mercado agrega ahorros significativos a largo plazo.",
        },
        {
          question: 'Can I use down payment assistance with a VA loan?',
          questionEs: '¿Puedo usar asistencia para el pago inicial con un préstamo VA?',
          answer: "Yes — PTHS is compatible with VA loans, and VA buyers can stack VA's zero-down benefit with PTHS to eliminate closing costs as well. This combination is particularly powerful for DMAFB military buyers — zero down payment (VA) plus closing cost help (PTHS) can get you into a home with very minimal out-of-pocket expense. Confirm eligibility with a VA-approved lender who also knows PTHS.",
          answerEs: 'Sí — PTHS es compatible con préstamos VA, y los compradores VA pueden combinar el beneficio de cero inicial de VA con PTHS para eliminar también los costos de cierre. Esta combinación es particularmente poderosa para compradores militares de DMAFB.',
        },
      ],
    },
  ],
};

export default data;
