import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "Understanding Your Home's Value",
  titleEs: "Entendiendo el Valor de Su Casa",
  category: "Home Valuation",
  categoryEs: "Valoración de Vivienda",
  author: "Kasandra Prieto",
  intro: "Most homeowners have no idea what their home is actually worth right now — and that's not a problem, it's just information you haven't needed yet. Whether you're thinking about selling, refinancing, or just want to understand where you stand, this guide walks through how valuation actually works in the real world. No pressure. No sales talk. Just clarity.",
  introEs: "La mayoría de los propietarios no saben exactamente cuánto vale su casa ahora mismo — y eso no es un problema, es simplemente información que todavía no habías necesitado. Ya sea que estés pensando en vender, refinanciar, o simplemente quieras saber dónde estás parado, esta guía explica cómo funciona realmente la valoración. Sin presión. Sin argumentos de venta. Solo claridad.",
  sections: [
    {
      heading: "You Don't Have to Know This Already",
      headingEs: "No Tienes Que Saber Esto de Antemano",
      content: "You may have seen different numbers from websites, neighbors, or past conversations—and it can feel confusing.\n\nThis guide is designed to bring clarity. You'll learn how valuations work, what factors matter, and how to take a clear next step when you're ready.",
      contentEs: "Puede haber visto diferentes números de sitios web, vecinos o conversaciones pasadas—y puede sentirse confuso.\n\nEsta guía está diseñada para traer claridad. Aprenderá cómo funcionan las valoraciones, qué factores importan, y cómo dar un siguiente paso claro cuando esté listo.",
    },
    {
      heading: "How Does Home Valuation Work?",
      headingEs: "¿Cómo Funciona la Valoración de Viviendas?",
      content: "A home valuation estimates what your property might sell for in current market conditions.\n\nCommon methods include:\n• Comparative Market Analysis (CMA): A local agent reviews recent sales of similar homes nearby. Under current Tucson conditions (as of early 2026), homes are selling at approximately 97.65% of their list price, which means well-prepared CMAs are landing close to actual sale outcomes.\n• Professional Appraisal: A licensed appraiser provides a formal opinion (often used for lending)\n• Online Estimates: Algorithms use public data to generate a number\n\nEach has a purpose. CMAs offer local insight. Appraisals are formal. Online tools are convenient but limited—they cannot see inside your home or account for condition, updates, or neighborhood nuance.",
      contentEs: "Una valoración de vivienda estima por cuánto podría venderse su propiedad en las condiciones actuales del mercado.\n\nMétodos comunes incluyen:\n• Análisis Comparativo de Mercado (CMA): Un agente local revisa ventas recientes de casas similares cercanas. Bajo las condiciones actuales de Tucson (a principios de 2026), las casas se están vendiendo a aproximadamente el 97.65% de su precio de lista, lo que significa que los CMAs bien preparados están aterrizando cerca de los resultados reales de venta.\n• Avalúo Profesional: Un tasador licenciado proporciona una opinión formal (a menudo usado para préstamos)\n• Estimaciones en Línea: Algoritmos usan datos públicos para generar un número\n\nCada uno tiene un propósito. Los CMAs ofrecen perspectiva local. Los avalúos son formales. Las herramientas en línea son convenientes pero limitadas—no pueden ver el interior de su casa ni considerar condición, actualizaciones, o matices del vecindario.",
    },
    {
      heading: "CMA vs. Online Estimate: What's the Real Difference?",
      headingEs: "CMA vs. Estimación en Línea: ¿Cuál Es la Diferencia Real?",
      variant: 'comparison' as const,
      content: "",
      contentEs: "",
      comparisonData: {
        left: {
          label: "Comparative Market Analysis (Agent)",
          labelEs: "Análisis Comparativo de Mercado (Agente)",
          items: [
            { bold: "Accounts for condition:", boldEs: "Considera la condición:", text: "Agent sees inside your home — upgrades, repairs, actual state.", textEs: "El agente ve el interior de tu casa — mejoras, reparaciones, estado real." },
            { bold: "Live comparable sales:", boldEs: "Ventas comparables en vivo:", text: "Uses active Tucson MLS data, not public records lag.", textEs: "Usa datos activos del MLS de Tucson, no retrasos en registros públicos." },
            { bold: "Neighborhood knowledge:", boldEs: "Conocimiento del vecindario:", text: "Accounts for micro-market factors online tools miss.", textEs: "Considera factores del micro-mercado que las herramientas en línea no ven." },
            { bold: "No cost, no obligation:", boldEs: "Sin costo, sin obligación:", text: "20–30 minutes — you walk away with your actual number.", textEs: "20–30 minutos — sales con tu número real." },
          ],
        },
        right: {
          label: "Online Estimate (Algorithm)",
          labelEs: "Estimación en Línea (Algoritmo)",
          items: [
            { bold: "Instant access:", boldEs: "Acceso instantáneo:", text: "Available 24/7, no contact required.", textEs: "Disponible 24/7, sin contacto requerido." },
            { bold: "Public records only:", boldEs: "Solo registros públicos:", text: "Can't see inside your home — condition, upgrades, and layout are invisible.", textEs: "No puede ver el interior de tu casa — condición, mejoras y distribución son invisibles." },
            { bold: "Often off 5–15%:", boldEs: "A menudo errado 5–15%:", text: "In Tucson specifically, outlier sales skew algorithms quickly.", textEs: "En Tucson específicamente, ventas atípicas sesgan los algoritmos rápidamente." },
            { bold: "Good starting point:", boldEs: "Buen punto de partida:", text: "Useful for ballpark, not for pricing decisions.", textEs: "Útil como referencia, no para decisiones de precios." },
          ],
        },
      },
    },
    {
      heading: "Key Factors That Affect Value",
      headingEs: "Factores Clave que Afectan el Valor",
      content: "Several factors influence what buyers might pay:\n\n• Location and neighborhood\n• Size, layout, and number of bedrooms/bathrooms\n• Condition of major systems (roof, HVAC, plumbing)\n• Recent updates or needed repairs\n• Current buyer demand and market trends\n\nFor context: the median sale price in Tucson currently falls between $315,000 and $360,000, with homes averaging 40–78 days on market. These benchmarks help frame what \"average\" means locally—but no two homes are identical, and values shift over time.",
      contentEs: "Varios factores influyen en lo que los compradores podrían pagar:\n\n• Ubicación y vecindario\n• Tamaño, distribución y número de habitaciones/baños\n• Condición de sistemas principales (techo, HVAC, plomería)\n• Actualizaciones recientes o reparaciones necesarias\n• Demanda actual de compradores y tendencias del mercado\n\nPara contexto: el precio medio de venta en Tucson actualmente está entre $315,000 y $360,000, con casas promediando 40–78 días en el mercado. Estos puntos de referencia ayudan a enmarcar lo que significa \"promedio\" localmente—pero no hay dos casas idénticas, y los valores cambian con el tiempo.",
    },
    {
      heading: "When a Valuation Helps",
      headingEs: "Cuándo una Valoración Ayuda",
      content: "Understanding your home's value is useful if you're:\n\n• Considering selling\n• Thinking about refinancing\n• Planning for retirement or major life changes\n• Comparing a cash offer to market value\n• Simply curious about your equity position",
      contentEs: "Entender el valor de su casa es útil si está:\n\n• Considerando vender\n• Pensando en refinanciar\n• Planificando para jubilación o cambios importantes de vida\n• Comparando una oferta en efectivo con el valor de mercado\n• Simplemente curioso sobre su posición de equidad",
    },
    {
      heading: "What a Valuation Cannot Tell You",
      headingEs: "Lo Que una Valoración No Puede Decirle",
      content: "A valuation is an estimate—not a guarantee. The actual sale price depends on buyer interest, negotiations, and market timing.\n\nOnline estimates cannot see inside your home or account for updates. For the clearest picture, speaking with a local professional is often the most helpful step.",
      contentEs: "Una valoración es una estimación—no una garantía. El precio de venta real depende del interés del comprador, negociaciones y el momento del mercado.\n\nLas estimaciones en línea no pueden ver el interior de su casa ni considerar actualizaciones. Para la imagen más clara, hablar con un profesional local a menudo es el paso más útil.",
    },
    {
      heading: "Important Information",
      headingEs: "Información Importante",
      content: "This guide is for general educational purposes only. It is not legal, tax, or financial advice.\n\nHome values are estimates and may differ from actual sale prices. For questions about taxes, legal matters, or financial planning, consult a qualified professional.",
      contentEs: "Esta guía es solo para propósitos educativos generales. No es asesoría legal, fiscal o financiera.\n\nLos valores de las casas son estimaciones y pueden diferir de los precios de venta reales. Para preguntas sobre impuestos, asuntos legales o planificación financiera, consulte a un profesional calificado.",
    },
    {
      heading: "Your Next Step",
      headingEs: "Su Próximo Paso",
      content: "If you'd like clarity on what your home might be worth, the next step below is a good place to begin—at your own pace, with no obligation.",
      contentEs: "Si le gustaría tener claridad sobre cuánto podría valer su casa, el siguiente paso de abajo es un buen lugar para comenzar—a su propio ritmo, sin obligación.",
    },
  {
      heading: '',
      headingEs: '',
      content: '',
      contentEs: '',
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
          question: "How do I find out what my Tucson home is worth right now?",
          questionEs: "¿Cómo averiguo cuánto vale mi casa en Tucson ahora mismo?",
          answer: "The most accurate way is a Comparative Market Analysis — a CMA — done by a local agent who knows Pima County. Online estimates (Zillow's Zestimate, Redfin's estimate) can be useful as a starting point but they're working from public data and algorithms that can't account for your specific upgrades, condition, or the micro-market dynamics of your block. I provide CMAs at no charge and no obligation. It's 20 minutes of your time and you walk away knowing your actual number — not a range that's $50,000 wide.",
          answerEs: "La forma más precisa es un Análisis Comparativo de Mercado — un CMA — realizado por un agente local que conoce el Condado de Pima. Las estimaciones en línea pueden ser útiles como punto de partida pero trabajan con datos públicos y algoritmos que no pueden tener en cuenta sus mejoras específicas, condición o la dinámica del micro-mercado de su cuadra.",
        },
        {
          question: "Why is my Zillow estimate different from what my agent says my home is worth?",
          questionEs: "¿Por qué mi estimación de Zillow es diferente de lo que mi agente dice que vale mi casa?",
          answer: "This comes up constantly and it's a fair question. Zillow's algorithm pulls from public records — assessed value, recent sales within a radius, square footage — but it can't see inside your home. It doesn't know you renovated the kitchen, that your lot backs up to a wash (which buyers either love or avoid), or that your specific street had an outlier sale that skewed the data. In my experience, Zestimates in Tucson are often off by 5–15% in either direction for individual properties. The CMA process closes that gap.",
          answerEs: "Esto surge constantemente y es una pregunta justa. El algoritmo de Zillow extrae datos de registros públicos — valor evaluado, ventas recientes dentro de un radio, pies cuadrados — pero no puede ver dentro de su casa. No sabe que renovó la cocina, que su lote linda con un arroyo, o que su calle específica tuvo una venta atípica que sesgó los datos.",
        },
        {
          question: "What factors affect home value the most in Pima County?",
          questionEs: "¿Qué factores afectan más el valor de la casa en el Condado de Pima?",
          answer: "In Tucson specifically, the factors that move the needle most are: location and school district (Catalina Foothills and Vail consistently command premiums), lot size and usability (a functional backyard with some shade in our climate is genuinely valuable), condition and updating, square footage and bedroom count, and proximity to the mountains or Saguaro National Park. Pool presence is a bigger factor in Tucson than in most markets — buyers expect it at higher price points and it adds perceived value more reliably here than national averages suggest.",
          answerEs: "En Tucson específicamente, los factores que más marcan la diferencia son: ubicación y distrito escolar (Catalina Foothills y Vail consistentemente tienen primas), tamaño y utilidad del lote, condición y actualización, pies cuadrados y número de habitaciones, y proximidad a las montañas. La presencia de piscina es un factor mayor en Tucson que en la mayoría de los mercados.",
        },
        {
          question: "How often do home values change in the Tucson market?",
          questionEs: "¿Con qué frecuencia cambian los valores de las casas en el mercado de Tucson?",
          answer: "Tucson's market moves more slowly and predictably than Phoenix, which is actually a feature for many buyers and sellers. Broad value shifts happen over months, not days — though individual blocks can see faster movement when a highly renovated home sells and resets comps in the area. Right now the market is roughly balanced with 4.92 months of supply. Values have been relatively stable after the appreciation run of 2020–2022. I track the market weekly and can give you an accurate read on what's happening specifically in your neighborhood right now.",
          answerEs: "El mercado de Tucson se mueve más lentamente y predeciblemente que Phoenix, lo cual es realmente una característica para muchos compradores y vendedores. Los cambios amplios de valor ocurren en meses, no en días. Ahora mismo el mercado está aproximadamente equilibrado con 4.92 meses de oferta.",
        },
        {
          question: "Does a pool add value to a home in Tucson?",
          questionEs: "¿Una piscina agrega valor a una casa en Tucson?",
          answer: "Generally yes — and more reliably in Tucson than in most U.S. markets, because the climate makes pools genuinely useful 8–9 months of the year. At price points above $350,000, buyer expectations often include a pool or spa. Studies suggest pools add 5–8% of home value in desert Southwest markets, though the actual impact depends heavily on pool condition, age, and the buyer profile in your price range. A cracked, dated pool with old equipment is less of an asset than a maintained pool with updated finishes. I can help you assess whether a pool investment makes sense before selling.",
          answerEs: "Generalmente sí — y de manera más confiable en Tucson que en la mayoría de los mercados de EE.UU., porque el clima hace que las piscinas sean genuinamente útiles 8–9 meses del año. En precios por encima de $350,000, las expectativas de los compradores a menudo incluyen una piscina o spa. Los estudios sugieren que las piscinas agregan un 5–8% del valor de la casa en mercados del Suroeste desértico.",
        },
      ],
    },
  ],
};

export default data;
