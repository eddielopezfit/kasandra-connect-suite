import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "How Long Does It Take to Sell a House in Tucson?",
  titleEs: "¿Cuánto Tiempo Tarda Vender una Casa en Tucson?",
  category: "selling",
  categoryEs: "Vendiendo",
  author: "Kasandra Prieto",
  intro: "Timeline is one of the first things sellers ask me — and the honest answer is that it depends on four things: your price, your home's condition, your neighborhood, and the time of year. I can give you the Tucson-specific numbers and help you understand where your situation lands on that spectrum.",
  introEs: "El cronograma es una de las primeras cosas que me preguntan los vendedores — y la respuesta honesta es que depende de cuatro cosas: tu precio, la condición de tu casa, tu vecindario y la época del año. Puedo darte los números específicos de Tucson y ayudarte a entender dónde cae tu situación en ese espectro.",
  sections: [
    {
      heading: "The Tucson Timeline — From Decision to Closed",
      headingEs: "El Cronograma de Tucson — Desde la Decisión Hasta el Cierre",
      content: "Here's the realistic timeline for a correctly priced, well-prepared Tucson home in today's market:\n\n**Preparation phase: 1–3 weeks**\nCMA and pricing meeting, minor repairs and touch-ups, professional photography, MLS listing preparation. Some sellers skip this and list immediately — that's sometimes fine, sometimes costly depending on condition.\n\n**Active listing phase: 14–45 days**\nSee the live days-on-market data below. Correctly priced homes in good condition often go under contract in 10–21 days. Overpriced homes or homes needing work can sit 60–90+ days.\n\n**Under contract to close: 30–45 days**\nFor financed buyers (the majority), this period covers inspection and BINSR negotiation (typically 10 days), appraisal (7–14 days), loan underwriting and final approval, title search and escrow work, and the closing appointment itself.\n\n**Total from decision to keys out: 6–10 weeks** for a smooth, well-prepared sale. 10–16 weeks for slower situations. Cash sales can compress the under-contract phase to 7–21 days.",
      contentEs: "Aquí está el cronograma realista para una casa en Tucson con precio correcto y bien preparada en el mercado actual:\n\n**Fase de preparación: 1–3 semanas** — CMA y reunión de precios, reparaciones menores, fotografía profesional, preparación del listado MLS.\n\n**Fase de listado activo: 14–45 días** — Ver el dato en vivo de días en el mercado abajo.\n\n**Bajo contrato hasta el cierre: 30–45 días** — Para compradores financiados, esto cubre inspección y negociación BINSR (típicamente 10 días), tasación (7–14 días), suscripción de préstamo y aprobación final.\n\n**Total desde la decisión hasta entregar las llaves: 6–10 semanas** para una venta fluida y bien preparada.",
    },
    {
      heading: "Current Days on Market — Tucson",
      headingEs: "Días Actuales en el Mercado — Tucson",
      content: "Live median days on market from Pima County MLS.",
      contentEs: "Días promedio en el mercado en vivo del MLS del Condado de Pima.",
      variant: 'market-stats' as const,
      marketStatsVariant: 'dom-only' as const,
    },
    {
      heading: "What Affects Timeline the Most",
      headingEs: "Qué Afecta Más el Cronograma",
      content: "**Price is the biggest variable.** A home priced at market sells in 2–3 weeks with competition. A home priced 5% above market sits 45–60 days before a price reduction. A home priced 10% above market can sit 90+ days and still close below where it could have started.\n\n**Condition affects both days on market and the under-contract phase.** Homes with deferred maintenance take longer to sell AND longer to close — inspection negotiations extend the timeline when there's a lot to work through.\n\n**Neighborhood and season matter.** Spring (February–May) is Tucson's strongest selling season — families moving before school year end, snowbirds making decisions before heading north. Summer (June–August) is slower due to heat. Fall and winter are moderate. If you have timing flexibility, February or March is historically the best window.\n\n**Buyer financing type.** VA and FHA loans add time for appraisal requirements and sometimes repair mandates. Conventional financing is typically faster. Cash is fastest.\n\n**Short sales and estate sales** add time regardless of condition — lender approval on short sales can take 30–120 days after you have a buyer.",
      contentEs: "**El precio es la variable más grande.** Una casa con precio de mercado se vende en 2–3 semanas con competencia. Una casa con un precio del 5% por encima del mercado permanece 45–60 días antes de una reducción de precio.\n\n**La condición afecta tanto los días en el mercado como la fase bajo contrato.** Las casas con mantenimiento diferido tardan más en venderse Y más en cerrar.\n\n**El vecindario y la temporada importan.** La primavera (febrero–mayo) es la temporada de venta más fuerte de Tucson. El verano (junio–agosto) es más lento debido al calor.",
    },
    {
      heading: "Timeline by Price Range in Tucson",
      headingEs: "Cronograma por Rango de Precios en Tucson",
      content: "Days on market varies significantly by price band in Pima County:\n\n**Under $300,000:** Fastest moving segment — limited inventory at this price point, high demand from first-time buyers and investors. Well-priced homes often see multiple offers in under 2 weeks.\n\n**$300,000–$450,000:** The core of the Tucson market. 20–38 days typical for correctly priced homes. Most competitive segment.\n\n**$450,000–$650,000:** More selective buyer pool, slightly longer typical timeline. 30–55 days for priced-right homes. Buyers at this level are more deliberate.\n\n**$650,000+:** Luxury and upper tier. Much smaller buyer pool. 60–120+ days is common even for well-prepared homes. Pricing precision matters more at this level because mistakes take much longer to correct.",
      contentEs: "Los días en el mercado varían significativamente por banda de precios en el Condado de Pima:\n\n**Menos de $300,000:** El segmento de mayor movimiento — inventario limitado, alta demanda de compradores primerizos e inversores.\n\n**$300,000–$450,000:** El núcleo del mercado de Tucson. 20–38 días típicos para casas con precio correcto.\n\n**$450,000–$650,000:** 30–55 días para casas con precio correcto. Los compradores en este nivel son más deliberados.\n\n**$650,000+:** 60–120+ días es común incluso para casas bien preparadas.",
    },
    {
      heading: "How to Shorten Your Timeline",
      headingEs: "Cómo Acortar Tu Cronograma",
      content: "If you need to sell quickly, here's what actually moves the needle:\n\n**Price it right from day one.** The fastest sale is a correctly priced home. Every day of overpricing costs you — both in carrying costs and in the negotiating position you lose as days accumulate.\n\n**Complete your pre-listing prep before going live.** Homes that are clean, photographed, and show-ready from day one get more showing traffic in the first critical 7–10 days — when buyer interest is highest.\n\n**Pre-list inspection.** Know what's there before buyers do. It lets you price appropriately and eliminates the surprise factor in BINSR negotiations that can kill deals or delay closings.\n\n**Accept a cash offer.** Cash offers can close in 7–21 days — the under-contract phase compresses dramatically. You'll typically net less, but if speed is the priority, a vetted cash offer is the fastest legitimate path.\n\n**Be flexible on possession.** Sellers who can offer flexible move-out dates or rent-back arrangements give buyers options that sometimes close deals faster.",
      contentEs: "Si necesitas vender rápido, esto es lo que realmente mueve la aguja:\n\n**Ponle el precio correcto desde el primer día.** La venta más rápida es una casa con precio correcto.\n\n**Completa tu preparación previa al listado antes de publicar.** Las casas que están limpias, fotografiadas y listas para mostrar desde el primer día obtienen más tráfico de visitas.\n\n**Inspección previa al listado.** Conoce lo que hay antes de que lo hagan los compradores.\n\n**Acepta una oferta en efectivo.** Las ofertas en efectivo pueden cerrar en 7–21 días.\n\n**Sé flexible con la posesión.** Los vendedores que pueden ofrecer fechas de mudanza flexibles o arreglos de arrendamiento-recompra dan a los compradores opciones que a veces cierran los tratos más rápido.",
    },
    {
      heading: "Frequently Asked Questions",
      headingEs: "Preguntas Frecuentes",
      content: "",
      contentEs: "",
      variant: 'faq' as const,
      faqItems: [
        {
          question: "How long does it take to sell a house in Tucson right now?",
          questionEs: "¿Cuánto tiempo tarda vender una casa en Tucson ahora mismo?",
          answer: "The current median days on market in Tucson is 38 days (January 2026 data). That's the middle of the distribution — half of homes sell faster, half take longer. A correctly priced home in good condition in a desirable ZIP code can easily go under contract in 10–21 days. An overpriced home or one needing significant work can sit 60–90+ days. From accepted offer to close typically adds 30–45 days for financed buyers.",
          answerEs: "La mediana actual de días en el mercado en Tucson es de 38 días (datos de enero de 2026). Esa es la mitad de la distribución — la mitad de las casas se venden más rápido, la mitad tarda más. Una casa con precio correcto en buena condición en un código postal deseable puede fácilmente estar bajo contrato en 10–21 días.",
        },
        {
          question: "What is the best time of year to sell a house in Tucson?",
          questionEs: "¿Cuál es la mejor época del año para vender una casa en Tucson?",
          answer: "February through May is historically Tucson's strongest selling window. Families are making decisions before the school year ends, snowbirds are in town and sometimes buying, and the weather is beautiful — which helps with showings and curb appeal. January is a strong second — buyers who were deliberating over the holidays often get serious in January. Summer (June–August) is typically the slowest, though the heat doesn't stop motivated buyers. If you have timing flexibility, aim for a February or March listing.",
          answerEs: "Febrero a mayo es históricamente la ventana de venta más fuerte de Tucson. Las familias están tomando decisiones antes de que termine el año escolar, los 'snowbirds' están en la ciudad y a veces comprando, y el clima es hermoso. Enero es un segundo fuerte — los compradores que estaban deliberando durante las vacaciones a menudo se ponen serios en enero.",
        },
        {
          question: "How long does closing take in Arizona after accepting an offer?",
          questionEs: "¿Cuánto tiempo tarda el cierre en Arizona después de aceptar una oferta?",
          answer: "For financed buyers, 30–45 days is the standard Arizona closing timeline. The inspection period is typically the first 10 days, during which the buyer can back out. The appraisal is ordered and usually returns in 7–14 days. Loan underwriting runs in parallel and takes another 2–3 weeks. Cash closings are much faster — most close in 7–21 days from accepted offer. The exact timeline depends on your buyer's lender and how quickly all parties return documents.",
          answerEs: "Para compradores financiados, 30–45 días es el cronograma de cierre estándar de Arizona. El período de inspección es típicamente los primeros 10 días. La tasación se solicita y generalmente regresa en 7–14 días. La suscripción del préstamo se ejecuta en paralelo y toma otras 2–3 semanas. Los cierres en efectivo son mucho más rápidos — la mayoría cierran en 7–21 días desde la oferta aceptada.",
        },
      ],
    },
  ],
};

export default data;
