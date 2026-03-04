import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "Cash Offer vs. Listing Your Tucson Home: What to Expect",
  titleEs: "Oferta en Efectivo vs. Listar Tu Casa en Tucson: Qué Esperar",
  category: "Cash Offers",
  categoryEs: "Ofertas en Efectivo",
  author: "Kasandra Prieto, REALTOR®",
  intro: "If you're wondering whether to take a cash offer or list your Tucson home on the market, you're asking the right question. This guide gives you a clear framework to decide which path fits your life right now — based on what you value most: certainty, equity, or a combination of both.",
  introEs: "Si te preguntas si aceptar una oferta en efectivo o listar tu casa en Tucson en el mercado, estás haciendo la pregunta correcta. Esta guía te da un marco claro para decidir qué camino encaja con tu vida ahora mismo — según lo que más valores: certeza, equidad, o una combinación de ambos.",
  sections: [
    {
      heading: "The 2026 Tucson Market: A Return to Balance",
      headingEs: "El Mercado de Tucson 2026: Un Regreso al Equilibrio",
      variant: 'stats-grid',
      content: "The Tucson market has stabilized. Median home prices in Pima County sit between $361,000 and $379,000. Average time on market is 78 days, 60% of listings see price adjustments, and negotiations average 2.5% below asking price. This balanced leverage means sellers have real choices.",
      contentEs: "El mercado de Tucson se ha estabilizado. Los precios medios de casas en el Condado de Pima están entre $361,000 y $379,000. El tiempo promedio en mercado es 78 días, 60% de los listados ven ajustes de precio, y las negociaciones promedian 2.5% por debajo del precio pedido. Este equilibrio significa que los vendedores tienen opciones reales.",
      statsData: [
        { value: "78 days", valueEs: "78 días", label: "Avg. time on market", labelEs: "Tiempo promedio en mercado" },
        { value: "60%", valueEs: "60%", label: "Of listings see price adjustments", labelEs: "De los listados ven ajustes de precio" },
        { value: "2.5%", valueEs: "2.5%", label: "Avg. negotiation below ask", labelEs: "Negociación promedio bajo precio pedido" },
        { value: "Balanced", valueEs: "Equilibrado", label: "Leverage for both parties", labelEs: "Equilibrio para ambas partes" },
      ],
    },
    {
      heading: "What's Really Going On in the Tucson Market",
      headingEs: "Qué Está Pasando Realmente en el Mercado de Tucson",
      content: "Tucson homes vary widely, which means the best selling strategy varies too.\n\nCommon situations sellers face:\n\n• Inherited property with multiple heirs\n• Relocation for work on a tight timeline\n• Older homes needing repairs you'd rather not fund\n• Maximizing equity before your next chapter\n\nThat's why two paths usually emerge — and neither is wrong. They just solve different problems.\n\nIt is okay to prioritize peace of mind over every last dollar.\nIt is okay to want to open market.\nThe right answer depends on your situation, not a generic rule.",
      contentEs: "Las casas en Tucson varían mucho, lo que significa que la mejor estrategia de venta también varía.\n\nSituaciones comunes que enfrentan los vendedores:\n\n• Propiedad heredada con múltiples herederos\n• Reubicación por trabajo con poco tiempo\n• Casas antiguas que necesitan reparaciones que prefieres no financiar\n• Maximizar equidad antes de tu siguiente capítulo\n\nPor eso generalmente surgen dos caminos — y ninguno es incorrecto. Simplemente resuelven problemas diferentes.\n\nEstá bien priorizar tu tranquilidad sobre cada último dólar.\nEstá bien querer probar el mercado abierto.\nLa respuesta correcta depende de tu situación, no de una regla genérica.",
    },
    {
      heading: "Key Pieces You Need to Understand: Speed vs. Top Dollar",
      headingEs: "Piezas Clave Que Necesitas Entender: Velocidad vs. Máximo Precio",
      variant: 'comparison',
      content: "**The Cash Offer Path (Certainty)**\n\n• Sold as-is — no repairs, no staging\n• Closes in 10–14 days (vs. 30–45+ traditional)\n• Buyer covers most closing costs\n• Offer is typically lower than open-market value\n• Arizona SPDS disclosure still required\n\nBest for: speed, simplicity, guaranteed close date.\n\n**The Traditional Listing Path (Equity)**\n\n• Exposes your home to the widest buyer pool\n• Multiple offers can drive price above asking\n• Requires showings, prep, and \"parade-ready\" condition\n• Closing costs include commissions, Pima County tax prorations, and title fees\n• Timeline: 30–45+ days after finding a buyer\n\nBest for: maximizing your net, homes in good condition, flexible timelines.",
      contentEs: "**El Camino de la Oferta en Efectivo (Certeza)**\n\n• Vendido como está — sin reparaciones, sin preparación\n• Cierra en 10–14 días (vs. 30–45+ tradicional)\n• El comprador cubre la mayoría de costos de cierre\n• La oferta es típicamente más baja que el valor de mercado abierto\n• La divulgación SPDS de Arizona sigue siendo requerida\n\nMejor para: velocidad, simplicidad, fecha de cierre garantizada.\n\n**El Camino del Listado Tradicional (Equidad)**\n\n• Expone tu casa al grupo más amplio de compradores\n• Múltiples ofertas pueden impulsar el precio por encima de lo pedido\n• Requiere visitas, preparación y condición \"lista para desfile\"\n• Los costos de cierre incluyen comisiones, prorrateos de impuestos del Condado de Pima y tarifas de título\n• Cronograma: 30–45+ días después de encontrar comprador\n\nMejor para: maximizar tu neto, casas en buenas condiciones, cronogramas flexibles.",
      comparisonData: {
        left: {
          label: "The Certainty Lever (Cash)",
          labelEs: "La Palanca de Certeza (Efectivo)",
          items: [
            { bold: '"As-Is" Sale:', boldEs: 'Venta "Como Está":', text: "No repairs, no staging required.", textEs: "Sin reparaciones ni preparación." },
            { bold: "Speed:", boldEs: "Velocidad:", text: "Close in 10–14 days instead of 45+.", textEs: "Cierra en 10–14 días en vez de 45+." },
            { bold: "Trade-off:", boldEs: "Compromiso:", text: "Offer is typically lower to account for buyer risk.", textEs: "La oferta suele ser menor para compensar el riesgo del comprador." },
          ],
        },
        right: {
          label: "The Equity Lever (Listing)",
          labelEs: "La Palanca de Equidad (Listar)",
          items: [
            { bold: "Maximum Price:", boldEs: "Precio Máximo:", text: "Exposure to the widest buyer pool.", textEs: "Exposición al grupo más amplio de compradores." },
            { bold: "Costs:", boldEs: "Costos:", text: "Factor in commissions and Pima County tax prorations.", textEs: "Incluye comisiones y prorrateos de impuestos del Condado de Pima." },
            { bold: "Timeline:", boldEs: "Cronograma:", text: "30–45+ days after finding a buyer, plus showings.", textEs: "30–45+ días después de encontrar comprador, más visitas." },
          ],
        },
      },
    },
    {
      heading: "Simple Paths You Can Take",
      headingEs: "Caminos Simples Que Puedes Tomar",
      variant: 'path-selector',
      content: "Which scenario sounds most like you?\n\n**Path A — The Seamless Exit**\nYou've inherited a property, you're relocating, or you don't want the stress of renovation and months of carrying two mortgages. You value a guaranteed \"done\" date.\n\n**Path B — The Equity Max**\nYour home is in good shape and you have time. You want the largest possible check for your next chapter.\n\n**Path C — The Comparison**\nYou aren't sure yet. You want to see a firm cash offer alongside a realistic market-value estimate before deciding.",
      contentEs: "¿Cuál escenario se parece más a ti?\n\n**Camino A — La Salida Sin Complicaciones**\nHeredaste una propiedad, te estás reubicando, o no quieres el estrés de renovar y meses pagando dos hipotecas. Valoras una fecha garantizada de \"listo.\"\n\n**Camino B — El Máximo de Equidad**\nTu casa está en buenas condiciones y tienes tiempo. Quieres el cheque más grande posible para tu siguiente capítulo.\n\n**Camino C — La Comparación**\nAún no estás seguro. Quieres ver una oferta firme en efectivo junto a una estimación realista de valor de mercado antes de decidir.",
      pathData: [
        {
          id: 'A',
          title: 'The Seamless Exit',
          titleEs: 'La Salida Sin Complicaciones',
          desc: 'You value speed and certainty. Perfect for inherited homes or quick relocations.',
          descEs: 'Valoras velocidad y certeza. Perfecto para propiedades heredadas o reubicaciones rápidas.',
        },
        {
          id: 'B',
          title: 'The Equity Max',
          titleEs: 'El Máximo de Equidad',
          desc: 'You want top dollar and have time to manage showings and minor repairs.',
          descEs: 'Quieres el mejor precio y tienes tiempo para manejar visitas y reparaciones menores.',
        },
        {
          id: 'C',
          title: 'The Strategic Hybrid',
          titleEs: 'El Híbrido Estratégico',
          desc: 'You want to see a firm cash offer side-by-side with a market estimate first.',
          descEs: 'Quieres ver una oferta firme en efectivo junto a una estimación de mercado primero.',
        },
      ],
    },
    {
      heading: "How Selena and Kasandra Fit In",
      headingEs: "Cómo Encajan Selena y Kasandra",
      content: "Selena keeps your steps organized and routes you to the right tools — like the options comparison or readiness checks — so you never feel lost.\n\nKasandra is your calm, high-skill guide when you're ready to move past the \"what-ifs\" and build a personal plan that protects your interests and your equity.",
      contentEs: "Selena mantiene tus pasos organizados y te dirige a las herramientas correctas — como la comparación de opciones o los checks de preparación — para que nunca te sientas perdido.\n\nKasandra es tu guía tranquila y de alta habilidad cuando estás listo para pasar de los \"y si\" y crear un plan personal que proteja tus intereses y tu equidad.",
    },
    {
      heading: "Decision Ladder: Choose Your Next Step",
      headingEs: "Escalera de Decisión: Elige Tu Siguiente Paso",
      content: "Choose the step that fits your situation right now.\n\n**Option 1 — Compare real offers**\nSee what different types of offers look like with your numbers.\n\n**Option 2 — Clarify your timeline**\nA quick readiness check to see where you stand.\n\n**Option 3 — Build a selling plan**\nIf you're moving in the next few months, let's talk.",
      contentEs: "Elige el paso que encaja con tu situación ahora mismo.\n\n**Opción 1 — Comparar ofertas reales**\nVe cómo se ven diferentes tipos de ofertas con tus números.\n\n**Opción 2 — Clarificar tu cronograma**\nUn check rápido de preparación para ver dónde estás.\n\n**Opción 3 — Crear un plan de venta**\nSi te mudarás en los próximos meses, hablemos.",
    },
  ],
};

export default data;
