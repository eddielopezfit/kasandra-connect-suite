import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'How to Price Your Tucson Home: A Seller\'s Strategy Guide',
  titleEs: 'Cómo Fijar el Precio de Tu Casa en Tucson: Guía de Estrategia para Vendedores',
  category: 'Selling a Home',
  categoryEs: 'Vender una Casa',
  author: 'Kasandra Prieto',
  intro: "Most sellers I talk to have the same quiet worry: what if I price it wrong? Too high and it sits. Too low and you wonder what you left behind. Both feel bad. This guide explains how pricing actually works in Tucson's market — so the number you choose is grounded in data and yours, not a guess someone else made for you.",
  introEs: "La mayoría de los vendedores con los que hablo tienen la misma preocupación silenciosa: ¿y si pongo el precio equivocado? Muy alto y la casa se queda. Muy bajo y te preguntas qué dejaste ir. Ambas cosas se sienten mal. Esta guía explica cómo funciona realmente el precio en el mercado de Tucson — para que el número que elijas esté basado en datos y sea tuyo, no una suposición de alguien más.",
  sections: [
    {
      heading: "What Determines Your Home's Market Value",
      headingEs: 'Qué Determina el Valor de Mercado de Tu Casa',
      content: "It's okay not to know your number yet — most sellers don't when they start. That's not a problem; it's why you're reading this.\n\nYour home is worth what a ready, willing, and qualified buyer will pay for it — in today's market, in its current condition, with available financing.\n\nThat value is determined by:\n\n**Comparable sales (\"comps\")** — What similar homes in your neighborhood sold for in the past 60–90 days. These are the most reliable indicator. Tucson's March 2026 data: median single-family home sold at $365,000, average $226/sqft.\n\n**Active competition** — What similar homes are currently listed for. Buyers compare your home to everything else available. If three similar homes are listed at $380,000 and you list at $395,000 with identical features, your home will sit.\n\n**Condition adjustment** — Comps are adjusted for condition differences. A home with an updated kitchen and new HVAC commands a premium over an identical floor plan with original 1995 finishes.\n\n**Location micro-factors** — Lot position (corner lot vs. cul-de-sac vs. backs to busy road), school district, proximity to amenities and flight paths all affect value.\n\n**What does NOT determine market value:**\n• What you paid for it\n• What you need to net\n• What Zillow says\n• What a neighbor sold for three years ago\n• The cost of your recent improvements (improvements add value, but rarely return 100%)",
      contentEs: "Tu casa vale lo que un comprador listo, dispuesto y calificado pagará por ella — en el mercado actual, en su condición actual, con financiamiento disponible.\n\nEse valor está determinado por:\n\n**Ventas comparables (\"comps\")** — Lo que casas similares en tu vecindario vendieron en los últimos 60–90 días. Datos de marzo 2026 de Tucson: casa unifamiliar mediana vendida en $365,000, promedio $226/pie cuadrado.\n\n**Competencia activa** — Lo que casas similares actualmente están listadas. Los compradores comparan tu casa con todo lo demás disponible.\n\n**Ajuste de condición** — Los comps se ajustan por diferencias de condición.\n\n**Lo que NO determina el valor de mercado:**\n• Lo que pagaste por ella\n• Lo que necesitas obtener neto\n• Lo que dice Zillow\n• Lo que un vecino vendió hace tres años",
    },
    {
      heading: 'How to Read a CMA: What Your Agent Should Show You',
      headingEs: 'Cómo Leer un CMA: Lo Que Tu Agente Debería Mostrarte',
      content: "A Comparative Market Analysis (CMA) is the core tool for pricing. A good CMA includes:\n\n**Sold comps (most important):** 3–6 homes that have sold in the past 90 days, within 0.5–1 mile of your home, with similar square footage (within 10–15%), similar bedroom/bathroom count, and similar lot size. Each comp should show the list price, sale price, and days on market.\n\n**Active listings:** Your current competition. These set buyer expectations. Pay attention to which ones have had price reductions — those are homes that were overpriced.\n\n**Expired/withdrawn listings:** Homes that were listed but never sold. These often reveal the ceiling — the price point above which buyers in your area simply stop buying.\n\n**Price per square foot analysis:** Useful for sanity-checking but shouldn't be used in isolation. Older homes with functional layouts often sell below $/sqft averages; renovated homes command premiums.\n\nWhat to ask your agent: \"Show me the 3 homes most like mine that sold in the last 90 days. What would have to be different about my home to justify a price above the highest comp?\"",
      contentEs: "Un Análisis Comparativo de Mercado (CMA) es la herramienta central para fijar precios. Un buen CMA incluye:\n\n**Comps vendidos (más importantes):** 3–6 casas que se vendieron en los últimos 90 días, dentro de 0.5–1 milla de tu casa, con metraje similar, conteo similar de dormitorios/baños y tamaño de lote similar.\n\n**Listados activos:** Tu competencia actual. Estos establecen las expectativas del comprador. Presta atención a cuáles han tenido reducciones de precio — esas son casas que estaban sobrevaloradas.\n\n**Listados expirados/retirados:** Casas que fueron listadas pero nunca se vendieron. Estos a menudo revelan el techo — el punto de precio por encima del cual los compradores en tu área simplemente dejan de comprar.",
    },
    {
      heading: 'The Pricing Strategy Decision',
      headingEs: 'La Decisión de Estrategia de Precios',
      variant: 'path-selector',
      content: "There are three meaningful pricing strategies. Each has different risk/reward profiles in Tucson's current balanced market (4.92 months supply, 97.64% sale-to-list ratio, March 2026).",
      contentEs: "Hay tres estrategias de precios significativas. Cada una tiene diferentes perfiles de riesgo/recompensa en el mercado equilibrado actual de Tucson.",
      pathData: [
        {
          id: 'below-market',
          title: 'Price Slightly Below Market',
          titleEs: 'Precio Ligeramente Por Debajo del Mercado',
          desc: 'Creates urgency and competitive interest. Can generate multiple offers that drive price above list. Works best for homes in excellent condition. Risk: leaving money on table if market is softer than expected.',
          descEs: 'Crea urgencia e interés competitivo. Puede generar múltiples ofertas que impulsen el precio por encima de lista. Funciona mejor para casas en excelente condición. Riesgo: dejar dinero sobre la mesa si el mercado es más suave de lo esperado.',
        },
        {
          id: 'at-market',
          title: 'Price At Market Value',
          titleEs: 'Precio al Valor de Mercado',
          desc: 'Most reliable strategy in a balanced market. Attracts qualified buyers quickly. Minimal negotiation expected. Consistent with Tucson median data. Best for well-maintained homes without strong urgency.',
          descEs: 'Estrategia más confiable en un mercado equilibrado. Atrae compradores calificados rápidamente. Se espera negociación mínima. Consistente con los datos medianos de Tucson. Mejor para casas bien mantenidas sin fuerte urgencia.',
        },
        {
          id: 'above-market',
          title: 'Price Above Market (Test the Market)',
          titleEs: 'Precio Por Encima del Mercado (Probar el Mercado)',
          desc: 'High risk in current conditions. Homes priced above market sit, accumulate DOM, and require price reductions that signal weakness to buyers. Almost always results in a lower net than pricing correctly from day one.',
          descEs: 'Alto riesgo en las condiciones actuales. Las casas con precio por encima del mercado permanecen, acumulan DOM y requieren reducciones de precio que señalan debilidad a los compradores.',
        },
      ],
    },
    {
      heading: 'The True Cost of Overpricing',
      headingEs: 'El Costo Real de Sobrevalorar',
      content: "This is the most important section of this guide. Most sellers who overprice believe they can always reduce the price later. What they don't account for:\n\n**Days on market signal.** Buyers and buyer's agents see the full listing history. A home that has been on market for 60+ days with a price reduction carries a stigma — buyers assume something is wrong and bid lower accordingly.\n\n**Carrying costs.** Every month your home doesn't sell costs you: mortgage payments, property taxes, HOA fees, insurance, and utilities. At $2,000–$2,500/month in total carrying costs, a 60-day overpricing delay costs $4,000–$5,000 out of pocket — often more than you would have gained by pricing higher.\n\n**The Tucson data:** In January 2026, homes in Tucson sold at 97.64% of list price. Homes that required price reductions sold at a lower percentage — and stayed on market 2–3x longer.\n\n**The math on pricing correctly:** A home priced at $365,000 that sells in 15 days at 97.64% nets $356,386. A home listed at $390,000, reduced twice to $365,000 after 75 days, and sold at 97% nets $354,050 — after carrying costs of $3,750+. Net result: the overpriced strategy costs $5,000–$8,000 more.",
      contentEs: "Esta es la sección más importante de esta guía. La mayoría de los vendedores que sobrevaloran creen que siempre pueden reducir el precio más tarde. Lo que no tienen en cuenta:\n\n**Señal de días en mercado.** Los compradores y agentes del comprador ven el historial completo del listado. Una casa que ha estado en el mercado durante 60+ días con una reducción de precio lleva un estigma.\n\n**Costos de posesión.** Cada mes que tu casa no se vende te cuesta: pagos de hipoteca, impuestos de propiedad, cuotas de HOA, seguro y servicios públicos.\n\n**Los datos de Tucson:** En enero de 2026, las casas en Tucson se vendieron al 97.64% del precio de lista. Las casas que requirieron reducciones de precio se vendieron a un porcentaje más bajo — y permanecieron en el mercado 2–3 veces más.",
    },
,
    {
      heading: "Tucson Pricing Benchmarks: What the Data Shows",
      headingEs: "Puntos de Referencia de Precios en Tucson: Lo Que Muestran los Datos",
      variant: 'stats-grid' as const,
      content: "These are the numbers that define Tucson's current pricing environment. Price correctly from day one and these benchmarks work in your favor.",
      contentEs: "Estos son los números que definen el entorno de precios actual de Tucson. Establece el precio correcto desde el primer día y estos puntos de referencia trabajarán a tu favor.",
      statsData: [
        { value: '97.64%', valueEs: '97.64%', label: 'Sale-to-list ratio in Tucson — correctly priced homes sell close to asking', labelEs: 'Relación venta-lista en Tucson — casas bien valuadas se venden cerca del precio pedido' },
        { value: '4.92 mo', valueEs: '4.92 meses', label: 'Current market supply — a balanced market', labelEs: 'Oferta actual del mercado — un mercado equilibrado' },
        { value: '~7% lower', valueEs: '~7% menos', label: 'Average final price for overpriced homes that required a reduction', labelEs: 'Precio final promedio para casas sobrevaloradas que necesitaron reducción' },
        { value: '2× more', valueEs: '2× más', label: 'Showings in first 2 weeks vs rest of listing life — the pricing window matters', labelEs: 'Visitas en las primeras 2 semanas vs resto de la vida del listado — la ventana de precios importa' },
      ],
    },
    {
      heading: 'Responding to Low Offers and Negotiation',
      headingEs: 'Responder a Ofertas Bajas y Negociación',
      content: "In Tucson's current market, negotiation is normal and expected. Here's how to think about it:\n\n**Expect 2–4% below list.** With a sale-to-list ratio of 97.64%, the first offer will often be 2–5% below list price. This is not an insult — it's a starting position.\n\n**Counter don't reject.** A counteroffer keeps the conversation alive. Even if the offer feels low, counter at or near your desired price and let the buyer respond. Rejecting outright ends a transaction that might have closed.\n\n**Look at the full picture.** A cash offer at 95% of list price may net more than a financed offer at 99% after appraisal risk, contingency delays, and carrying cost differences.\n\n**Concessions vs. price reductions.** If a buyer asks for closing cost contributions, evaluate this differently than a price reduction. A $5,000 concession reduces your net but keeps the sale price intact (which matters for your neighborhood's comp data).\n\n**When to hold firm:** If you're priced correctly and you've had the listing for less than 14 days, hold closer to your price. The market hasn't fully responded yet.",
      contentEs: "En el mercado actual de Tucson, la negociación es normal y esperada. Así es cómo pensarlo:\n\n**Espera 2–4% por debajo de lista.** Con una relación venta-lista del 97.64%, la primera oferta a menudo será 2–5% por debajo del precio de lista.\n\n**Contraoferta, no rechaces.** Una contraoferta mantiene viva la conversación. Incluso si la oferta parece baja, contraoferta en o cerca de tu precio deseado.\n\n**Mira el panorama completo.** Una oferta en efectivo al 95% del precio de lista puede resultar en más neto que una oferta financiada al 99% después del riesgo de tasación, retrasos de contingencia y diferencias de costos de posesión.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "Pricing your home correctly is not a guess — it's an analysis. The best way to know your number is a CMA from someone who knows your specific Tucson neighborhood, not just the metro average.\n\nKasandra will prepare a full CMA for your home at no cost or commitment. If you'd like to understand what your home is worth in today's market, start that conversation with Selena.",
      contentEs: "Fijar el precio correcto de tu casa no es una suposición — es un análisis. La mejor manera de conocer tu número es un CMA de alguien que conoce tu vecindario específico de Tucson, no solo el promedio del metro.\n\nKasandra preparará un CMA completo para tu casa sin costo ni compromiso.",
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
          question: "What happens if I price my home too high in Tucson?",
          questionEs: "¿Qué pasa si fijo el precio de mi casa demasiado alto en Tucson?",
          answer: "Overpricing is one of the most expensive mistakes you can make in a sale — and I say that because I've watched it play out many times. A home that sits too long in Tucson starts to carry a stigma. Buyers ask 'what's wrong with it?' Days on market become a negotiating tool against you. You eventually reduce, but buyers who've been watching now have leverage. The homes that net the most almost always price correctly from day one and sell in the first 2–3 weeks with competition. There's a real cost to starting too high.",
          answerEs: "Sobrevalorar es uno de los errores más costosos que puede cometer en una venta. Una casa que permanece demasiado tiempo en Tucson empieza a tener un estigma. Los compradores preguntan '¿qué tiene de malo?' Los días en el mercado se convierten en una herramienta de negociación en su contra.",
        },
        {
          question: "How do real estate agents determine the listing price of a home?",
          questionEs: "¿Cómo determinan los agentes de bienes raíces el precio de listado de una casa?",
          answer: "A good listing price comes from a Comparative Market Analysis — looking at what similar homes in your area have actually sold for in the last 60–90 days, adjusted for differences in size, condition, features, and location. The key word is sold — not listed. What sellers are asking for is irrelevant; what buyers are paying is what matters. I look at active competition, expired listings (homes that didn't sell at their asking price), and recent closed sales to find the range where your home should live. Then we decide together whether to price at, slightly below, or slightly above market based on your goals.",
          answerEs: "Un buen precio de listado proviene de un Análisis Comparativo de Mercado — mirando lo que casas similares en su área realmente han vendido en los últimos 60–90 días, ajustado por diferencias en tamaño, condición, características y ubicación. La palabra clave es vendido — no listado.",
        },
        {
          question: "Should I price my Tucson home below market to create a bidding war?",
          questionEs: "¿Debo fijar el precio de mi casa en Tucson por debajo del mercado para crear una guerra de ofertas?",
          answer: "This strategy works in strong seller's markets with low inventory — and Tucson has seen it work well during 2020–2022. In today's more balanced market (4.92 months supply), intentionally underpricing carries real risk: you might get fewer offers than you expected and end up accepting less than market value. The smarter move in the current environment is pricing at market, presenting the home well, and letting genuine competition develop naturally. I'll tell you honestly when the conditions are right for an aggressive pricing strategy and when they're not.",
          answerEs: "Esta estrategia funciona en mercados de vendedores fuertes con bajo inventario — y Tucson la ha visto funcionar bien durante 2020–2022. En el mercado más equilibrado de hoy (4.92 meses de oferta), subvalorar intencionalmente conlleva riesgo real: podría obtener menos ofertas de las esperadas.",
        },
        {
          question: "How do I handle a lowball offer on my Tucson home?",
          questionEs: "¿Cómo manejo una oferta baja en mi casa de Tucson?",
          answer: "Don't reject it — counter it. A lowball offer is at least a buyer who's engaged and interested. Your counter should be at or near your asking price, with a brief explanation of the comps that support your value. Sometimes lowball buyers are testing; sometimes they have a real budget constraint you can work around with creative terms (closing cost assistance, a later possession date). The goal is to keep the conversation alive without showing desperation. I'll help you craft a counter that signals strength without burning the bridge.",
          answerEs: "No la rechace — contraoferte. Una oferta baja es al menos un comprador que está comprometido e interesado. Su contraoferta debe estar en o cerca de su precio de venta, con una breve explicación de las comparables que respaldan su valor. El objetivo es mantener la conversación viva sin mostrar desesperación.",
        },
      ],
    },
  ],
};

export default data;
