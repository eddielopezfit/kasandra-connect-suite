import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "Selling Your Home in Arizona: A Clear Path Forward",
  titleEs: "Vender Su Casa en Arizona: Un Camino Claro",
  category: "Selling Your Home",
  categoryEs: "Vender Su Casa",
  author: "Kasandra Prieto",
  intro: "If you're thinking about selling, you probably have more questions than answers right now — about timing, pricing, what it all costs, and whether it's even the right move. That's completely normal. I've been through this with hundreds of people in Tucson, and the ones who feel most confident at the end are the ones who understood the process before they were in the middle of it. That's what this guide is for.",
  introEs: "Si está pensando en vender, probablemente tiene más preguntas que respuestas ahora mismo — sobre el momento, el precio, qué cuesta todo y si siquiera es la decisión correcta. Eso es completamente normal. He acompañado a cientos de personas en Tucson en este proceso, y las que se sienten más seguras al final son las que entendieron el proceso antes de estar en medio de él. Para eso es esta guía.",
  sections: [
    {
      heading: "You Don't Have to Have This Figured Out Yet",
      headingEs: "Todavía No Tienes Que Tener Todo Resuelto",
      content: "Many homeowners feel overwhelmed when considering a sale. Questions about timing, pricing, and whether it's the right move are common.\n\nThis guide won't tell you what to do. It will give you a clear picture of how the selling process works in Arizona, so you can make an informed choice—whatever direction feels right for you.",
      contentEs: "Muchos propietarios se sienten abrumados al considerar una venta. Las preguntas sobre el momento, el precio y si es la decisión correcta son comunes.\n\nEsta guía no le dirá qué hacer. Le dará una imagen clara de cómo funciona el proceso de venta en Arizona, para que pueda tomar una decisión informada—cualquiera que sea la dirección que sienta correcta para usted.",
    },
    {
      heading: "What Does the Tucson Market Look Like?",
      headingEs: "¿Cómo Luce el Mercado de Tucson?",
      variant: 'stats-grid' as const,
      content: "Under current market conditions (as of early 2026), here's what sellers in Pima County can expect. These numbers provide grounding, not a guarantee — every home and neighborhood is different, and a CMA specific to your property gives the clearest picture.",
      contentEs: "Bajo las condiciones actuales del mercado (a principios de 2026), esto es lo que los vendedores en el Condado de Pima pueden esperar. Estos números proporcionan base, no una garantía — un CMA específico para su propiedad da la imagen más clara.",
      statsData: [
        { value: '$365K', valueEs: '$365K', label: 'Median sale price in Pima County (early 2026)', labelEs: 'Precio mediano de venta en el Condado de Pima (principios de 2026)' },
        { value: '38 days', valueEs: '38 días', label: 'Average days on market for Tucson homes', labelEs: 'Días promedio en el mercado para casas en Tucson' },
        { value: '97.65%', valueEs: '97.65%', label: 'Sale-to-list ratio — homes selling close to asking price', labelEs: 'Relación venta-lista — casas vendidas cerca del precio pedido' },
        { value: '~4,600', valueEs: '~4,600', label: 'Active listings in the Pima County MLS', labelEs: 'Listados activos en el MLS del Condado de Pima' },
      ],
    },
    {
      heading: "How Selling Works: Step by Step",
      headingEs: "Cómo Funciona la Venta: Paso a Paso",
      content: "Here's what a typical home sale looks like in Arizona:\n\n1. Understanding Your Home's Value\nA Comparative Market Analysis (CMA) reviews recent sales of similar homes nearby. This gives you a data-informed starting point for pricing.\n\n2. Preparing Your Home\nSimple steps like decluttering, minor repairs, and cleaning can help buyers see your home's potential.\n\n3. Setting a List Price\nYou choose the price based on market data and your goals. I provide information; the decision is yours.\n\n4. Listing and Showings\nYour home goes on the market. Buyers schedule visits. Feedback helps you understand buyer interest.\n\n5. Receiving and Reviewing Offers\nWhen offers arrive, you'll see not just the price, but terms, contingencies, and timelines.\n\n6. Contract to Close\nOnce you accept, the buyer typically has inspections and appraisal. Closing usually happens in 30–45 days in Arizona.\n\nNote: Arizona legally supports remote closings, which means sellers who are relocating can complete the transaction without being physically present at the closing table.",
      contentEs: "Así es como típicamente se ve una venta de casa en Arizona:\n\n1. Entender el Valor de Su Casa\nUn Análisis Comparativo de Mercado (CMA) revisa ventas recientes de casas similares cercanas. Esto le da un punto de partida basado en datos para el precio.\n\n2. Preparar Su Casa\nPasos simples como despejar, reparaciones menores y limpieza pueden ayudar a los compradores a ver el potencial de su casa.\n\n3. Establecer un Precio de Lista\nUsted elige el precio basándose en datos del mercado y sus objetivos. Yo proporciono información; la decisión es suya.\n\n4. Listado y Visitas\nSu casa sale al mercado. Los compradores programan visitas. La retroalimentación le ayuda a entender el interés del comprador.\n\n5. Recibir y Revisar Ofertas\nCuando lleguen ofertas, verá no solo el precio, sino términos, contingencias y cronogramas.\n\n6. Contrato hasta el Cierre\nUna vez que acepte, el comprador típicamente tiene inspecciones y avalúo. El cierre usualmente ocurre en 30–45 días en Arizona.\n\nNota: Arizona legalmente apoya los cierres remotos, lo que significa que los vendedores que se están reubicando pueden completar la transacción sin estar físicamente presentes en la mesa de cierre.",
    },
    {
      heading: "When Selling May Make Sense",
      headingEs: "Cuándo Vender Puede Tener Sentido",
      content: "Selling might be worth considering if:\n\n• You're relocating for work or family\n• Your current home no longer fits your needs\n• You've built equity and want to make a change\n• You're ready to downsize or upsize\n• Life circumstances have shifted your priorities",
      contentEs: "Vender podría valer la pena considerar si:\n\n• Se está reubicando por trabajo o familia\n• Su casa actual ya no se ajusta a sus necesidades\n• Ha acumulado equidad y quiere hacer un cambio\n• Está listo para reducir o ampliar espacio\n• Las circunstancias de vida han cambiado sus prioridades",
    },
    {
      heading: "When Waiting Might Be Better",
      headingEs: "Cuándo Esperar Podría Ser Mejor",
      content: "Selling isn't always the right answer—and that's okay.\n\nConsider waiting if:\n• You're uncertain about where you'd move next\n• Your financial situation is in flux\n• Market conditions in your area don't favor sellers\n• You haven't owned the property long enough to offset selling costs\n\nA good decision comes from understanding your options, not from pressure.",
      contentEs: "Vender no siempre es la respuesta correcta—y eso está bien.\n\nConsidere esperar si:\n• No está seguro de a dónde se mudaría\n• Su situación financiera está en cambio\n• Las condiciones del mercado en su área no favorecen a los vendedores\n• No ha sido propietario el tiempo suficiente para compensar los costos de venta\n\nUna buena decisión viene de entender sus opciones, no de la presión.",
    },
    {
      heading: '',
      headingEs: '',
      content: '',
      contentEs: '',
      variant: 'tool-bridge' as const,
    },
    {
      heading: "Tax and Legal Considerations for Arizona Sellers",
      headingEs: "Consideraciones Fiscales y Legales para Vendedores en Arizona",
      content: "Several Arizona-specific factors may affect your sale. Under current law (as of early 2026):\n\n• Primary Residence Capital Gains Exclusion: If you've lived in your home for at least 2 of the last 5 years, you can exclude up to $250,000 (single) or $500,000 (married filing jointly) in capital gains from federal taxes.\n\n• Community Property State: Arizona is a community property state. Assets acquired during marriage are generally jointly owned. If you are selling during or after a divorce, the division of equity may require legal coordination.\n\n• ALTCS/Medicaid Considerations: For senior homeowners considering long-term care, a home sale can impact eligibility for Arizona Long Term Care System (ALTCS) benefits. Asset limits apply, and consulting with an elder law attorney before selling is advisable.\n\nThese are general principles and do not constitute legal or tax advice.",
      contentEs: "Varios factores específicos de Arizona pueden afectar su venta. Según la ley actual (a principios de 2026):\n\n• Exclusión de Ganancias de Capital por Residencia Principal: Si ha vivido en su casa por al menos 2 de los últimos 5 años, puede excluir hasta $250,000 (soltero) o $500,000 (casados declarando conjuntamente) en ganancias de capital de impuestos federales.\n\n• Estado de Propiedad Comunitaria: Arizona es un estado de propiedad comunitaria. Los activos adquiridos durante el matrimonio generalmente son de propiedad conjunta. Si está vendiendo durante o después de un divorcio, la división de equidad puede requerir coordinación legal.\n\n• Consideraciones ALTCS/Medicaid: Para propietarios mayores considerando cuidado a largo plazo, una venta de casa puede impactar la elegibilidad para beneficios del Sistema de Cuidado a Largo Plazo de Arizona (ALTCS). Se aplican límites de activos, y consultar con un abogado de derecho de adultos mayores antes de vender es aconsejable.\n\nEstos son principios generales y no constituyen asesoría legal o fiscal.",
    },
    {
      heading: "Important Information",
      headingEs: "Información Importante",
      content: "This guide is for general educational purposes only. It is not legal, tax, or financial advice.\n\nFor questions about tax implications, legal matters, or financial planning related to selling, please consult with a qualified attorney, CPA, or financial advisor.\n\nNo promises or guarantees are made regarding sale prices, timelines, or outcomes.",
      contentEs: "Esta guía es solo para propósitos educativos generales. No es asesoría legal, fiscal o financiera.\n\nPara preguntas sobre implicaciones fiscales, asuntos legales o planificación financiera relacionada con la venta, consulte con un abogado calificado, contador o asesor financiero.\n\nNo se hacen promesas ni garantías respecto a precios de venta, cronogramas o resultados.",
    },
    {
      heading: "Your Next Step",
      headingEs: "Su Próximo Paso",
      content: "If you'd like clarity on where you stand and what your options look like, the next step below is a good place to begin—at your own pace, with no obligation.",
      contentEs: "Si le gustaría tener claridad sobre dónde se encuentra y cómo lucen sus opciones, el siguiente paso de abajo es un buen lugar para comenzar—a su propio ritmo, sin obligación.",
    },
  {
      heading: "Frequently Asked Questions",
      headingEs: "Preguntas Frecuentes",
      content: "",
      contentEs: "",
      variant: 'faq' as const,
      faqItems: [
        {
          question: "What adds the most value when selling a home in Tucson?",
          questionEs: "¿Qué agrega más valor al vender una casa en Tucson?",
          answer: "I've seen this play out hundreds of times — the highest-ROI moves in Tucson are almost always the same: deep clean, fresh neutral paint, and landscaping that handles our desert climate. Buyers in Pima County are practical. They notice curb appeal and clean surfaces more than granite countertops. Save the big renovation budget and spend it on the things that actually move the needle at showing.",
          answerEs: "Lo he visto suceder cientos de veces — los movimientos de mayor ROI en Tucson son casi siempre los mismos: limpieza profunda, pintura neutra fresca y paisajismo que maneje nuestro clima desértico. Los compradores en el Condado de Pima son prácticos. Notan el atractivo exterior y las superficies limpias más que las encimeras de granito.",
        },
        {
          question: "Should I stage my home before selling in Arizona?",
          questionEs: "¿Debo hacer staging de mi casa antes de vender en Arizona?",
          answer: "Yes — but staging in Tucson doesn't have to mean renting furniture. Most of my clients get strong results from decluttering aggressively, removing personal photos, and making the space feel open and light. Our market moves fast when a home is priced right and shows well. A staged home photographs better, which matters enormously because most buyers decide whether to schedule a showing based on the photos alone.",
          answerEs: "Sí — pero el staging en Tucson no tiene que significar alquilar muebles. La mayoría de mis clientes obtienen resultados sólidos desordennando agresivamente, quitando fotos personales y haciendo que el espacio se sienta abierto y luminoso. Nuestro mercado se mueve rápido cuando una casa tiene el precio correcto y se ve bien.",
        },
        {
          question: "How do I price my home to sell fast in Tucson?",
          questionEs: "¿Cómo fijo el precio de mi casa para vender rápido en Tucson?",
          answer: "Real talk: the sellers who net the most in Tucson are almost never the ones who start highest. Homes priced correctly sell in 15–20 days at close to full ask. Homes that start high and reduce sit 60–75 days, carry $4,000–$6,000 in additional holding costs, and still close lower because buyers see the price cut history. I'll pull a CMA that shows you exactly where to price it — that conversation is always worth having before you list.",
          answerEs: "La verdad es: los vendedores que obtienen más en Tucson casi nunca son los que empiezan más alto. Las casas con precio correcto se venden en 15–20 días cerca del precio de lista. Las que empiezan alto y reducen permanecen 60–75 días y aún así cierran más bajo.",
        },
        {
          question: "What is a CMA and why do I need one before listing?",
          questionEs: "¿Qué es un CMA y por qué lo necesito antes de listar?",
          answer: "A Comparative Market Analysis is the document that tells you what your home is actually worth right now based on what similar homes nearby have sold for in the last 90 days. Without it, you're guessing — and in Tucson's current market, guessing wrong costs you real money. I provide CMAs at no charge and no obligation. It's the first thing we should do together before any decision gets made.",
          answerEs: "Un Análisis Comparativo de Mercado es el documento que le dice lo que su casa realmente vale ahora mismo basado en lo que casas similares cercanas han vendido en los últimos 90 días. Sin él, está adivinando — y en el mercado actual de Tucson, adivinar mal le cuesta dinero real.",
        },
        {
          question: "How long does it take to sell a home in Tucson right now?",
          questionEs: "¿Cuánto tiempo tarda vender una casa en Tucson ahora mismo?",
          answer: "The Tucson median days on market is 38 days right now (January 2026). Priced-right homes in good condition often go faster — sometimes in under 2 weeks. Overpriced homes or those needing significant repairs can sit 60–90 days. Timeline also depends on your neighborhood, price range, and time of year. Spring is historically our strongest season in Pima County. I'll give you an honest estimate based on your specific property.",
          answerEs: "La mediana de días en el mercado en Tucson es de 38 días ahora mismo (enero 2026). Las casas con precio correcto y buena condición a menudo se van más rápido — a veces en menos de 2 semanas. Las sobrevaloradas o que necesitan reparaciones significativas pueden permanecer 60–90 días.",
        },
      ],
    },
  ],
};

export default data;
