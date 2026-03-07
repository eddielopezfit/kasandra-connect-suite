import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Selling a Home During Divorce in Arizona: A Clear Path Forward',
  titleEs: 'Vender una Casa Durante el Divorcio en Arizona: Un Camino Claro',
  category: 'Divorce & Life Transition',
  categoryEs: 'Divorcio y Transición de Vida',
  author: 'Kasandra Prieto',
  intro: "If you're in this situation, you already know it's hard. The home is often tied to everything — finances, memories, the life you built together. This guide is here to give you clarity on how the process works in Arizona, without adding any more pressure to what you're already carrying. Take it one section at a time.",
  introEs: "Si estás en esta situación, ya sabes que es difícil. La casa a menudo está ligada a todo — finanzas, recuerdos, la vida que construyeron juntos. Esta guía está aquí para darte claridad sobre cómo funciona el proceso en Arizona, sin agregar más presión a lo que ya estás cargando. Tómalo una sección a la vez.",
  sections: [
    {
      heading: 'Arizona Is a Community Property State — What That Means',
      headingEs: 'Arizona Es un Estado de Propiedad Comunitaria — Qué Significa Eso',
      content: "Arizona is one of nine community property states. This means that property acquired during the marriage is generally owned equally by both spouses — 50/50 — regardless of whose name is on the deed or who made the mortgage payments.\n\nThis applies to the family home in most cases. Exceptions include:\n• Property owned before the marriage\n• Gifts or inheritances received by one spouse during the marriage\n• Property explicitly designated as separate property in a prenuptial agreement\n\nIf the home is community property, both spouses must agree to its sale — or a court must order it. Neither spouse can unilaterally list or sell the home without the other's written consent.\n\nThis guide does not provide legal advice. For questions about your specific situation, consult a licensed Arizona family law attorney.",
      contentEs: "Arizona es uno de los nueve estados de propiedad comunitaria. Esto significa que la propiedad adquirida durante el matrimonio generalmente es propiedad de ambos cónyuges en partes iguales — 50/50 — independientemente de cuyo nombre esté en la escritura o quién hizo los pagos de la hipoteca.\n\nEsto aplica a la casa familiar en la mayoría de los casos. Las excepciones incluyen:\n• Propiedad en propiedad antes del matrimonio\n• Regalos o herencias recibidas por un cónyuge durante el matrimonio\n• Propiedad explícitamente designada como propiedad separada en un acuerdo prenupcial\n\nSi la casa es propiedad comunitaria, ambos cónyuges deben acordar su venta — o un tribunal debe ordenarla. Ningún cónyuge puede listar o vender unilateralmente la casa sin el consentimiento escrito del otro.",
    },
    {
      heading: 'Arizona Divorce Property by the Numbers',
      headingEs: 'La Propiedad en Divorcio de Arizona en Números',
      content: '',
      contentEs: '',
      variant: 'stats-grid' as const,
      statsData: [
        { value: '60+ days', valueEs: '60+ días', label: 'Minimum time to finalize an Arizona divorce decree', labelEs: 'Tiempo mínimo para finalizar un decreto de divorcio en Arizona' },
        { value: '50/50', valueEs: '50/50', label: 'Default community property split in Arizona', labelEs: 'División predeterminada de propiedad comunitaria en Arizona' },
        { value: '$250K / $500K', valueEs: '$250K / $500K', label: 'Capital gains exclusion (single / married) if 2-year rule met', labelEs: 'Exclusión de ganancias de capital (soltero / casado) si se cumple regla de 2 años' },
        { value: '30–45 days', valueEs: '30–45 días', label: 'Typical escrow period once both parties agree to sell', labelEs: 'Período típico de depósito en garantía una vez que ambas partes acuerdan vender' },
      ],
    },
    {
      heading: 'Three Ways the Home Gets Resolved in a Divorce',
      headingEs: 'Tres Formas en Que la Casa Se Resuelve en un Divorcio',
      variant: 'path-selector',
      content: "Most divorcing couples in Arizona resolve the home one of three ways. Each path has different financial and timeline implications.",
      contentEs: "La mayoría de las parejas que se divorcian en Arizona resuelven la casa de una de tres maneras. Cada camino tiene diferentes implicaciones financieras y de tiempo.",
      pathData: [
        {
          id: 'sell-split',
          title: 'Sell & Split Proceeds',
          titleEs: 'Vender y Dividir Ganancias',
          desc: 'Both parties agree to list, sell, and divide net proceeds. Cleanest exit. Requires coordination and a neutral, professional agent both parties trust.',
          descEs: 'Ambas partes acuerdan listar, vender y dividir las ganancias netas. La salida más limpia. Requiere coordinación y un agente profesional neutral en quien ambas partes confíen.',
        },
        {
          id: 'buyout',
          title: 'One Spouse Buys Out the Other',
          titleEs: 'Un Cónyuge Compra la Parte del Otro',
          desc: 'One spouse refinances and takes full ownership. Requires qualifying for a new mortgage solo. The departing spouse must be removed from title and the loan.',
          descEs: 'Un cónyuge refinancia y toma la propiedad total. Requiere calificar para una nueva hipoteca solo. El cónyuge que se va debe ser eliminado del título y el préstamo.',
        },
        {
          id: 'court-ordered',
          title: 'Court-Ordered Sale',
          titleEs: 'Venta Ordenada por el Tribunal',
          desc: "If spouses can't agree, a judge can order the home sold. A neutral party (sometimes a court-appointed receiver) may manage the process. Timeline extends significantly.",
          descEs: 'Si los cónyuges no pueden ponerse de acuerdo, un juez puede ordenar la venta de la casa. Una parte neutral (a veces un receptor designado por el tribunal) puede manejar el proceso. El cronograma se extiende significativamente.',
        },
      ],
    },
    {
      heading: 'Working With One Agent During a Divorce — Why It Matters',
      headingEs: 'Trabajar Con Un Agente Durante un Divorcio — Por Qué Importa',
      content: "One of the most common mistakes divorcing couples make is hiring separate agents — one for each spouse. This creates competing interests in the transaction, slows the process, and often results in a worse outcome for both parties.\n\nA single, neutral agent who both parties agree to trust is usually the better path. That agent:\n• Has fiduciary duty to both sellers (not to one spouse over the other)\n• Coordinates showings, offers, and negotiations with one voice\n• Reduces friction at each step of the transaction\n• Communicates with both attorneys when needed\n\nKasandra has experience working with divorcing sellers in Tucson. She understands that every communication may be read by attorneys, that decisions take longer, and that emotional temperature has to be managed with patience — not pressure.",
      contentEs: "Uno de los errores más comunes que cometen las parejas que se divorcian es contratar agentes separados — uno para cada cónyuge. Esto crea intereses en competencia en la transacción, ralentiza el proceso y a menudo resulta en un peor resultado para ambas partes.\n\nUn solo agente neutral en quien ambas partes acuerden confiar es generalmente el mejor camino. Ese agente:\n• Tiene deber fiduciario hacia ambos vendedores (no hacia un cónyuge sobre el otro)\n• Coordina visitas, ofertas y negociaciones con una sola voz\n• Reduce la fricción en cada paso de la transacción\n• Se comunica con ambos abogados cuando es necesario",
    },
    {
      heading: 'Timing the Sale Around the Divorce Decree',
      headingEs: 'Sincronizar la Venta con el Decreto de Divorcio',
      content: "The relationship between the home sale and the divorce decree depends on your specific decree language and what your attorneys structure.\n\nCommon scenarios:\n\n**Sale before final decree:** Some couples choose to sell and divide proceeds before the divorce is final. This can simplify asset division but requires cooperation during a difficult period.\n\n**Sale mandated by decree:** The divorce decree specifies that the home must be sold by a certain date, with proceeds divided according to a formula. This is court-enforceable.\n\n**Deferred sale:** One spouse stays in the home (sometimes with children) for a defined period — often until children reach a certain age or the market improves — then the home is sold.\n\nTucson market context: With median days on market at 38 days and homes selling at 97.64% of list price (January 2026), a well-prepared home sells relatively quickly. Planning 60–90 days from listing to close is reasonable.\n\nNothing in this guide constitutes legal advice. Your attorney should review all real estate-related decree language before signing.",
      contentEs: "La relación entre la venta de la casa y el decreto de divorcio depende del lenguaje específico de tu decreto y de lo que estructuren tus abogados.\n\nEscenarios comunes:\n\n**Venta antes del decreto final:** Algunas parejas eligen vender y dividir las ganancias antes de que el divorcio sea final. Esto puede simplificar la división de activos pero requiere cooperación durante un período difícil.\n\n**Venta ordenada por el decreto:** El decreto de divorcio especifica que la casa debe venderse para una fecha determinada, con las ganancias divididas según una fórmula. Esto es ejecutable por el tribunal.\n\n**Venta diferida:** Un cónyuge permanece en la casa (a veces con hijos) por un período definido — a menudo hasta que los hijos alcancen cierta edad o el mercado mejore — luego la casa se vende.",
    },
    {
      heading: 'Tax Implications You Should Discuss With Your CPA',
      headingEs: 'Implicaciones Fiscales Que Debes Discutir Con Tu CPA',
      content: "Real estate and divorce intersect in ways that create tax decisions. This is not tax advice — consult a licensed CPA or tax attorney for your situation.\n\n**Capital gains exclusion:** Married couples filing jointly can exclude up to $500,000 in capital gains on the sale of a primary residence (subject to IRS requirements including 2-of-5-year ownership and use tests). After divorce, each spouse may only qualify for the $250,000 individual exclusion.\n\n**Timing matters:** If the home has significant appreciation, the timing of the sale relative to the divorce finalization can affect which exclusion applies.\n\n**Transfer between spouses:** Transfers of property between spouses incident to divorce are generally not taxable events under IRS rules — but the receiving spouse takes on the original cost basis.\n\nDocument everything. Keep records of your original purchase price, improvement costs, and sale proceeds.",
      contentEs: "Los bienes raíces y el divorcio se intersectan de maneras que crean decisiones fiscales. Esto no es asesoramiento fiscal — consulta un CPA o abogado fiscal con licencia para tu situación.\n\n**Exclusión de ganancias de capital:** Las parejas casadas que declaran conjuntamente pueden excluir hasta $500,000 en ganancias de capital en la venta de una residencia principal (sujeto a los requisitos del IRS incluyendo pruebas de propiedad y uso de 2 de 5 años). Después del divorcio, cada cónyuge puede calificar solo para la exclusión individual de $250,000.\n\n**El tiempo importa:** Si la casa tiene apreciación significativa, el momento de la venta relativo a la finalización del divorcio puede afectar qué exclusión aplica.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "If you're in this situation, the most helpful first step is a no-pressure conversation about where you are in the process and what the home is realistically worth in today's market.\n\nKasandra works with divorcing sellers with patience and discretion. Both parties are treated with equal respect throughout. When you're ready to talk — or if you just have questions — Selena can help you get oriented.",
      contentEs: "Si estás en esta situación, el primer paso más útil es una conversación sin presión sobre dónde estás en el proceso y cuánto vale realmente la casa en el mercado actual.\n\nKasandra trabaja con vendedores en proceso de divorcio con paciencia y discreción. Ambas partes son tratadas con igual respeto durante todo el proceso.",
    },
  {
      heading: "",
      headingEs: "",
      content: "",
      contentEs: "",
      variant: 'tool-bridge' as const,
    },
  {
      heading: "Frequently Asked Questions",
      headingEs: "Preguntas Frecuentes",
      content: "",
      contentEs: "",
      variant: 'faq' as const,
      faqItems: [
        {
          question: "Do both spouses have to agree to sell the home during a divorce in Arizona?",
          questionEs: "¿Ambos cónyuges tienen que estar de acuerdo para vender la casa durante un divorcio en Arizona?",
          answer: "In most cases, yes — both spouses need to sign the listing agreement and closing documents for a jointly-owned property. Arizona is a community property state, which means the home acquired during marriage is typically owned equally. If one spouse refuses to cooperate, the other can petition the court to force a sale, but that process is costly and adversarial. I've worked with couples in various stages of separation and often the most practical path is finding enough common ground on the sale to avoid prolonged legal proceedings.",
          answerEs: "En la mayoría de los casos, sí — ambos cónyuges necesitan firmar el contrato de listado y los documentos de cierre para una propiedad de propiedad conjunta. Arizona es un estado de propiedad comunitaria, lo que significa que la casa adquirida durante el matrimonio es típicamente propiedad por igual.",
        },
        {
          question: "Should we sell the house before or after the divorce is finalized in Arizona?",
          questionEs: "¿Debemos vender la casa antes o después de que se finalice el divorcio en Arizona?",
          answer: "There's no universal right answer, and this is worth discussing with your family law attorney. Selling before the decree is finalized simplifies the asset division — proceeds get split and both parties move forward cleanly. Selling after can be complicated by the need for ongoing cooperation between two people who are no longer together. The longer a home sits jointly owned post-separation, the more complicated practical decisions (repairs, showings, pricing) tend to become. I can work with both parties, or with each party's counsel, to keep the transaction moving professionally.",
          answerEs: "No hay una respuesta correcta universal, y esto vale la pena discutirlo con su abogado de derecho familiar. Vender antes de que se finalice el decreto simplifica la división de activos — los ingresos se dividen y ambas partes avanzan limpiamente.",
        },
        {
          question: "How is the equity split when selling a home during a divorce in Arizona?",
          questionEs: "¿Cómo se divide el capital al vender una casa durante un divorcio en Arizona?",
          answer: "Arizona community property law generally means an equal 50/50 split of equity for property acquired during the marriage, though the divorce decree can specify other arrangements. Equity is calculated as the sale price minus closing costs, any mortgage payoff, and agreed-upon expenses. If one spouse contributed separate property (pre-marital funds, inheritance) toward the home, that may be traceable and treated differently. Your attorney will help document the correct split — I make sure the escrow and closing process reflects exactly what the decree specifies.",
          answerEs: "La ley de propiedad comunitaria de Arizona generalmente significa una división equitativa del 50/50 del capital para propiedades adquiridas durante el matrimonio, aunque el decreto de divorcio puede especificar otros arreglos. El capital se calcula como el precio de venta menos costos de cierre, cualquier pago de hipoteca y gastos acordados.",
        },
        {
          question: "What if one spouse wants to keep the house after the divorce?",
          questionEs: "¿Qué pasa si un cónyuge quiere quedarse con la casa después del divorcio?",
          answer: "It's a common path and it can work — but it requires the keeping spouse to qualify for refinancing on their own income, buy out the other spouse's equity share, and have the other spouse's name removed from the mortgage. In Tucson's current market with mid-6% rates, this is a higher bar than it was a few years ago. I can connect you with lenders who handle post-divorce refinances regularly so you can find out if the numbers work before committing to this path in the divorce agreement.",
          answerEs: "Es un camino común y puede funcionar — pero requiere que el cónyuge que se queda califique para refinanciar con sus ingresos propios, compre la parte del capital del otro cónyuge y elimine el nombre del otro cónyuge de la hipoteca.",
        },
        {
          question: "Can we sell the house during a divorce if we can barely communicate with each other?",
          questionEs: "¿Podemos vender la casa durante un divorcio si apenas podemos comunicarnos el uno con el otro?",
          answer: "Yes — and this is actually something I help facilitate regularly. When communication between spouses is difficult, I can coordinate with each party separately, keep both informed in parallel, and serve as the neutral point of contact for all showing feedback, offers, and transaction milestones. Many decisions (pricing adjustments, counter offers) can be handled through each party's attorney if direct contact isn't workable. The goal is to get the transaction done in a way that's professional and fair to both sides — whatever the personal dynamic is.",
          answerEs: "Sí — y esto es algo que ayudo a facilitar regularmente. Cuando la comunicación entre cónyuges es difícil, puedo coordinar con cada parte por separado, mantener a ambos informados en paralelo y servir como el punto de contacto neutral para todos los comentarios de visitas, ofertas e hitos de transacciones.",
        },
      ],
    },
  ],
};

export default data;
