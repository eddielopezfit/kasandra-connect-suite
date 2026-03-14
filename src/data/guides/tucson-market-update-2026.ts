import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Tucson Real Estate Market Update: March 2026',
  titleEs: 'Actualización del Mercado Inmobiliario de Tucson: Marzo 2026',
  category: 'Understanding Your Value',
  categoryEs: 'Entendiendo Tu Valor',
  author: 'Kasandra Prieto',
  intro: "I'm in this market every week — writing offers, reviewing CMAs, talking to buyers and sellers at every stage. So when people ask me 'how's the market?' I want to give you the real picture, not a headline. Here's what I'm actually seeing in Tucson right now.",
  introEs: "Ya sea que estés pensando en comprar, vender, o simplemente mantenerte al tanto de lo que está pasando, aquí tienes una mirada clara de dónde está el mercado de Tucson en este momento — sin exageraciones, y con suficiente contexto para ayudarte a tomar decisiones.",
  sections: [
    {
      heading: 'Where Tucson Stands Right Now',
      headingEs: 'Dónde Está Tucson en Este Momento',
      content: "Tucson's real estate market in early 2026 reflects a broader national pattern: prices have stabilized after the rapid appreciation of 2021–2023, interest rates have settled into a new normal range, and both buyers and sellers are finding more predictability than they had two years ago.\n\nKey numbers for Pima County as of early 2026:\n• Median single-family home price: $365,000\n• Average days on market: 38 days\n• Sale-to-list ratio: 97.6% (homes selling close to asking price)\n• Active listings: approximately 4,600\n• 30-year fixed mortgage rate: approximately 6.5–6.8%\n\nWhat this means practically: Tucson is not a buyer's market or a seller's market in the extreme sense — it's a balanced market with a slight seller advantage in well-priced, move-in-ready segments. Overpriced or dated properties are sitting longer. Well-prepared homes in the right price range are still moving in 2–3 weeks.",
      contentEs: "El mercado inmobiliario de Tucson a principios de 2026 refleja un patrón nacional más amplio: los precios se han estabilizado después de la rápida apreciación de 2021–2023, las tasas de interés se han asentado en un nuevo rango normal, y tanto compradores como vendedores están encontrando más predictibilidad que hace dos años.\n\nNúmeros clave para el Condado de Pima a principios de 2026:\n• Precio medio de casa unifamiliar: $365,000\n• Días promedio en el mercado: 38 días\n• Relación precio de venta/lista: 97.6% (casas vendiéndose cerca del precio de lista)\n• Listados activos: aproximadamente 4,600\n• Tasa hipotecaria fija a 30 años: aproximadamente 6.5–6.8%",
      variant: 'stats-grid' as const,
      statsData: [
        { value: '$365K', valueEs: '$365K', label: 'Median sale price — Pima County (early 2026)', labelEs: 'Precio medio de venta — Condado de Pima (principios 2026)' },
        { value: '38 days', valueEs: '38 días', label: 'Average days on market', labelEs: 'Días promedio en el mercado' },
        { value: '97.6%', valueEs: '97.6%', label: 'Sale-to-list ratio (homes selling near asking price)', labelEs: 'Relación precio de venta/lista' },
        { value: '~4,600', valueEs: '~4,600', label: 'Active listings in Pima County MLS', labelEs: 'Listados activos en el MLS del Condado de Pima' },
      ],
    },
    {
      heading: 'What This Market Means for Buyers',
      headingEs: 'Lo Que Este Mercado Significa para los Compradores',
      content: "If you've been waiting for prices to drop significantly, that window has likely passed for this cycle. The Tucson market has found a floor. What you do have now that you didn't have in 2021 or 2022:\n\n**More time.** Homes are taking an average of 38 days to sell — not 5. You can schedule an inspection, sleep on an offer, and ask questions before committing.\n\n**More negotiating room.** The average sale comes in at 97.6% of list price, which means sellers are accepting discounts. Motivated sellers are accepting more. In 2021, most homes sold above asking. That era is over.\n\n**More inventory.** With ~4,600 active listings, you have real choices. You're not bidding against 15 other offers on a property you found two hours ago.\n\n**The rate reality.** At 6.5–6.8%, monthly payments are higher than the 2021 era of 3% rates. This is the primary challenge for buyers. But Tucson's prices have not increased to match the rate increase proportionally — which means affordability, while stretched, is better here than in most comparable Arizona markets.\n\nThe strongest buyer moves right now: get fully pre-approved (not just pre-qualified), focus on move-in-ready homes in the $300K–$425K range, and don't wait for rates to hit 5% — that timeline is uncertain and prices will likely adjust upward if rates do fall.",
      contentEs: "Si has estado esperando que los precios bajen significativamente, esa ventana probablemente ha pasado para este ciclo. El mercado de Tucson ha encontrado un piso. Lo que sí tienes ahora que no tenías en 2021 o 2022:\n\n**Más tiempo.** Las casas están tardando un promedio de 38 días en venderse — no 5. Puedes programar una inspección, dormir sobre una oferta y hacer preguntas antes de comprometerte.\n\n**Más margen de negociación.** La venta promedio llega al 97.6% del precio de lista, lo que significa que los vendedores están aceptando descuentos. Los vendedores motivados están aceptando más. En 2021, la mayoría de las casas se vendían por encima del precio pedido. Esa era terminó.\n\n**Más inventario.** Con aproximadamente 4,600 listados activos, tienes opciones reales. No estás compitiendo contra 15 otras ofertas en una propiedad que encontraste hace dos horas.",
    },
    {
      heading: 'What This Market Means for Sellers',
      headingEs: 'Lo Que Este Mercado Significa para los Vendedores',
      content: "Selling in 2026 is very doable — but it requires realistic pricing and preparation. The sellers who are struggling right now have two things in common: they overpriced, and they didn't prepare the home.\n\n**Pricing:** The 97.6% sale-to-list ratio means the market is efficient. A home priced 5% above market will sit. A home priced correctly will sell in 2–3 weeks. Overpricing costs sellers more than it saves — every month a home sits unsold costs approximately $540/day in mortgage, taxes, and insurance.\n\n**Preparation:** Move-in-ready homes command a premium right now. Buyers have more choices and will pay more to avoid the work. A pre-listing inspection, fresh paint, and deep cleaning are returns on investment in this market.\n\n**Equity position:** If you bought before 2020, you have significant equity. Even buyers from 2021–2022 at the peak are generally sitting flat or slightly positive. Tucson prices have held.\n\n**Timing:** The spring selling season (March–June) consistently brings the most buyer activity in Tucson. If you're considering selling, now is the right window to prepare and list.",
      contentEs: "Vender en 2026 es completamente factible — pero requiere precios realistas y preparación. Los vendedores que están teniendo dificultades ahora tienen dos cosas en común: pusieron precios demasiado altos y no prepararon la casa.\n\n**Precios:** La relación del 97.6% significa que el mercado es eficiente. Una casa con precio 5% por encima del mercado se quedará. Una casa con precio correcto se vende en 2–3 semanas. El precio excesivo le cuesta a los vendedores más de lo que ahorra — cada mes que una casa permanece sin vender cuesta aproximadamente $540/día en hipoteca, impuestos y seguro.",
    },
    {
      heading: 'Neighborhood Trends Worth Knowing',
      headingEs: 'Tendencias de Vecindarios que Vale la Pena Conocer',
      content: "Not all of Tucson is moving at the same pace. Here's what we're seeing by area:\n\n**Northwest Tucson / Marana (85741, 85742, 85658):** Consistently strong. Family buyers drive demand. New construction is active, which provides competition for resales but also signals continued growth confidence in the corridor.\n\n**Catalina Foothills (85718, 85750):** Luxury segment holding well. Homes over $600K are taking longer but not deeply discounting. This area benefits from limited land availability.\n\n**Midtown / Sam Hughes / Blenman-Elm (85711, 85716):** High demand for historic walkable neighborhoods. Character homes are selling quickly when priced correctly. Limited inventory creates a micro-seller's market.\n\n**Rita Ranch / Vail (85747, 85641):** Military family zone. Consistent demand year-round. VA loan activity is strong here. Good schools keep demand stable.\n\n**South Tucson / Southside (85706, 85713):** Most affordable entry points in the metro. First-time buyers and investors. Longer days on market but improving conditions as affordability pressure pushes buyers south.\n\n**East Tucson (85748, 85749):** Growing corridor. Strong for families wanting newer construction at lower prices than the northwest.",
      contentEs: "No todo Tucson se está moviendo al mismo ritmo. Esto es lo que estamos viendo por área:\n\n**Noroeste de Tucson / Marana (85741, 85742, 85658):** Consistentemente fuerte. Los compradores familiares impulsan la demanda. La nueva construcción está activa, lo que proporciona competencia para reventas pero también señala confianza en el crecimiento continuo del corredor.\n\n**Catalina Foothills (85718, 85750):** El segmento de lujo se mantiene bien. Las casas de más de $600K están tardando más pero no descuentan profundamente.\n\n**Midtown / Sam Hughes / Blenman-Elm (85711, 85716):** Alta demanda de vecindarios históricos transitables. Las casas con carácter se venden rápidamente cuando tienen el precio correcto.",
    },
    {
      heading: 'The Rate Question Everyone Is Asking',
      headingEs: 'La Pregunta Sobre Las Tasas Que Todos Hacen',
      content: "Will rates drop? The honest answer: no one knows. Mortgage rates are influenced by inflation, Federal Reserve policy, bond markets, and global economic conditions — none of which any local market expert can predict with certainty.\n\nWhat we do know:\n• Waiting for rates to return to 3–4% is likely waiting for a scenario that may not come in your planning horizon\n• If rates do drop significantly, buyer demand will surge and prices will likely rise — offsetting much of the monthly payment benefit\n• The buyers who are winning right now are the ones who buy at today's price, with today's terms, and refinance if rates improve\n• 'Marry the home, date the rate' is the most practical advice for most buyers in this market\n\nKasandra can help you run the actual numbers for your situation — comparing buying now vs. waiting, factoring in current rent costs, and calculating what rate would need to happen for waiting to be worth it. That conversation is free and has no obligation.",
      contentEs: "¿Bajarán las tasas? La respuesta honesta: nadie lo sabe. Las tasas hipotecarias están influenciadas por la inflación, la política de la Reserva Federal, los mercados de bonos y las condiciones económicas globales — ninguna de las cuales ningún experto del mercado local puede predecir con certeza.\n\nLo que sí sabemos:\n• Esperar a que las tasas vuelvan al 3–4% probablemente significa esperar un escenario que puede no llegar en tu horizonte de planificación\n• Si las tasas caen significativamente, la demanda de compradores aumentará y los precios probablemente subirán — compensando gran parte del beneficio del pago mensual",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "Whether you're a buyer trying to time the market, a seller figuring out if this is the right moment, or simply curious about what your home is worth today — a direct conversation with Kasandra is the fastest way to get a clear answer for your specific situation.\n\nTucson market data is interesting. Your situation is what matters.",
      contentEs: "Ya sea que seas un comprador tratando de cronometrar el mercado, un vendedor descubriendo si este es el momento correcto, o simplemente curioso sobre cuánto vale tu casa hoy — una conversación directa con Kasandra es la forma más rápida de obtener una respuesta clara para tu situación específica.\n\nLos datos del mercado de Tucson son interesantes. Tu situación es lo que importa.",
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
          question: 'Is now a good time to buy a home in Tucson?',
          questionEs: '¿Es buen momento para comprar una casa en Tucson?',
          answer: 'It depends on your personal situation more than market timing. Tucson prices have stabilized, inventory is reasonable, and buyers have more negotiating room than at any point since 2019. The main challenge is mortgage rates. If you have stable income, a down payment, and a 5+ year horizon, the math often favors buying over continuing to rent in Tucson right now. I can run the specific numbers for your situation in a free strategy call.',
          answerEs: 'Depende más de tu situación personal que del momento del mercado. Los precios de Tucson se han estabilizado, el inventario es razonable y los compradores tienen más margen de negociación que en cualquier momento desde 2019. El principal desafío son las tasas hipotecarias. Si tienes ingresos estables, un pago inicial y un horizonte de 5+ años, la matemática a menudo favorece comprar sobre seguir rentando en Tucson ahora.',
        },
        {
          question: 'Are Tucson home prices going to drop in 2026?',
          questionEs: '¿Van a bajar los precios de las casas en Tucson en 2026?',
          answer: "Significant price drops in Tucson are unlikely in 2026 given current inventory levels and population growth. The Tucson market is undersupplied relative to demand, and employer growth (Davis-Monthan expansion, University of Arizona, tech corridor) continues to bring new residents. A modest price increase of 2–4% is the more likely scenario. That said, I don't make market predictions — I make decisions with real buyers and sellers every week and can tell you what I'm actually seeing.",
          answerEs: 'Las caídas significativas de precios en Tucson son poco probables en 2026 dado los niveles actuales de inventario y el crecimiento poblacional. El mercado de Tucson está subabastecido en relación con la demanda, y el crecimiento del empleador continúa trayendo nuevos residentes. Un modesto aumento de precios del 2–4% es el escenario más probable.',
        },
      ],
    },
  ],
};

export default data;
