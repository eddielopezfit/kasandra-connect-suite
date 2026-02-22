import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Clock, User } from "lucide-react";
import V2Layout from "@/components/v2/V2Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/v2/LanguageToggle";
import { AuthorityCTABlock, SelenaGuideHandoff, GuideComplianceFooter } from "@/components/v2/guides";
import GuideImage from "@/components/v2/guides/GuideImage";
import GuideVideo from "@/components/v2/guides/GuideVideo";
import GuidePullQuote from "@/components/v2/guides/GuidePullQuote";
import { GUIDE_MEDIA_SLOTS, validateMediaSlots, type MediaSlot } from "@/lib/guides/guideMediaSlots";
import { useGuideScrollTracking } from "@/hooks/useGuideScrollTracking";
import { logEvent } from "@/lib/analytics/logEvent";
import { markGuideRead, setLastGuideId } from "@/lib/guides/personalization";
import { getGuideById, type GuideCategory } from "@/lib/guides/guideRegistry";
import { getSessionContext, updateSessionContext } from "@/lib/analytics/selenaSession";
// Guide content type for better structure
interface GuideSection {
  heading: string;
  headingEs: string;
  content: string;
  contentEs: string;
}

interface GuideData {
  title: string;
  titleEs: string;
  category: string;
  categoryEs: string;
  readTime: string;
  readTimeEs: string;
  author: string;
  intro: string;
  introEs: string;
  sections: GuideSection[];
}

