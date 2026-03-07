import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "First-Time Home Buyer's Complete Guide",
  titleEs: "Guía Completa para Compradores de Primera Vivienda",
  category: "Buying a Home",
  categoryEs: "Comprar una Casa",
  author: "Kasandra Prieto",
  intro: "Most first-time buyers feel the same thing when they start: excited and overwhelmed at the same time. That's normal — there's a lot to figure out, and it's okay not to know where to begin. I've walked hundreds of people through this process, and the ones who feel most confident at the closing table aren't the ones who knew the most going in — they're the ones who asked questions and took it one step at a time. That's exactly what this guide is for.",
  introEs: "La mayoría de los compradores primerizos sienten lo mismo cuando empiezan: emocionados y abrumados al mismo tiempo. Eso es normal — hay mucho que entender, y está bien no saber por dónde empezar. He acompañado a cientos de personas en este proceso, y las que se sienten más seguras en la mesa de cierre no son las que sabían más al comenzar — son las que hicieron preguntas y lo tomaron un paso a la vez. Para eso es exactamente esta guía.",
  sections: [
    {
      heading: "Start Here: Your Financial Picture",
      headingEs: "Empieza Aquí: Tu Panorama Financiero",
      content: "Before browsing listings, it helps to understand your financial starting point.\n\nBegin by reviewing your credit profile. Many conventional loans look for scores around 620 or higher, while FHA loans may allow lower scores. Next, calculate your debt-to-income ratio (DTI)—your total monthly debt payments divided by your gross monthly income. In many cases, lenders look for a DTI below 43%.\n\nUnder current Tucson market conditions (as of early 2026), here's the financial landscape for buyers:\n• Median sale price: $315,000–$360,000\n• Average monthly mortgage payment: approximately $2,247\n• Average monthly rent: $1,463\n• 30-year fixed mortgage rate: approximately 6.06%\n\nThat $784/month premium for buying versus renting is real—but Tucson's housing-to-income ratio (23.02%) remains favorable compared to other Western U.S. metros. The long-term equity benefit of ownership often offsets the monthly difference.\n\nYou'll also want to plan for:\n• A down payment (often between 3–20%, depending on the loan type)\n• Closing costs (typically 2–5% of the loan amount)\n• Moving expenses and initial home maintenance\n\nThis step isn't about perfection—it's about awareness.",
      contentEs: "Antes de explorar listados, es útil entender su punto de partida financiero.\n\nComience revisando su perfil crediticio. Muchos préstamos convencionales buscan puntajes de 620 o más, mientras que los préstamos FHA pueden permitir puntajes más bajos. Luego, calcule su relación deuda-ingreso (DTI)—sus pagos mensuales totales de deuda divididos por su ingreso mensual bruto. En muchos casos, los prestamistas buscan un DTI por debajo del 43%.\n\nBajo las condiciones actuales del mercado de Tucson (a principios de 2026), este es el panorama financiero para compradores:\n• Precio medio de venta: $315,000–$360,000\n• Pago mensual promedio de hipoteca: aproximadamente $2,247\n• Renta mensual promedio: $1,463\n• Tasa hipotecaria fija a 30 años: aproximadamente 6.06%\n\nEsa prima de $784/mes por comprar versus rentar es real—pero la relación vivienda-ingreso de Tucson (23.02%) sigue siendo favorable comparada con otras áreas metropolitanas del oeste de EE.UU. El beneficio de equidad a largo plazo de la propiedad a menudo compensa la diferencia mensual.\n\nTambién querrá planificar para:\n• Un pago inicial (generalmente entre 3–20%, dependiendo del tipo de préstamo)\n• Costos de cierre (típicamente 2–5% del monto del préstamo)\n• Gastos de mudanza y mantenimiento inicial del hogar\n\nEste paso no se trata de perfección—se trata de consciencia.",
    },
    {
      heading: "Tucson Buyer Market Snapshot",
      headingEs: "Panorama del Mercado para Compradores en Tucson",
      content: "",
      contentEs: "",
      variant: 'stats-grid' as const,
      statsData: [
        { value: '$315K–$360K', valueEs: '$315K–$360K', label: 'Median sale price in Pima County (early 2026)', labelEs: 'Precio mediano de venta en Pima County (principios de 2026)' },
        { value: '30–45 days', valueEs: '30–45 días', label: 'Typical time from offer accepted to close', labelEs: 'Tiempo típico desde oferta aceptada hasta cierre' },
        { value: '3.5%', valueEs: '3.5%', label: 'Minimum down payment — FHA loan', labelEs: 'Pago inicial mínimo — préstamo FHA' },
        { value: '2–5%', valueEs: '2–5%', label: 'Typical closing costs as % of purchase price', labelEs: 'Costos de cierre típicos como % del precio de compra' },
      ],
    },
    {
      heading: "Down Payment Assistance Programs in Tucson",
      headingEs: "Programas de Asistencia para Pago Inicial en Tucson",
      content: "One of the most common barriers for first-time buyers is the down payment. What many people don't realize is that Pima County and the City of Tucson offer several programs designed specifically to help.\n\nUnder current program guidelines (as of early 2026):\n\n• Pima County/Tucson HOME Program: Provides up to 20% of the purchase price toward down payment and closing costs. Eligibility: household income up to $76,900 (family of 4). Maximum purchase price: $385,225.\n\n• Tucson Welcome Home Program: Offers 100% financing—meaning zero down payment required. Income limit: up to $126,280.\n\n• PTHS (Pima Tucson Homebuyer Solution): Provides down payment assistance that is forgiven after three years of occupancy—meaning you don't pay it back if you stay in the home.\n\nMost programs require a minimum credit score of 620–640. Your lender or a HUD-approved housing counselor can confirm which programs you qualify for.\n\nThese programs exist because homeownership builds long-term stability—and Tucson's community has invested in making that accessible.",
      contentEs: "Una de las barreras más comunes para compradores primerizos es el pago inicial. Lo que muchas personas no saben es que el Condado de Pima y la Ciudad de Tucson ofrecen varios programas diseñados específicamente para ayudar.\n\nBajo las directrices actuales del programa (a principios de 2026):\n\n• Programa HOME del Condado de Pima/Tucson: Proporciona hasta el 20% del precio de compra para pago inicial y costos de cierre. Elegibilidad: ingreso familiar hasta $76,900 (familia de 4). Precio máximo de compra: $385,225.\n\n• Programa Tucson Welcome Home: Ofrece financiamiento del 100%—lo que significa cero pago inicial requerido. Límite de ingreso: hasta $126,280.\n\n• PTHS (Solución de Comprador de Vivienda Pima Tucson): Proporciona asistencia para pago inicial que se condona después de tres años de ocupación—lo que significa que no lo devuelve si permanece en la casa.\n\nLa mayoría de los programas requieren un puntaje de crédito mínimo de 620–640. Su prestamista o un consejero de vivienda aprobado por HUD puede confirmar para cuáles programas califica.\n\nEstos programas existen porque la propiedad de vivienda construye estabilidad a largo plazo—y la comunidad de Tucson ha invertido en hacerla accesible.",
    },
    {
      heading: "Getting Pre-Approved (And Why It Changes Everything)",
      headingEs: "La Pre-Aprobación (Y Por Qué Cambia Todo)",
      content: "A mortgage pre-approval helps you understand what price range may make sense and shows sellers you're financially prepared.\n\nDuring pre-approval, a lender reviews your income, assets, debts, and credit history to determine a loan amount. It's a good idea to compare options with two or three lenders to understand rates, terms, and monthly payment expectations.\n\nPre-approvals are usually valid for 60–90 days. Keep in mind: qualifying for a certain amount doesn't mean you should use the full amount. Comfort and long-term stability matter.",
      contentEs: "Una pre-aprobación hipotecaria le ayuda a entender qué rango de precio podría tener sentido y muestra a los vendedores que está financieramente preparado.\n\nDurante la pre-aprobación, un prestamista revisa sus ingresos, activos, deudas e historial crediticio para determinar un monto de préstamo. Es buena idea comparar opciones con dos o tres prestamistas para entender tasas, términos y expectativas de pagos mensuales.\n\nLas pre-aprobaciones generalmente son válidas por 60–90 días. Tenga en cuenta: calificar para cierta cantidad no significa que deba usar el monto completo. La comodidad y la estabilidad a largo plazo importan.",
    },
    {
      heading: "Choosing Who You Work With",
      headingEs: "Elegir Con Quién Trabajas",
      content: "For first-time buyers, having a knowledgeable local professional can make a significant difference.\n\nLook for someone who:\n• Understands your preferred areas and price range\n• Explains each step clearly, without pressure\n• Coordinates with trusted professionals such as lenders, inspectors, and title companies\n• Represents your interests throughout the process\n\nThis is a working relationship built on communication and trust—take the time to choose thoughtfully.",
      contentEs: "Para compradores primerizos, tener un profesional local conocedor puede hacer una diferencia significativa.\n\nBusque a alguien que:\n• Entienda sus áreas preferidas y rango de precio\n• Explique cada paso claramente, sin presión\n• Coordine con profesionales de confianza como prestamistas, inspectores y compañías de títulos\n• Represente sus intereses durante todo el proceso\n\nEsta es una relación de trabajo basada en comunicación y confianza—tómese el tiempo para elegir cuidadosamente.",
    },
    {
      heading: "Looking at Homes Without Getting Lost",
      headingEs: "Buscar Casas Sin Perderte",
      content: "Before touring homes, create a simple list of:\n• Must-haves (non-negotiables)\n• Nice-to-haves (flexible features)\n\nAs you explore, consider practical factors such as commute times, neighborhood layout, and access to everyday amenities. Visiting homes at different times of day can offer helpful perspective.\n\nTake notes and photos—after several showings, details can blend together. Your goal is not to rush, but to recognize when a home aligns with your priorities.",
      contentEs: "Antes de recorrer casas, cree una lista simple de:\n• Imprescindibles (no negociables)\n• Deseables (características flexibles)\n\nMientras explora, considere factores prácticos como tiempos de viaje, distribución del vecindario y acceso a amenidades cotidianas. Visitar casas en diferentes momentos del día puede ofrecer perspectiva útil.\n\nTome notas y fotos—después de varias visitas, los detalles pueden mezclarse. Su objetivo no es apresurarse, sino reconocer cuando una casa se alinea con sus prioridades.",
    },
    {
      heading: "When You Find It: Making an Offer",
      headingEs: "Cuando la Encuentras: Haciendo una Oferta",
      content: "When you're ready to make an offer, several elements come into play:\n• Purchase price\n• Earnest money deposit\n• Contingencies (financing, inspection, appraisal)\n• Proposed closing timeline\n\nIn competitive markets, timing and structure matter. Your agent will help you understand options and submit an offer aligned with current conditions. Until everything is finalized, it's best to stay grounded—real estate transactions involve multiple checkpoints.",
      contentEs: "Cuando esté listo para hacer una oferta, varios elementos entran en juego:\n• Precio de compra\n• Depósito de arras\n• Contingencias (financiamiento, inspección, avalúo)\n• Cronograma de cierre propuesto\n\nEn mercados competitivos, el tiempo y la estructura importan. Su agente le ayudará a entender las opciones y presentar una oferta alineada con las condiciones actuales. Hasta que todo esté finalizado, es mejor mantener los pies en la tierra—las transacciones inmobiliarias tienen múltiples puntos de control.",
    },
    {
      heading: "Inspections: Your Protection Period",
      headingEs: "Inspecciones: Tu Período de Protección",
      content: "After an offer is accepted, scheduling a professional home inspection is an important next step.\n\nThe inspection typically reviews major systems such as:\n• Roof\n• HVAC\n• Plumbing\n• Electrical\n• Foundation\n\nBased on the findings, buyers may request repairs, credits, or other adjustments. In some cases, additional inspections (pest, sewer, radon) may be recommended. This step is about gaining clarity before moving forward.",
      contentEs: "Después de que una oferta sea aceptada, programar una inspección profesional de la casa es un siguiente paso importante.\n\nLa inspección típicamente revisa sistemas principales como:\n• Techo\n• HVAC\n• Plomería\n• Electricidad\n• Cimientos\n\nBasándose en los hallazgos, los compradores pueden solicitar reparaciones, créditos u otros ajustes. En algunos casos, se pueden recomendar inspecciones adicionales (plagas, alcantarillado, radón). Este paso se trata de ganar claridad antes de avanzar.",
    },
    {
      heading: "Closing Day — and What Comes After",
      headingEs: "El Día del Cierre — y Lo Que Viene Después",
      content: "Closing day involves signing documents, confirming funds, and completing the purchase.\n\nYour lender and title company will guide you through each form. Take time to review everything carefully. Once the transaction records, you'll receive the keys to your new home.\n\nAfter closing, focus on the practical next steps—setting up utilities, changing locks, and settling into your space.\n\nWelcome home.",
      contentEs: "El día de cierre involucra firmar documentos, confirmar fondos y completar la compra.\n\nSu prestamista y compañía de títulos le guiarán a través de cada formulario. Tómese el tiempo para revisar todo cuidadosamente. Una vez que la transacción se registre, recibirá las llaves de su nueva casa.\n\nDespués del cierre, enfóquese en los siguientes pasos prácticos—configurar servicios, cambiar cerraduras y acomodarse en su espacio.\n\nBienvenido(a) a casa.",
    },
    {
      heading: "What's Next?",
      headingEs: "¿Qué Sigue?",
      content: "If you're ready to explore options that fit your situation—or if you'd simply like clarity on where to begin—you're welcome to take the next step at your own pace.\n\nThere's no pressure. Just support when you're ready.",
      contentEs: "Si está listo para explorar opciones que se ajusten a su situación—o si simplemente le gustaría claridad sobre por dónde empezar—es bienvenido(a) a dar el siguiente paso a su propio ritmo.\n\nNo hay presión. Solo apoyo cuando esté listo.",
    },
    {
      heading: "",
      headingEs: "",
      content: "",
      contentEs: "",
      variant: 'tool-bridge' as const,
    },
    {
      heading: "First-Time Buyer Questions We Hear Most",
      headingEs: "Preguntas Más Frecuentes de Compradores Primerizos",
      content: "",
      contentEs: "",
      variant: 'faq' as const,
      faqItems: [
        {
          question: "How much do I need for a down payment in Tucson?",
          questionEs: "¿Cuánto necesito para el pago inicial en Tucson?",
          answer: "You don't need 20% down — and that surprises a lot of people who've been sitting on the sidelines thinking they do. FHA loans start at 3.5% down with a 580+ credit score. Conventional loans can go as low as 3% for first-time buyers. On a $300,000 home, that's $9,000–$10,500. Arizona's HOME Plus program also offers 3–5% in down payment assistance that doesn't have to be repaid. I work with local lenders in Tucson who specialize in first-time buyer programs — getting connected to the right one early changes everything.",
          answerEs: "No necesita el 20% de inicial — y eso sorprende a mucha gente que ha estado esperando creyendo que sí. Los préstamos FHA comienzan al 3.5% de inicial con una puntuación de crédito de 580+. Los préstamos convencionales pueden ir tan bajo como el 3% para compradores primerizos. En una casa de $300,000, eso es $9,000–$10,500. El programa HOME Plus de Arizona también ofrece 3–5% en asistencia para pago inicial que no tiene que ser reembolsada.",
        },
        {
          question: "What credit score do I need to buy a home in Arizona?",
          questionEs: "¿Qué puntuación de crédito necesito para comprar una casa en Arizona?",
          answer: "For an FHA loan, the minimum is 580. For conventional financing, most lenders want 620 or higher — 680+ gets you meaningfully better rates. VA loans have no official minimum but most lenders look for 620+. If your score is below 580, that's not a door closing — it's just a different starting point. There are Tucson lenders I can connect you with who specialize in credit improvement paths. Six to twelve months of focused work can change what's available to you significantly.",
          answerEs: "Para un préstamo FHA, el mínimo es 580. Para financiamiento convencional, la mayoría de los prestamistas quieren 620 o más — 680+ le da tasas significativamente mejores. Los préstamos VA no tienen un mínimo oficial pero la mayoría de los prestamistas buscan 620+. Si su puntuación está por debajo de 580, eso no es una puerta que se cierra — es solo un punto de partida diferente. Hay prestamistas en Tucson que puedo conectarle con quienes se especializan en planes de mejora de crédito.",
        },
        {
          question: "How long does it take to buy a house in Tucson?",
          questionEs: "¿Cuánto tiempo tarda comprar una casa en Tucson?",
          answer: "From first conversation to keys, most Tucson buyers are looking at 60–90 days total. Pre-approval usually takes 3–7 business days — that's always the first step. House hunting is the most variable part: some of my clients found their home in two weeks, others searched for two months. Once you're under contract, financing purchases typically close in 30–45 days. Tucson's median days on market right now is 38 days (January 2026). The process feels long until it doesn't — and then it moves fast.",
          answerEs: "Desde la primera conversación hasta las llaves, la mayoría de los compradores de Tucson miran 60–90 días en total. La preaprobación generalmente toma 3–7 días hábiles — ese es siempre el primer paso. La búsqueda de casa es la parte más variable. Una vez bajo contrato, las compras financiadas típicamente cierran en 30–45 días. El proceso se siente largo hasta que no lo es — y luego avanza rápido.",
        },
        {
          question: "What are closing costs for a buyer in Arizona?",
          questionEs: "¿Cuáles son los costos de cierre para un comprador en Arizona?",
          answer: "Budget 2–3% of the purchase price. On a $300,000 home that's $6,000–$9,000 — and that covers loan origination, title insurance, escrow, appraisal, inspection, and prepaid items like homeowner's insurance and property tax reserves. Here's something a lot of first-time buyers don't know: you can often negotiate for the seller to cover a portion of those costs. It's called a seller concession, and in Tucson right now, with homes sitting a bit longer on market, it's a legitimate ask. Your lender will spell out your exact costs in a Loan Estimate — review that carefully and ask questions.",
          answerEs: "Presupueste del 2–3% del precio de compra. En una casa de $300,000 eso es $6,000–$9,000 — y eso cubre originación del préstamo, seguro de título, fideicomiso, tasación, inspección y artículos prepagados. Algo que muchos compradores primerizos no saben: a menudo puede negociar que el vendedor cubra una parte de esos costos. Se llama concesión del vendedor, y en Tucson ahora mismo, con casas tardando un poco más en venderse, es una solicitud legítima.",
        },
        {
          question: "Should I buy a home in Tucson now or wait?",
          questionEs: "¿Debo comprar una casa en Tucson ahora o esperar?",
          answer: "I get this question constantly, and I want to give you an honest answer rather than a sales pitch. Tucson's median price is around $365,000 right now (January 2026) with rates in the mid-6% range. There's no clear signal that prices will drop significantly in Pima County — 4.92 months of supply puts us in a roughly balanced market. Here's what I actually tell people: the question isn't really about timing. It's about readiness. If you can qualify, you plan to stay 3+ years, and the payment fits your life — buying now builds equity. If rates drop later, you refinance. What you can't get back is the time you spent waiting.",
          answerEs: "Recibo esta pregunta constantemente, y quiero darle una respuesta honesta en lugar de un argumento de ventas. El precio medio de Tucson es alrededor de $365,000 ahora mismo (enero 2026) con tasas en el rango del 6% medio. No hay señal clara de que los precios caigan significativamente en el Condado de Pima. Lo que realmente le digo a la gente: la pregunta no es realmente sobre el momento. Es sobre la preparación. Si puede calificar, planea quedarse 3+ años, y el pago encaja en su vida — comprar ahora acumula patrimonio. Si las tasas bajan después, refinancia.",
        },
      ],
    },
  ],
};

export default data;