// Full bilingual guide content - optimized for compliance and clarity
const guideContent: Record<string, GuideData> = {
  "first-time-buyer-guide": {
    title: "First-Time Home Buyer's Complete Guide",
    titleEs: "Guía Completa para Compradores de Primera Vivienda",
    category: "Buying a Home",
    categoryEs: "Comprar una Casa",
    readTime: "12 min read",
    readTimeEs: "12 min de lectura",
    author: "Kasandra Prieto",
    intro: "If you're reading this, you're probably feeling a mix of excitement and uncertainty—and that's completely normal. Buying your first home is a significant step, and it's natural to have questions about the process. This guide is designed to walk you through each stage clearly, so you can move forward with understanding and confidence.",
    introEs: "Si está leyendo esto, probablemente siente una mezcla de emoción e incertidumbre—y eso es completamente normal. Comprar su primera casa es un paso significativo, y es natural tener preguntas sobre el proceso. Esta guía está diseñada para guiarle a través de cada etapa con claridad, para que pueda avanzar con comprensión y confianza.",
    sections: [
      {
        heading: "Step 1: Assess Your Financial Readiness",
        headingEs: "Paso 1: Evalúe Su Preparación Financiera",
        content: "Before browsing listings, it helps to understand your financial starting point.\n\nBegin by reviewing your credit profile. Many conventional loans look for scores around 620 or higher, while FHA loans may allow lower scores. Next, calculate your debt-to-income ratio (DTI)—your total monthly debt payments divided by your gross monthly income. In many cases, lenders look for a DTI below 43%.\n\nYou'll also want to plan for:\n• A down payment (often between 3–20%, depending on the loan type)\n• Closing costs (typically 2–5% of the loan amount)\n• Moving expenses and initial home maintenance\n\nThis step isn't about perfection—it's about awareness.",
        contentEs: "Antes de explorar listados, es útil entender su punto de partida financiero.\n\nComience revisando su perfil crediticio. Muchos préstamos convencionales buscan puntajes de 620 o más, mientras que los préstamos FHA pueden permitir puntajes más bajos. Luego, calcule su relación deuda-ingreso (DTI)—sus pagos mensuales totales de deuda divididos por su ingreso mensual bruto. En muchos casos, los prestamistas buscan un DTI por debajo del 43%.\n\nTambién querrá planificar para:\n• Un pago inicial (generalmente entre 3–20%, dependiendo del tipo de préstamo)\n• Costos de cierre (típicamente 2–5% del monto del préstamo)\n• Gastos de mudanza y mantenimiento inicial del hogar\n\nEste paso no se trata de perfección—se trata de consciencia.",
      },
      {
        heading: "Step 2: Get Pre-Approved for a Mortgage",
        headingEs: "Paso 2: Obtenga Pre-Aprobación para una Hipoteca",
        content: "A mortgage pre-approval helps you understand what price range may make sense and shows sellers you're financially prepared.\n\nDuring pre-approval, a lender reviews your income, assets, debts, and credit history to determine a loan amount. It's a good idea to compare options with two or three lenders to understand rates, terms, and monthly payment expectations.\n\nPre-approvals are usually valid for 60–90 days. Keep in mind: qualifying for a certain amount doesn't mean you should use the full amount. Comfort and long-term stability matter.",
        contentEs: "Una pre-aprobación hipotecaria le ayuda a entender qué rango de precio podría tener sentido y muestra a los vendedores que está financieramente preparado.\n\nDurante la pre-aprobación, un prestamista revisa sus ingresos, activos, deudas e historial crediticio para determinar un monto de préstamo. Es buena idea comparar opciones con dos o tres prestamistas para entender tasas, términos y expectativas de pagos mensuales.\n\nLas pre-aprobaciones generalmente son válidas por 60–90 días. Tenga en cuenta: calificar para cierta cantidad no significa que deba usar el monto completo. La comodidad y la estabilidad a largo plazo importan.",
      },
      {
        heading: "Step 3: Choose the Right Real Estate Professional",
        headingEs: "Paso 3: Elija al Profesional Inmobiliario Adecuado",
        content: "For first-time buyers, having a knowledgeable local professional can make a significant difference.\n\nLook for someone who:\n• Understands your preferred areas and price range\n• Explains each step clearly, without pressure\n• Coordinates with trusted professionals such as lenders, inspectors, and title companies\n• Represents your interests throughout the process\n\nThis is a working relationship built on communication and trust—take the time to choose thoughtfully.",
        contentEs: "Para compradores primerizos, tener un profesional local conocedor puede hacer una diferencia significativa.\n\nBusque a alguien que:\n• Entienda sus áreas preferidas y rango de precio\n• Explique cada paso claramente, sin presión\n• Coordine con profesionales de confianza como prestamistas, inspectores y compañías de títulos\n• Represente sus intereses durante todo el proceso\n\nEsta es una relación de trabajo basada en comunicación y confianza—tómese el tiempo para elegir cuidadosamente.",
      },
      {
        heading: "Step 4: House Hunting with Purpose",
        headingEs: "Paso 4: Búsqueda de Casa con Propósito",
        content: "Before touring homes, create a simple list of:\n• Must-haves (non-negotiables)\n• Nice-to-haves (flexible features)\n\nAs you explore, consider practical factors such as commute times, neighborhood layout, and access to everyday amenities. Visiting homes at different times of day can offer helpful perspective.\n\nTake notes and photos—after several showings, details can blend together. Your goal is not to rush, but to recognize when a home aligns with your priorities.",
        contentEs: "Antes de recorrer casas, cree una lista simple de:\n• Imprescindibles (no negociables)\n• Deseables (características flexibles)\n\nMientras explora, considere factores prácticos como tiempos de viaje, distribución del vecindario y acceso a amenidades cotidianas. Visitar casas en diferentes momentos del día puede ofrecer perspectiva útil.\n\nTome notas y fotos—después de varias visitas, los detalles pueden mezclarse. Su objetivo no es apresurarse, sino reconocer cuando una casa se alinea con sus prioridades.",
      },
      {
        heading: "Step 5: Making an Offer",
        headingEs: "Paso 5: Hacer una Oferta",
        content: "When you're ready to make an offer, several elements come into play:\n• Purchase price\n• Earnest money deposit\n• Contingencies (financing, inspection, appraisal)\n• Proposed closing timeline\n\nIn competitive markets, timing and structure matter. Your agent will help you understand options and submit an offer aligned with current conditions. Until everything is finalized, it's best to stay grounded—real estate transactions involve multiple checkpoints.",
        contentEs: "Cuando esté listo para hacer una oferta, varios elementos entran en juego:\n• Precio de compra\n• Depósito de arras\n• Contingencias (financiamiento, inspección, avalúo)\n• Cronograma de cierre propuesto\n\nEn mercados competitivos, el tiempo y la estructura importan. Su agente le ayudará a entender las opciones y presentar una oferta alineada con las condiciones actuales. Hasta que todo esté finalizado, es mejor mantener los pies en la tierra—las transacciones inmobiliarias tienen múltiples puntos de control.",
      },
      {
        heading: "Step 6: Inspections and Due Diligence",
        headingEs: "Paso 6: Inspecciones y Diligencia Debida",
        content: "After an offer is accepted, scheduling a professional home inspection is an important next step.\n\nThe inspection typically reviews major systems such as:\n• Roof\n• HVAC\n• Plumbing\n• Electrical\n• Foundation\n\nBased on the findings, buyers may request repairs, credits, or other adjustments. In some cases, additional inspections (pest, sewer, radon) may be recommended. This step is about gaining clarity before moving forward.",
        contentEs: "Después de que una oferta sea aceptada, programar una inspección profesional de la casa es un siguiente paso importante.\n\nLa inspección típicamente revisa sistemas principales como:\n• Techo\n• HVAC\n• Plomería\n• Electricidad\n• Cimientos\n\nBasándose en los hallazgos, los compradores pueden solicitar reparaciones, créditos u otros ajustes. En algunos casos, se pueden recomendar inspecciones adicionales (plagas, alcantarillado, radón). Este paso se trata de ganar claridad antes de avanzar.",
      },
      {
        heading: "Step 7: Closing and Beyond",
        headingEs: "Paso 7: Cierre y Más Allá",
        content: "Closing day involves signing documents, confirming funds, and completing the purchase.\n\nYour lender and title company will guide you through each form. Take time to review everything carefully. Once the transaction records, you'll receive the keys to your new home.\n\nAfter closing, focus on the practical next steps—setting up utilities, changing locks, and settling into your space.\n\nWelcome home.",
        contentEs: "El día de cierre involucra firmar documentos, confirmar fondos y completar la compra.\n\nSu prestamista y compañía de títulos le guiarán a través de cada formulario. Tómese el tiempo para revisar todo cuidadosamente. Una vez que la transacción se registre, recibirá las llaves de su nueva casa.\n\nDespués del cierre, enfóquese en los siguientes pasos prácticos—configurar servicios, cambiar cerraduras y acomodarse en su espacio.\n\nBienvenido(a) a casa.",
      },
      {
        heading: "What's Next?",
        headingEs: "¿Qué Sigue?",
        content: "If you're ready to explore options that fit your situation—or if you'd simply like clarity on where to begin—you're welcome to take the next step at your own pace.\n\nThere's no pressure. Just support when you're ready.",
        contentEs: "Si está listo para explorar opciones que se ajusten a su situación—o si simplemente le gustaría claridad sobre por dónde empezar—es bienvenido(a) a dar el siguiente paso a su propio ritmo.\n\nNo hay presión. Solo apoyo cuando esté listo.",
      },
    ],
  },
  "selling-for-top-dollar": {
    title: "Selling Your Home in Arizona: A Clear Path Forward",
    titleEs: "Vender Su Casa en Arizona: Un Camino Claro",
    category: "Selling Your Home",
    categoryEs: "Vender Su Casa",
    readTime: "8 min read",
    readTimeEs: "8 min de lectura",
    author: "Kasandra Prieto",
    intro: "If you're thinking about selling your home, you probably have questions—about timing, pricing, and what to expect. That's completely normal. Selling is a significant decision, and it's okay to feel uncertain. This guide is here to help you understand the process clearly, so you can decide your next step with confidence.",
    introEs: "Si está pensando en vender su casa, probablemente tenga preguntas—sobre el momento, el precio y qué esperar. Eso es completamente normal. Vender es una decisión importante, y está bien sentir incertidumbre. Esta guía está aquí para ayudarle a entender el proceso claramente, para que pueda decidir su próximo paso con confianza.",
    sections: [
      {
        heading: "You're Not Alone in This Decision",
        headingEs: "No Está Solo en Esta Decisión",
        content: "Many homeowners feel overwhelmed when considering a sale. Questions about timing, pricing, and whether it's the right move are common.\n\nThis guide won't tell you what to do. It will give you a clear picture of how the selling process works in Arizona, so you can make an informed choice—whatever direction feels right for you.",
        contentEs: "Muchos propietarios se sienten abrumados al considerar una venta. Las preguntas sobre el momento, el precio y si es la decisión correcta son comunes.\n\nEsta guía no le dirá qué hacer. Le dará una imagen clara de cómo funciona el proceso de venta en Arizona, para que pueda tomar una decisión informada—cualquiera que sea la dirección que sienta correcta para usted.",
      },
      {
        heading: "How Selling Works: Step by Step",
        headingEs: "Cómo Funciona la Venta: Paso a Paso",
        content: "Here's what a typical home sale looks like in Arizona:\n\n1. Understanding Your Home's Value\nA Comparative Market Analysis (CMA) reviews recent sales of similar homes nearby. This gives you a data-informed starting point for pricing.\n\n2. Preparing Your Home\nSimple steps like decluttering, minor repairs, and cleaning can help buyers see your home's potential.\n\n3. Setting a List Price\nYou choose the price based on market data and your goals. I provide information; the decision is yours.\n\n4. Listing and Showings\nYour home goes on the market. Buyers schedule visits. Feedback helps you understand buyer interest.\n\n5. Receiving and Reviewing Offers\nWhen offers arrive, you'll see not just the price, but terms, contingencies, and timelines.\n\n6. Contract to Close\nOnce you accept, the buyer typically has inspections and appraisal. Closing usually happens in 30–45 days in Arizona.",
        contentEs: "Así es como típicamente se ve una venta de casa en Arizona:\n\n1. Entender el Valor de Su Casa\nUn Análisis Comparativo de Mercado (CMA) revisa ventas recientes de casas similares cercanas. Esto le da un punto de partida basado en datos para el precio.\n\n2. Preparar Su Casa\nPasos simples como despejar, reparaciones menores y limpieza pueden ayudar a los compradores a ver el potencial de su casa.\n\n3. Establecer un Precio de Lista\nUsted elige el precio basándose en datos del mercado y sus objetivos. Yo proporciono información; la decisión es suya.\n\n4. Listado y Visitas\nSu casa sale al mercado. Los compradores programan visitas. La retroalimentación le ayuda a entender el interés del comprador.\n\n5. Recibir y Revisar Ofertas\nCuando lleguen ofertas, verá no solo el precio, sino términos, contingencias y cronogramas.\n\n6. Contrato hasta el Cierre\nUna vez que acepte, el comprador típicamente tiene inspecciones y avalúo. El cierre usualmente ocurre en 30–45 días en Arizona.",
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
        heading: "Important Information",
        headingEs: "Información Importante",
        content: "This guide is for general educational purposes only. It is not legal, tax, or financial advice.\n\nFor questions about tax implications, legal matters, or financial planning related to selling, please consult with a qualified attorney, CPA, or financial advisor.\n\nNo promises or guarantees are made regarding sale prices, timelines, or outcomes.",
        contentEs: "Esta guía es solo para propósitos educativos generales. No es asesoría legal, fiscal o financiera.\n\nPara preguntas sobre implicaciones fiscales, asuntos legales o planificación financiera relacionada con la venta, consulte con un abogado calificado, contador o asesor financiero.\n\nNo se hacen promesas ni garantías respecto a precios de venta, cronogramas o resultados.",
      },
      {
        heading: "Your Next Step",
        headingEs: "Su Próximo Paso",
        content: "If you'd like to understand what your home might be worth in today's market, you can request a complimentary home value review.\n\nThis is simply a starting point—information to help you decide, with no obligation attached.",
        contentEs: "Si le gustaría entender cuánto podría valer su casa en el mercado actual, puede solicitar una revisión de valor de vivienda complementaria.\n\nEsto es simplemente un punto de partida—información para ayudarle a decidir, sin ninguna obligación adjunta.",
      },
    ],
  },
  "understanding-home-valuation": {
    title: "Understanding Your Home's Value",
    titleEs: "Entendiendo el Valor de Su Casa",
    category: "Home Valuation",
    categoryEs: "Valoración de Vivienda",
    readTime: "6 min read",
    readTimeEs: "6 min de lectura",
    author: "Kasandra Prieto",
    intro: "Wondering what your home is worth? You're not alone—and it's a smart question to ask, whether you're thinking about selling, refinancing, or simply curious. This guide will help you understand how home valuation works, without any pressure or sales talk.",
    introEs: "¿Se pregunta cuánto vale su casa? No está solo—y es una pregunta inteligente, ya sea que esté pensando en vender, refinanciar, o simplemente tenga curiosidad. Esta guía le ayudará a entender cómo funciona la valoración de viviendas, sin presión ni lenguaje de ventas.",
    sections: [
      {
        heading: "It's Okay to Have Questions",
        headingEs: "Está Bien Tener Preguntas",
        content: "You may have seen different numbers from websites, neighbors, or past conversations—and it can feel confusing.\n\nThis guide is designed to bring clarity. You'll learn how valuations work, what factors matter, and how to take a clear next step when you're ready.",
        contentEs: "Puede haber visto diferentes números de sitios web, vecinos o conversaciones pasadas—y puede sentirse confuso.\n\nEsta guía está diseñada para traer claridad. Aprenderá cómo funcionan las valoraciones, qué factores importan, y cómo dar un siguiente paso claro cuando esté listo.",
      },
      {
        heading: "How Home Valuation Works",
        headingEs: "Cómo Funciona la Valoración",
        content: "A home valuation estimates what your property might sell for in current market conditions.\n\nCommon methods include:\n• Comparative Market Analysis (CMA): A local agent reviews recent sales of similar homes nearby\n• Professional Appraisal: A licensed appraiser provides a formal opinion (often used for lending)\n• Online Estimates: Algorithms use public data to generate a number\n\nEach has a purpose. CMAs offer local insight. Appraisals are formal. Online tools are convenient but limited.",
        contentEs: "Una valoración de vivienda estima por cuánto podría venderse su propiedad en las condiciones actuales del mercado.\n\nMétodos comunes incluyen:\n• Análisis Comparativo de Mercado (CMA): Un agente local revisa ventas recientes de casas similares cercanas\n• Avalúo Profesional: Un tasador licenciado proporciona una opinión formal (a menudo usado para préstamos)\n• Estimaciones en Línea: Algoritmos usan datos públicos para generar un número\n\nCada uno tiene un propósito. Los CMAs ofrecen perspectiva local. Los avalúos son formales. Las herramientas en línea son convenientes pero limitadas.",
      },
      {
        heading: "Key Factors That Affect Value",
        headingEs: "Factores Clave que Afectan el Valor",
        content: "Several factors influence what buyers might pay:\n\n• Location and neighborhood\n• Size, layout, and number of bedrooms/bathrooms\n• Condition of major systems (roof, HVAC, plumbing)\n• Recent updates or needed repairs\n• Current buyer demand and market trends\n\nNo two homes are identical, and values shift over time.",
        contentEs: "Varios factores influyen en lo que los compradores podrían pagar:\n\n• Ubicación y vecindario\n• Tamaño, distribución y número de habitaciones/baños\n• Condición de sistemas principales (techo, HVAC, plomería)\n• Actualizaciones recientes o reparaciones necesarias\n• Demanda actual de compradores y tendencias del mercado\n\nNo hay dos casas idénticas, y los valores cambian con el tiempo.",
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
        content: "If you'd like to know what your home might be worth, you can request a complimentary home value review. No obligation—just information to help you plan.",
        contentEs: "Si le gustaría saber cuánto podría valer su casa, puede solicitar una revisión de valor de vivienda complementaria. Sin obligación—solo información para ayudarle a planificar.",
      },
    ],
  },
  "first-time-buyer-story": {
    title: "From Uncertainty to Keys: A First-Time Buyer's Journey",
    titleEs: "De la Incertidumbre a las Llaves: El Viaje de una Compradora Primeriza",
    category: "Client Stories",
    categoryEs: "Historias de Clientes",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
    author: "Kasandra Prieto",
    intro: "When she first reached out, she wasn't sure if homeownership was within reach. Life had presented challenges, and the process felt overwhelming. This is a story about how taking things one step at a time made a difference.",
    introEs: "Cuando se comunicó por primera vez, no estaba segura de si ser propietaria estaba a su alcance. La vida había presentado desafíos, y el proceso se sentía abrumador. Esta es una historia sobre cómo tomar las cosas un paso a la vez hizo una diferencia.",
    sections: [
      {
        heading: "Where She Started",
        headingEs: "Dónde Comenzó",
        content: "She had been renting for years, watching monthly payments go toward someone else's property. Her credit situation wasn't perfect, and she worried about whether any lender would work with her.\n\nThe real estate process felt intimidating—terminology she didn't fully understand, steps that seemed complicated. She had questions but wasn't always sure how to ask them.",
        contentEs: "Había estado rentando por años, viendo cómo sus pagos mensuales iban hacia la propiedad de alguien más. Su situación crediticia no era perfecta, y le preocupaba si algún prestamista trabajaría con ella.\n\nEl proceso inmobiliario se sentía intimidante—terminología que no entendía completamente, pasos que parecían complicados. Tenía preguntas pero no siempre estaba segura de cómo hacerlas.",
      },
      {
        heading: "The Process",
        headingEs: "El Proceso",
        content: "We started with a conversation—understanding her situation, her concerns, and what she hoped for.\n\nFrom there, we took things step by step. First understanding her budget range, then connecting her with a lender who works with first-time buyers in similar situations. Each part of the process was explained in clear terms, with space for questions.",
        contentEs: "Comenzamos con una conversación—entendiendo su situación, sus preocupaciones y lo que esperaba.\n\nDesde ahí, tomamos las cosas paso a paso. Primero entendiendo su rango de presupuesto, luego conectándola con un prestamista que trabaja con compradores primerizos en situaciones similares. Cada parte del proceso fue explicada en términos claros, con espacio para preguntas.",
      },
      {
        heading: "The Outcome",
        headingEs: "El Resultado",
        content: "A few months later, she held the keys to a home.\n\nIt wasn't the largest property, but it was hers—a place of stability and new beginnings. The process that once felt impossible had become manageable when broken into smaller, understandable steps.\n\nEvery situation is different, but having someone to guide you through the process can make a meaningful difference.",
        contentEs: "Unos meses después, sostenía las llaves de una casa.\n\nNo era la propiedad más grande, pero era suya—un lugar de estabilidad y nuevos comienzos. El proceso que una vez se sintió imposible se volvió manejable cuando se dividió en pasos más pequeños y comprensibles.\n\nCada situación es diferente, pero tener a alguien que le guíe a través del proceso puede hacer una diferencia significativa.",
      },
    ],
  },
  "budget-buyer-story": {
    title: "Finding a Home on a Careful Budget",
    titleEs: "Encontrando un Hogar con un Presupuesto Cuidadoso",
    category: "Client Stories",
    categoryEs: "Historias de Clientes",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
    author: "Kasandra Prieto",
    intro: "A family of four needed more space, but their budget required careful planning. This story is about focusing on what mattered most and finding a home that worked for their situation.",
    introEs: "Una familia de cuatro necesitaba más espacio, pero su presupuesto requería planificación cuidadosa. Esta historia es sobre enfocarse en lo que más importaba y encontrar un hogar que funcionara para su situación.",
    sections: [
      {
        heading: "The Situation",
        headingEs: "La Situación",
        content: "The family had outgrown their rental. The children shared a room, and there wasn't much space for everyday life.\n\nThey knew they wanted to buy, but with one primary income and careful budgeting, every dollar mattered. They wondered if the market had passed them by.",
        contentEs: "La familia había superado su renta. Los niños compartían habitación, y no había mucho espacio para la vida cotidiana.\n\nSabían que querían comprar, pero con un ingreso principal y presupuesto cuidadoso, cada dólar importaba. Se preguntaban si el mercado los había dejado atrás.",
      },
      {
        heading: "The Approach",
        headingEs: "El Enfoque",
        content: "We started by getting clear on priorities—what was essential versus what would be nice to have.\n\nThree bedrooms were necessary; a two-car garage wasn't. We also explored down payment assistance programs that they hadn't known about, and focused the search on areas where their investment could grow over time.",
        contentEs: "Comenzamos dejando claras las prioridades—lo que era esencial versus lo que sería bueno tener.\n\nTres habitaciones eran necesarias; un garaje para dos autos no. También exploramos programas de asistencia para pago inicial que no conocían, y enfocamos la búsqueda en áreas donde su inversión podría crecer con el tiempo.",
      },
      {
        heading: "The Outcome",
        headingEs: "El Resultado",
        content: "They found a three-bedroom home in Marana with a yard and a monthly payment that fit their budget.\n\nFor this family, homeownership became a reality not by stretching beyond their means, but by being strategic about what they needed most.",
        contentEs: "Encontraron una casa de tres habitaciones en Marana con patio y un pago mensual que cabía en su presupuesto.\n\nPara esta familia, la propiedad de vivienda se convirtió en realidad no estirándose más allá de sus medios, sino siendo estratégicos sobre lo que más necesitaban.",
      },
    ],
  },
  "seller-stressful-market-story": {
    title: "Selling on a Timeline: One Seller's Experience",
    titleEs: "Vendiendo con un Cronograma: La Experiencia de un Vendedor",
    category: "Client Stories",
    categoryEs: "Historias de Clientes",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
    author: "Kasandra Prieto",
    intro: "He needed to sell due to a job relocation, but the market had shifted. This is a story about navigating uncertainty with clear communication and realistic expectations.",
    introEs: "Necesitaba vender debido a una reubicación laboral, pero el mercado había cambiado. Esta es una historia sobre navegar la incertidumbre con comunicación clara y expectativas realistas.",
    sections: [
      {
        heading: "The Situation",
        headingEs: "La Situación",
        content: "His company had given him a timeline to relocate. The home he'd lived in for years needed to sell, but market conditions had shifted—interest rates had risen, and buyers were being more selective.\n\nEach week without an offer added uncertainty to an already stressful transition.",
        contentEs: "Su empresa le había dado un cronograma para reubicarse. La casa en la que había vivido por años necesitaba venderse, pero las condiciones del mercado habían cambiado—las tasas de interés habían subido, y los compradores eran más selectivos.\n\nCada semana sin una oferta añadía incertidumbre a una transición ya estresante.",
      },
      {
        heading: "The Approach",
        headingEs: "El Enfoque",
        content: "We priced the home based on current market data—competitive enough to attract serious buyers while being fair to his position.\n\nThroughout the process, he received regular updates: what feedback meant, how we were adjusting our approach, and what to realistically expect. When offers came in, each was evaluated not just for price, but for terms and likelihood to close.",
        contentEs: "Fijamos el precio de la casa basándonos en datos del mercado actual—suficientemente competitivo para atraer compradores serios mientras era justo para su posición.\n\nDurante todo el proceso, recibió actualizaciones regulares: qué significaba la retroalimentación, cómo estábamos ajustando nuestro enfoque, y qué esperar realistamente. Cuando llegaron ofertas, cada una fue evaluada no solo por precio, sino por términos y probabilidad de cerrar.",
      },
      {
        heading: "The Outcome",
        headingEs: "El Resultado",
        content: "The home sold within his timeline, allowing him to start his new position without an unsold property weighing on him.\n\nWhat made the difference wasn't just the sale—it was staying informed throughout the process, understanding the reasoning behind each decision, and feeling supported rather than pressured.",
        contentEs: "La casa se vendió dentro de su cronograma, permitiéndole comenzar su nueva posición sin una propiedad sin vender pesándole.\n\nLo que marcó la diferencia no fue solo la venta—fue mantenerse informado durante todo el proceso, entender el razonamiento detrás de cada decisión, y sentirse apoyado en lugar de presionado.",
      },
    ],
  },
  "spanish-speaking-client-story": {
    title: "Truly Understood: A Spanish-Speaking Client's Experience",
    titleEs: "Verdaderamente Comprendida: La Experiencia de una Cliente Hispanohablante",
    category: "Client Stories",
    categoryEs: "Historias de Clientes",
    readTime: "5 min read",
    readTimeEs: "5 min de lectura",
    author: "Kasandra Prieto",
    intro: "For her, finding an agent who spoke Spanish wasn't just about language—it was about being fully understood. This story is about how removing communication barriers made the process accessible.",
    introEs: "Para ella, encontrar una agente que hablara español no era solo sobre el idioma—era sobre ser completamente comprendida. Esta historia es sobre cómo eliminar barreras de comunicación hizo el proceso accesible.",
    sections: [
      {
        heading: "The Challenge",
        headingEs: "El Desafío",
        content: "She had worked with other agents before, but something always felt incomplete. Important details got confused in translation. Questions went unanswered because she wasn't sure how to phrase them.\n\nThe process felt foreign in more ways than one, and she had stepped back twice before.",
        contentEs: "Había trabajado con otros agentes antes, pero algo siempre se sentía incompleto. Detalles importantes se confundían en la traducción. Preguntas quedaban sin respuesta porque no estaba segura de cómo formularlas.\n\nEl proceso se sentía extranjero en más de una forma, y había retrocedido dos veces antes.",
      },
      {
        heading: "The Difference",
        headingEs: "La Diferencia",
        content: "From our first conversation, we spoke in Spanish.\n\nEvery document was explained. Every step was discussed. When she had concerns, she could express them fully. When advice was needed, she understood the context.\n\nFor the first time, she felt like a partner in the process rather than someone trying to follow along.",
        contentEs: "Desde nuestra primera conversación, hablamos en español.\n\nCada documento fue explicado. Cada paso fue discutido. Cuando tenía preocupaciones, podía expresarlas completamente. Cuando se necesitaba consejo, ella entendía el contexto.\n\nPor primera vez, se sintió como una socia en el proceso en lugar de alguien tratando de seguir el ritmo.",
      },
      {
        heading: "The Outcome",
        headingEs: "El Resultado",
        content: "She closed on a home in South Tucson, near her family and the community she knew.\n\nAt closing, she shared that what made the difference was finally feeling like the process was designed for her too. Being understood—truly understood—changes what feels possible.",
        contentEs: "Cerró una casa en South Tucson, cerca de su familia y la comunidad que conocía.\n\nEn el cierre, compartió que lo que marcó la diferencia fue finalmente sentir que el proceso también estaba diseñado para ella. Ser comprendida—verdaderamente comprendida—cambia lo que se siente posible.",
      },
    ],
  },
  "cash-offer-guide": {
    title: "Cash Offers Explained: Is It Right for You?",
    titleEs: "Ofertas en Efectivo Explicadas: ¿Es Lo Correcto para Usted?",
    category: "Cash Offers",
    categoryEs: "Ofertas en Efectivo",
    readTime: "7 min read",
    readTimeEs: "7 min de lectura",
    author: "Kasandra Prieto",
    intro: "You may have heard about cash offers as a way to sell your home faster and with less hassle. But what does that actually mean—and is it right for you? This guide explains the process clearly, so you can decide with confidence.",
    introEs: "Puede haber escuchado sobre ofertas en efectivo como una forma de vender su casa más rápido y con menos complicaciones. Pero, ¿qué significa eso realmente—y es lo correcto para usted? Esta guía explica el proceso claramente, para que pueda decidir con confianza.",
    sections: [
      {
        heading: "If You're Feeling Overwhelmed",
        headingEs: "Si Se Siente Abrumado",
        content: "Many homeowners explore cash offers during stressful times—job relocations, family changes, or simply needing simplicity. If that's you, know that you're not alone.\n\nThis guide will give you the facts without pressure. Understanding your options is the first step toward feeling in control.",
        contentEs: "Muchos propietarios exploran ofertas en efectivo durante tiempos estresantes—reubicaciones laborales, cambios familiares, o simplemente necesitando simplicidad. Si ese es usted, sepa que no está solo.\n\nEsta guía le dará los hechos sin presión. Entender sus opciones es el primer paso para sentirse en control.",
      },
      {
        heading: "What a Cash Offer Means",
        headingEs: "Qué Significa una Oferta en Efectivo",
        content: "A cash offer means a buyer pays for your home without needing a mortgage. This typically results in:\n\n• Faster closing (often 7–21 days vs. 30–45 days)\n• No financing contingency (less risk of the deal falling through)\n• Often sold as-is (no repairs required)\n\nCash offers come from investors or individuals with available funds. They're one valid option—not the only one.",
        contentEs: "Una oferta en efectivo significa que un comprador paga por su casa sin necesitar una hipoteca. Esto típicamente resulta en:\n\n• Cierre más rápido (a menudo 7–21 días vs. 30–45 días)\n• Sin contingencia de financiamiento (menos riesgo de que el trato falle)\n• A menudo vendido como está (sin reparaciones requeridas)\n\nLas ofertas en efectivo vienen de inversionistas o individuos con fondos disponibles. Son una opción válida—no la única.",
      },
      {
        heading: "How It Works in Arizona",
        headingEs: "Cómo Funciona en Arizona",
        content: "Here's the typical process:\n\n1. You share basic property information\n2. A preliminary offer range is provided\n3. A walkthrough confirms condition\n4. A final offer is presented\n5. If you accept, closing happens at a title company\n\nTimelines are often flexible and can work around your schedule.",
        contentEs: "Así es el proceso típico:\n\n1. Comparte información básica de la propiedad\n2. Se proporciona un rango de oferta preliminar\n3. Un recorrido confirma la condición\n4. Se presenta una oferta final\n5. Si acepta, el cierre ocurre en una compañía de títulos\n\nLos cronogramas a menudo son flexibles y pueden adaptarse a su horario.",
      },
      {
        heading: "When a Cash Offer May Fit",
        headingEs: "Cuándo una Oferta en Efectivo Puede Encajar",
        content: "A cash offer might make sense if:\n\n• You need to sell quickly\n• Your home needs repairs you'd rather not make\n• You want certainty over maximum price\n• You're managing an inherited or estate property\n• You prefer to skip showings and negotiations",
        contentEs: "Una oferta en efectivo podría tener sentido si:\n\n• Necesita vender rápidamente\n• Su casa necesita reparaciones que prefiere no hacer\n• Quiere certeza sobre el precio máximo\n• Está manejando una propiedad heredada o de patrimonio\n• Prefiere evitar visitas y negociaciones",
      },
      {
        heading: "When a Traditional Sale May Be Better",
        headingEs: "Cuándo una Venta Tradicional Puede Ser Mejor",
        content: "Cash offers typically come in lower than open-market sales. If maximizing price is your priority and you have time, a traditional listing may serve you better.\n\nConsider traditional if:\n• Your home is in good, show-ready condition\n• You have flexibility in your timeline\n• Local market conditions favor sellers\n\nThere's no wrong choice—only what fits your situation.",
        contentEs: "Las ofertas en efectivo típicamente son más bajas que las ventas en mercado abierto. Si maximizar el precio es su prioridad y tiene tiempo, un listado tradicional puede servirle mejor.\n\nConsidere tradicional si:\n• Su casa está en buena condición, lista para mostrar\n• Tiene flexibilidad en su cronograma\n• Las condiciones del mercado local favorecen a los vendedores\n\nNo hay elección incorrecta—solo lo que encaja con su situación.",
      },
      {
        heading: "Important Information",
        headingEs: "Información Importante",
        content: "This guide is for general educational purposes only. It is not legal, tax, or financial advice.\n\nFor questions about contracts, tax implications, or legal matters, consult a qualified attorney, CPA, or financial advisor. No guarantees are made regarding offer amounts or outcomes.",
        contentEs: "Esta guía es solo para propósitos educativos generales. No es asesoría legal, fiscal o financiera.\n\nPara preguntas sobre contratos, implicaciones fiscales o asuntos legales, consulte a un abogado calificado, contador o asesor financiero. No se hacen garantías respecto a montos de ofertas o resultados.",
      },
      {
        heading: "Your Next Step",
        headingEs: "Su Próximo Paso",
        content: "If you'd like to explore whether a cash offer makes sense for your situation, you can request a no-obligation review to see what's possible.",
        contentEs: "Si le gustaría explorar si una oferta en efectivo tiene sentido para su situación, puede solicitar una revisión sin compromiso para ver lo que es posible.",
      },
    ],
  },
};

// Improved fallback content for guides that don't have full content yet
const fallbackContent: GuideData = {
  title: "This Guide is Being Prepared",
  titleEs: "Esta Guía Está en Preparación",
  category: "Real Estate",
  categoryEs: "Bienes Raíces",
  readTime: "2 min read",
  readTimeEs: "2 min de lectura",
  author: "Kasandra Prieto",
  intro: "We're working on this guide to give you the clarity you deserve. In the meantime, there are several resources that might help you right now. You're welcome to explore at your own pace—no pressure.",
  introEs: "Estamos trabajando en esta guía para darle la claridad que merece. Mientras tanto, hay varios recursos que podrían ayudarle ahora mismo. Es bienvenido a explorar a su propio ritmo—sin presión.",
  sections: [
    {
      heading: "Explore These Helpful Guides",
      headingEs: "Explore Estas Guías Útiles",
      content: "While this guide is in development, these resources may help:\n\n• First-Time Buyer's Complete Guide — Step-by-step guidance for new buyers\n• Selling Your Home in Arizona — A clear path forward for sellers\n• Understanding Your Home's Value — Learn what influences home value\n• Cash Offers Explained — Understand your options for a faster sale\n\nYou can find all of these in our Guides section.",
      contentEs: "Mientras esta guía está en desarrollo, estos recursos pueden ayudar:\n\n• Guía Completa para Compradores Primerizos — Orientación paso a paso para nuevos compradores\n• Vender Su Casa en Arizona — Un camino claro para vendedores\n• Entender el Valor de Su Casa — Aprenda qué influye en el valor de su hogar\n• Ofertas en Efectivo Explicadas — Entienda sus opciones para una venta más rápida\n\nPuede encontrar todos estos en nuestra sección de Guías.",
    },
    {
      heading: "Need Personalized Guidance?",
      headingEs: "¿Necesita Orientación Personalizada?",
      content: "If you have a specific question about your situation, you can chat with Selena—our digital concierge—anytime. She's here to help you understand your options without any pressure.\n\nWhen you're ready for a deeper conversation, Kasandra is available for a strategy session.",
      contentEs: "Si tiene una pregunta específica sobre su situación, puede chatear con Selena—nuestra concierge digital—en cualquier momento. Ella está aquí para ayudarle a entender sus opciones sin ninguna presión.\n\nCuando esté listo para una conversación más profunda, Kasandra está disponible para una sesión de estrategia.",
    },
  ],
};

const V2GuideDetail = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const { t, language } = useLanguage();
  
  const guide = guideId && guideContent[guideId] ? guideContent[guideId] : fallbackContent;
  const guideTitle = language === 'es' ? guide.titleEs : guide.title;

  // Track scroll depth for analytics
  useGuideScrollTracking({
    guideId: guideId || 'unknown',
    guideTitle,
    enabled: true,
  });

  // Log guide open and track in personalization on mount
  // FM-02: Increment guides_read only when navigating to a NEW guide
  useEffect(() => {
    if (guideId) {
      logEvent('guide_open', {
        guide_id: guideId,
        guide_title: guideTitle,
      });
      markGuideRead(guideId);
      setLastGuideId(guideId);

      // Increment guides_read counter only when the guide changes
      const ctx = getSessionContext();
      const prevGuideId = ctx?.last_guide_id;
      if (prevGuideId !== guideId) {
        updateSessionContext({
          last_guide_id: guideId,
          guides_read: (ctx?.guides_read ?? 0) + 1,
        });
      }
    }
  }, [guideId, guideTitle]);

  // Renders a single media slot — returns null if no content
  const MediaSlotRenderer = ({ slot }: { slot: MediaSlot }) => {
    if (slot.type === 'pull-quote-image') {
      return <GuidePullQuote quote={slot.quote} quoteEs={slot.quoteEs} />;
    }
    if (slot.type === 'video') {
      return <GuideVideo src={slot.src} posterSrc={slot.posterSrc} alt={slot.alt} altEs={slot.altEs} />;
    }
    // image or checklist-image
    return <GuideImage src={slot.src} alt={slot.alt} altEs={slot.altEs} />;
  };

  return (
    <V2Layout>
      {/* Hero Section */}
      <section className="relative bg-cc-navy pt-32 pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cc-navy via-cc-navy-dark to-cc-navy opacity-95" />
        <div className="container mx-auto px-4 relative z-10">
          {/* Top Bar: Back + Language Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/v2/guides"
              className="inline-flex items-center text-white/70 hover:text-cc-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("Back to Guides", "Volver a Guías")}
            </Link>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5">
              <LanguageToggle variant="dark" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-cc-gold/20 text-cc-gold rounded-full text-sm font-medium">
              {t(guide.category, guide.categoryEs)}
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6 leading-tight max-w-4xl">
            {t(guide.title, guide.titleEs)}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {guide.author}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t(guide.readTime, guide.readTimeEs)}
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="bg-cc-sand">
        {/* Intro */}
        <section className="bg-white py-12 border-b border-cc-sand-dark">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-cc-charcoal leading-relaxed">
                {t(guide.intro, guide.introEs)}
              </p>
            </div>
          </div>
        </section>

        {/* Media slots after intro (afterSection === -1) */}
        {(() => {
          const slots = guideId ? GUIDE_MEDIA_SLOTS[guideId] : undefined;
          if (slots && guideId) validateMediaSlots(slots, guideId);
          const introSlots = slots?.filter((s) => s.afterSection === -1) || [];
          return introSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />);
        })()}

        {/* Content Sections with Per-Guide Media Slots */}
        {guide.sections.map((section, index) => {
          const slots = guideId ? GUIDE_MEDIA_SLOTS[guideId] : undefined;
          const sectionSlots = slots?.filter((s) => s.afterSection === index) || [];

          return (
            <div key={index}>
              <section
                className={`py-12 ${index % 2 === 0 ? "bg-cc-sand" : "bg-white"}`}
              >
                <div className="container mx-auto px-4">
                  <div className="max-w-3xl mx-auto">
                    <h2 className="font-serif text-2xl md:text-3xl text-cc-navy mb-6">
                      {t(section.heading, section.headingEs)}
                    </h2>
                    <div className="text-cc-charcoal leading-relaxed text-lg whitespace-pre-line">
                      {t(section.content, section.contentEs)}
                    </div>
                  </div>
                </div>
              </section>
              {sectionSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />)}
            </div>
          );
        })}

        {/* Next Steps Summary */}

        {/* Compliance Footer */}
        <GuideComplianceFooter />

        {/* Authority CTA Block (Decision-Compression) */}
        {(() => {
          const registryEntry = guideId ? getGuideById(guideId) : undefined;
          const safeCategory: GuideCategory = registryEntry?.category ?? 'stories';
          
          return (
            <>
              <AuthorityCTABlock 
                category={safeCategory}
                guideTitle={guideTitle}
                isCashGuide={!!registryEntry?.isCashGuide}
                authorityBridge={registryEntry?.authorityBridge}
                marketInsight={registryEntry?.marketInsight}
              />
              <SelenaGuideHandoff 
                guideId={guideId || 'unknown'}
                category={safeCategory}
              />
            </>
          );
        })()}
      </article>
    </V2Layout>
  );
};

export default V2GuideDetail;
