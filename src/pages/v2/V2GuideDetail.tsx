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
import { getGovernedMediaSlots, validateMediaSlots, type MediaSlot } from "@/lib/guides/guideMediaSlots";
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
    readTime: "14 min read",
    readTimeEs: "14 min de lectura",
    author: "Kasandra Prieto",
    intro: "If you're reading this, you're probably feeling a mix of excitement and uncertainty—and that's completely normal. Buying your first home is a significant step, and it's natural to have questions about the process. This guide is designed to walk you through each stage clearly, so you can move forward with understanding and confidence.",
    introEs: "Si está leyendo esto, probablemente siente una mezcla de emoción e incertidumbre—y eso es completamente normal. Comprar su primera casa es un paso significativo, y es natural tener preguntas sobre el proceso. Esta guía está diseñada para guiarle a través de cada etapa con claridad, para que pueda avanzar con comprensión y confianza.",
    sections: [
      {
        heading: "Step 1: Assess Your Financial Readiness",
        headingEs: "Paso 1: Evalúe Su Preparación Financiera",
        content: "Before browsing listings, it helps to understand your financial starting point.\n\nBegin by reviewing your credit profile. Many conventional loans look for scores around 620 or higher, while FHA loans may allow lower scores. Next, calculate your debt-to-income ratio (DTI)—your total monthly debt payments divided by your gross monthly income. In many cases, lenders look for a DTI below 43%.\n\nUnder current Tucson market conditions (as of early 2026), here's the financial landscape for buyers:\n• Median sale price: $315,000–$360,000\n• Average monthly mortgage payment: approximately $2,247\n• Average monthly rent: $1,463\n• 30-year fixed mortgage rate: approximately 6.06%\n\nThat $784/month premium for buying versus renting is real—but Tucson's housing-to-income ratio (23.02%) remains favorable compared to other Western U.S. metros. The long-term equity benefit of ownership often offsets the monthly difference.\n\nYou'll also want to plan for:\n• A down payment (often between 3–20%, depending on the loan type)\n• Closing costs (typically 2–5% of the loan amount)\n• Moving expenses and initial home maintenance\n\nThis step isn't about perfection—it's about awareness.",
        contentEs: "Antes de explorar listados, es útil entender su punto de partida financiero.\n\nComience revisando su perfil crediticio. Muchos préstamos convencionales buscan puntajes de 620 o más, mientras que los préstamos FHA pueden permitir puntajes más bajos. Luego, calcule su relación deuda-ingreso (DTI)—sus pagos mensuales totales de deuda divididos por su ingreso mensual bruto. En muchos casos, los prestamistas buscan un DTI por debajo del 43%.\n\nBajo las condiciones actuales del mercado de Tucson (a principios de 2026), este es el panorama financiero para compradores:\n• Precio medio de venta: $315,000–$360,000\n• Pago mensual promedio de hipoteca: aproximadamente $2,247\n• Renta mensual promedio: $1,463\n• Tasa hipotecaria fija a 30 años: aproximadamente 6.06%\n\nEsa prima de $784/mes por comprar versus rentar es real—pero la relación vivienda-ingreso de Tucson (23.02%) sigue siendo favorable comparada con otras áreas metropolitanas del oeste de EE.UU. El beneficio de equidad a largo plazo de la propiedad a menudo compensa la diferencia mensual.\n\nTambién querrá planificar para:\n• Un pago inicial (generalmente entre 3–20%, dependiendo del tipo de préstamo)\n• Costos de cierre (típicamente 2–5% del monto del préstamo)\n• Gastos de mudanza y mantenimiento inicial del hogar\n\nEste paso no se trata de perfección—se trata de consciencia.",
      },
      {
        heading: "Down Payment Assistance Programs in Tucson",
        headingEs: "Programas de Asistencia para Pago Inicial en Tucson",
        content: "One of the most common barriers for first-time buyers is the down payment. What many people don't realize is that Pima County and the City of Tucson offer several programs designed specifically to help.\n\nUnder current program guidelines (as of early 2026):\n\n• Pima County/Tucson HOME Program: Provides up to 20% of the purchase price toward down payment and closing costs. Eligibility: household income up to $76,900 (family of 4). Maximum purchase price: $385,225.\n\n• Tucson Welcome Home Program: Offers 100% financing—meaning zero down payment required. Income limit: up to $126,280.\n\n• PTHS (Pima Tucson Homebuyer Solution): Provides down payment assistance that is forgiven after three years of occupancy—meaning you don't pay it back if you stay in the home.\n\nMost programs require a minimum credit score of 620–640. Your lender or a HUD-approved housing counselor can confirm which programs you qualify for.\n\nThese programs exist because homeownership builds long-term stability—and Tucson's community has invested in making that accessible.",
        contentEs: "Una de las barreras más comunes para compradores primerizos es el pago inicial. Lo que muchas personas no saben es que el Condado de Pima y la Ciudad de Tucson ofrecen varios programas diseñados específicamente para ayudar.\n\nBajo las directrices actuales del programa (a principios de 2026):\n\n• Programa HOME del Condado de Pima/Tucson: Proporciona hasta el 20% del precio de compra para pago inicial y costos de cierre. Elegibilidad: ingreso familiar hasta $76,900 (familia de 4). Precio máximo de compra: $385,225.\n\n• Programa Tucson Welcome Home: Ofrece financiamiento del 100%—lo que significa cero pago inicial requerido. Límite de ingreso: hasta $126,280.\n\n• PTHS (Solución de Comprador de Vivienda Pima Tucson): Proporciona asistencia para pago inicial que se condona después de tres años de ocupación—lo que significa que no lo devuelve si permanece en la casa.\n\nLa mayoría de los programas requieren un puntaje de crédito mínimo de 620–640. Su prestamista o un consejero de vivienda aprobado por HUD puede confirmar para cuáles programas califica.\n\nEstos programas existen porque la propiedad de vivienda construye estabilidad a largo plazo—y la comunidad de Tucson ha invertido en hacerla accesible.",
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
    readTime: "10 min read",
    readTimeEs: "10 min de lectura",
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
        heading: "What Does the Tucson Market Look Like?",
        headingEs: "¿Cómo Luce el Mercado de Tucson?",
        content: "Under current market conditions (as of early 2026), here's what sellers in Pima County can expect:\n\n• Median Sale Price: $315,000–$360,000\n• Average Days on Market: 40–78 days\n• Sale-to-List Price Ratio: Approximately 97.65%—meaning homes are selling close to their asking price\n• Active Listings: Approximately 4,600 in the Pima County MLS\n\nThese numbers provide grounding, not a guarantee. Every home and neighborhood is different, and market conditions shift. A Comparative Market Analysis (CMA) specific to your property gives the clearest picture.",
        contentEs: "Bajo las condiciones actuales del mercado (a principios de 2026), esto es lo que los vendedores en el Condado de Pima pueden esperar:\n\n• Precio Medio de Venta: $315,000–$360,000\n• Días Promedio en el Mercado: 40–78 días\n• Relación Precio de Venta a Precio de Lista: Aproximadamente 97.65%—lo que significa que las casas se están vendiendo cerca de su precio de lista\n• Listados Activos: Aproximadamente 4,600 en el MLS del Condado de Pima\n\nEstos números proporcionan base, no una garantía. Cada casa y vecindario es diferente, y las condiciones del mercado cambian. Un Análisis Comparativo de Mercado (CMA) específico para su propiedad da la imagen más clara.",
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
    readTime: "7 min read",
    readTimeEs: "7 min de lectura",
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
        heading: "How Does Home Valuation Work?",
        headingEs: "¿Cómo Funciona la Valoración de Viviendas?",
        content: "A home valuation estimates what your property might sell for in current market conditions.\n\nCommon methods include:\n• Comparative Market Analysis (CMA): A local agent reviews recent sales of similar homes nearby. Under current Tucson conditions (as of early 2026), homes are selling at approximately 97.65% of their list price, which means well-prepared CMAs are landing close to actual sale outcomes.\n• Professional Appraisal: A licensed appraiser provides a formal opinion (often used for lending)\n• Online Estimates: Algorithms use public data to generate a number\n\nEach has a purpose. CMAs offer local insight. Appraisals are formal. Online tools are convenient but limited—they cannot see inside your home or account for condition, updates, or neighborhood nuance.",
        contentEs: "Una valoración de vivienda estima por cuánto podría venderse su propiedad en las condiciones actuales del mercado.\n\nMétodos comunes incluyen:\n• Análisis Comparativo de Mercado (CMA): Un agente local revisa ventas recientes de casas similares cercanas. Bajo las condiciones actuales de Tucson (a principios de 2026), las casas se están vendiendo a aproximadamente el 97.65% de su precio de lista, lo que significa que los CMAs bien preparados están aterrizando cerca de los resultados reales de venta.\n• Avalúo Profesional: Un tasador licenciado proporciona una opinión formal (a menudo usado para préstamos)\n• Estimaciones en Línea: Algoritmos usan datos públicos para generar un número\n\nCada uno tiene un propósito. Los CMAs ofrecen perspectiva local. Los avalúos son formales. Las herramientas en línea son convenientes pero limitadas—no pueden ver el interior de su casa ni considerar condición, actualizaciones, o matices del vecindario.",
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
    readTime: "9 min read",
    readTimeEs: "9 min de lectura",
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
        heading: "What Does a Cash Offer Actually Mean?",
        headingEs: "¿Qué Significa Realmente una Oferta en Efectivo?",
        content: "A cash offer means a buyer pays for your home without needing a mortgage. Under current Tucson market conditions (as of early 2026), this typically means:\n\n• Faster closing: Often 7–14 days, compared to 40–78 days for a traditional sale\n• No financing contingency: Eliminates the risk of a deal falling through due to loan denial\n• Sold as-is: No repairs required before closing\n• Closing costs often covered by the buyer\n\nCash offers come from investors or individuals with available funds. They're one valid option—not the only one.",
        contentEs: "Una oferta en efectivo significa que un comprador paga por su casa sin necesitar una hipoteca. Bajo las condiciones actuales del mercado de Tucson (a principios de 2026), esto típicamente significa:\n\n• Cierre más rápido: A menudo 7–14 días, comparado con 40–78 días para una venta tradicional\n• Sin contingencia de financiamiento: Elimina el riesgo de que el trato falle por denegación de préstamo\n• Vendido como está: Sin reparaciones requeridas antes del cierre\n• Costos de cierre a menudo cubiertos por el comprador\n\nLas ofertas en efectivo vienen de inversionistas o individuos con fondos disponibles. Son una opción válida—no la única.",
      },
      {
        heading: "How Does a Cash Sale Compare to a Traditional Sale?",
        headingEs: "¿Cómo Se Compara una Venta en Efectivo con una Venta Tradicional?",
        content: "Here's a side-by-side comparison based on current Tucson market data:\n\n• Timeline: Cash sales close in 7–14 days. Traditional sales average 40–78 days.\n• Offer Amount: Cash offers typically range from 50%–70% of fair market value. Traditional sales average approximately 97.65% of list price.\n• Repairs: Cash sales are as-is. Traditional sales involve negotiated repairs after inspection.\n• Closing Costs: Cash buyers often cover closing costs. Traditional sellers typically pay 8%–10% (including commission and closing costs).\n• Certainty: Cash offers carry very high certainty (no financing risk). Traditional sales carry moderate risk (financing contingency, appraisal gaps).\n\nWith the Tucson median sale price currently between $315,000 and $360,000, the financial difference between these paths can be substantial. Understanding both options ensures you're making an informed decision.",
        contentEs: "Aquí hay una comparación lado a lado basada en datos actuales del mercado de Tucson:\n\n• Cronograma: Las ventas en efectivo cierran en 7–14 días. Las ventas tradicionales promedian 40–78 días.\n• Monto de Oferta: Las ofertas en efectivo típicamente van del 50%–70% del valor justo de mercado. Las ventas tradicionales promedian aproximadamente el 97.65% del precio de lista.\n• Reparaciones: Las ventas en efectivo son como está. Las ventas tradicionales involucran reparaciones negociadas después de la inspección.\n• Costos de Cierre: Los compradores en efectivo a menudo cubren los costos de cierre. Los vendedores tradicionales típicamente pagan 8%–10% (incluyendo comisión y costos de cierre).\n• Certeza: Las ofertas en efectivo tienen certeza muy alta (sin riesgo de financiamiento). Las ventas tradicionales tienen riesgo moderado (contingencia de financiamiento, brechas de avalúo).\n\nCon el precio medio de venta de Tucson actualmente entre $315,000 y $360,000, la diferencia financiera entre estos caminos puede ser sustancial. Entender ambas opciones asegura que esté tomando una decisión informada.",
      },
      {
        heading: "How It Works in Arizona",
        headingEs: "Cómo Funciona en Arizona",
        content: "Here's the typical process:\n\n1. You share basic property information\n2. A preliminary offer range is provided\n3. A walkthrough confirms condition\n4. A final offer is presented\n5. If you accept, closing happens at a title company\n\nTimelines are often flexible and can work around your schedule.",
        contentEs: "Así es el proceso típico:\n\n1. Comparte información básica de la propiedad\n2. Se proporciona un rango de oferta preliminar\n3. Un recorrido confirma la condición\n4. Se presenta una oferta final\n5. Si acepta, el cierre ocurre en una compañía de títulos\n\nLos cronogramas a menudo son flexibles y pueden adaptarse a su horario.",
      },
      {
        heading: "When a Cash Offer May Fit Your Situation",
        headingEs: "Cuándo una Oferta en Efectivo Puede Encajar con Su Situación",
        content: "A cash offer might make sense if:\n\n• Your timeline is under 30 days (job relocation, family emergency, estate settlement)\n• The property needs major repairs that you'd rather not invest in\n• You want certainty over maximum price\n• You're managing an inherited or estate property with multiple heirs\n• The emotional burden of showings, staging, and negotiations is too high\n• You prefer to skip the uncertainty of buyer financing falling through",
        contentEs: "Una oferta en efectivo podría tener sentido si:\n\n• Su cronograma es menor a 30 días (reubicación laboral, emergencia familiar, liquidación de patrimonio)\n• La propiedad necesita reparaciones mayores en las que prefiere no invertir\n• Quiere certeza sobre el precio máximo\n• Está manejando una propiedad heredada o de patrimonio con múltiples herederos\n• La carga emocional de visitas, preparación y negociaciones es demasiado alta\n• Prefiere evitar la incertidumbre de que el financiamiento del comprador falle",
      },
      {
        heading: "When a Traditional Sale May Be Better",
        headingEs: "Cuándo una Venta Tradicional Puede Ser Mejor",
        content: "Cash offers typically come in lower than open-market sales. If maximizing price is your priority and you have time, a traditional listing may serve you better.\n\nConsider traditional if:\n• Your home is in good, show-ready condition\n• You have 60+ days of flexibility in your timeline\n• You want to capture closer to the ~97.65% sale-to-list ratio that Tucson traditional sales currently average\n• Local market conditions favor sellers (currently ~4,600 active listings in Pima County)\n\nThere's no wrong choice—only what fits your situation.",
        contentEs: "Las ofertas en efectivo típicamente son más bajas que las ventas en mercado abierto. Si maximizar el precio es su prioridad y tiene tiempo, un listado tradicional puede servirle mejor.\n\nConsidere tradicional si:\n• Su casa está en buena condición, lista para mostrar\n• Tiene más de 60 días de flexibilidad en su cronograma\n• Quiere capturar cerca del ~97.65% de relación precio de venta a precio de lista que actualmente promedian las ventas tradicionales en Tucson\n• Las condiciones del mercado local favorecen a los vendedores (actualmente ~4,600 listados activos en el Condado de Pima)\n\nNo hay elección incorrecta—solo lo que encaja con su situación.",
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
  "inherited-probate-property": {
    title: "Inherited Property in Pima County: Understanding Your Options",
    titleEs: "Propiedad Heredada en el Condado de Pima: Entendiendo Sus Opciones",
    category: "Inherited Property",
    categoryEs: "Propiedad Heredada",
    readTime: "12 min read",
    readTimeEs: "12 min de lectura",
    author: "Kasandra Prieto",
    intro: "If you've recently inherited a property—or learned that you may—this is likely not the first thing on your mind. Grief, family dynamics, and legal questions can all arrive at once. This guide is here to help you understand what comes next, clearly and without pressure, so you can make decisions when you're ready.",
    introEs: "Si recientemente heredó una propiedad—o se enteró de que podría hacerlo—esto probablemente no es lo primero en su mente. El duelo, las dinámicas familiares y las preguntas legales pueden llegar todas a la vez. Esta guía está aquí para ayudarle a entender qué viene después, con claridad y sin presión, para que pueda tomar decisiones cuando esté listo(a).",
    sections: [
      {
        heading: "What You're Probably Feeling",
        headingEs: "Lo Que Probablemente Está Sintiendo",
        content: "Inheriting a property is rarely simple. You may be managing grief while also facing unfamiliar legal and financial questions. You might feel pressure from family members, uncertainty about timelines, or confusion about what's expected of you.\n\nAll of that is normal. There is no single right answer—only the answer that fits your situation. This guide will help you see your options clearly.",
        contentEs: "Heredar una propiedad rara vez es simple. Puede estar manejando el duelo mientras también enfrenta preguntas legales y financieras desconocidas. Podría sentir presión de miembros de la familia, incertidumbre sobre los plazos, o confusión sobre lo que se espera de usted.\n\nTodo eso es normal. No hay una sola respuesta correcta—solo la respuesta que se ajusta a su situación. Esta guía le ayudará a ver sus opciones con claridad.",
      },
      {
        heading: "What Matters Most Right Now",
        headingEs: "Lo Que Más Importa Ahora Mismo",
        content: "Before diving into legal steps, take a moment to consider three things:\n\n• What is the property's current condition? Is it occupied, vacant, or in need of repairs?\n• Are there other heirs or beneficiaries involved? Do you all agree on what to do?\n• What is your personal situation? Do you want to keep it, sell it, or transfer it?\n\nThese three questions will shape every decision that follows.",
        contentEs: "Antes de sumergirse en los pasos legales, tómese un momento para considerar tres cosas:\n\n• ¿Cuál es la condición actual de la propiedad? ¿Está ocupada, vacía, o necesita reparaciones?\n• ¿Hay otros herederos o beneficiarios involucrados? ¿Todos están de acuerdo en qué hacer?\n• ¿Cuál es su situación personal? ¿Quiere conservarla, venderla, o transferirla?\n\nEstas tres preguntas darán forma a cada decisión que siga.",
      },
      {
        heading: "How Does Property Transfer Work in Pima County?",
        headingEs: "¿Cómo Funciona la Transferencia de Propiedad en el Condado de Pima?",
        content: "Under current Arizona law (as of early 2026), property inherited in Pima County can transfer through one of four paths, listed from simplest to most complex:\n\n1. Beneficiary Deed (Transfer-on-Death): The simplest path. The deed was recorded during the owner's lifetime and transfers automatically upon death. You record the death certificate—no court involvement required.\n\n2. Living Trust: Property held in a trust passes directly to beneficiaries according to the trust terms, bypassing probate entirely.\n\n3. Joint Ownership with Right of Survivorship: Title transfers automatically to the surviving co-owner upon death.\n\n4. Probate: Required when the owner died without a will, or when the will must be validated by the court.\n   • Informal Probate: 6–9 months, used when there are no disputes.\n   • Formal Probate: 12–24 months, required when heirs disagree or the estate is complex.\n   • Mandatory Creditor Period: Arizona law requires probate to remain open for at least 4 months to allow creditor claims.\n\nAn attorney specializing in estate or probate law is the best resource for understanding which path applies to your situation.",
        contentEs: "Según la ley actual de Arizona (a principios de 2026), la propiedad heredada en el Condado de Pima puede transferirse a través de uno de cuatro caminos, listados del más simple al más complejo:\n\n1. Escritura de Beneficiario (Transferencia al Fallecimiento): El camino más simple. La escritura fue registrada durante la vida del propietario y se transfiere automáticamente al fallecer. Se registra el certificado de defunción—no se requiere intervención judicial.\n\n2. Fideicomiso en Vida: La propiedad en un fideicomiso pasa directamente a los beneficiarios según los términos del fideicomiso, evitando la sucesión por completo.\n\n3. Copropiedad con Derecho de Supervivencia: El título se transfiere automáticamente al copropietario sobreviviente al fallecer.\n\n4. Sucesión (Probate): Requerida cuando el propietario falleció sin testamento, o cuando el testamento debe ser validado por el tribunal.\n   • Sucesión Informal: 6–9 meses, utilizada cuando no hay disputas.\n   • Sucesión Formal: 12–24 meses, requerida cuando los herederos no están de acuerdo o el patrimonio es complejo.\n   • Período Obligatorio de Acreedores: La ley de Arizona requiere que la sucesión permanezca abierta al menos 4 meses para permitir reclamos de acreedores.\n\nUn abogado especializado en leyes de patrimonio o sucesión es el mejor recurso para entender cuál camino aplica a su situación.",
      },
      {
        heading: "Can You Avoid Probate? The Small Estate Affidavit",
        headingEs: "¿Puede Evitar la Sucesión? La Declaración Jurada de Patrimonio Pequeño",
        content: "Per Arizona statute HB 2116 (effective September 2025), the Small Estate Affidavit thresholds have increased significantly:\n\n• Personal Property: Up to $200,000 can be transferred without probate.\n• Real Property: Up to $300,000 can be transferred without probate.\n\nThis is a meaningful change for Pima County residents. With the median home value in Tucson currently between $315,000 and $360,000, many estates that previously required formal probate may now qualify for the simplified affidavit process—saving months of time and thousands in legal fees.\n\nTo use the Small Estate Affidavit, specific conditions must be met (including a waiting period after death). An estate attorney can confirm whether your situation qualifies.",
        contentEs: "Según el estatuto de Arizona HB 2116 (vigente desde septiembre 2025), los umbrales de la Declaración Jurada de Patrimonio Pequeño han aumentado significativamente:\n\n• Bienes Personales: Hasta $200,000 pueden transferirse sin sucesión.\n• Bienes Raíces: Hasta $300,000 pueden transferirse sin sucesión.\n\nEste es un cambio significativo para los residentes del Condado de Pima. Con el valor medio de vivienda en Tucson actualmente entre $315,000 y $360,000, muchos patrimonios que anteriormente requerían sucesión formal ahora pueden calificar para el proceso simplificado de declaración jurada—ahorrando meses de tiempo y miles en honorarios legales.\n\nPara usar la Declaración Jurada de Patrimonio Pequeño, deben cumplirse condiciones específicas (incluyendo un período de espera después del fallecimiento). Un abogado de patrimonios puede confirmar si su situación califica.",
      },
      {
        heading: "Property Assessment and Condition",
        headingEs: "Evaluación y Condición de la Propiedad",
        content: "Understanding the property's current state is essential for making a clear decision.\n\nConsider:\n• Has the home been maintained? Deferred maintenance is common with inherited properties.\n• Are there any liens, unpaid taxes, or outstanding debts attached to the property?\n• Is the home occupied by tenants or family members?\n• What is the current market value in its present condition?\n\nA property assessment helps you understand whether selling, renting, or keeping the property makes financial sense. This doesn't require a commitment—it's simply information to help you decide.",
        contentEs: "Entender el estado actual de la propiedad es esencial para tomar una decisión clara.\n\nConsidere:\n• ¿Se ha mantenido la casa? El mantenimiento diferido es común con propiedades heredadas.\n• ¿Hay gravámenes, impuestos no pagados, o deudas pendientes vinculadas a la propiedad?\n• ¿Está la casa ocupada por inquilinos o miembros de la familia?\n• ¿Cuál es el valor de mercado actual en su condición presente?\n\nUna evaluación de la propiedad le ayuda a entender si vender, rentar, o conservar la propiedad tiene sentido financieramente. Esto no requiere compromiso—es simplemente información para ayudarle a decidir.",
      },
      {
        heading: "Your Options: Keep, Sell, or Transfer",
        headingEs: "Sus Opciones: Conservar, Vender, o Transferir",
        content: "You generally have three paths:\n\nKeep the Property\n• Move in, rent it out, or hold it as an investment\n• Consider ongoing costs: property taxes, insurance, maintenance, HOA fees\n• If multiple heirs are involved, one may buy out the others\n\nSell the Property\n• Selling on the open market typically yields the highest price\n• Cash offers may be faster but often come at a lower price\n• The property can often be sold as-is if repairs are not feasible\n\nTransfer the Property\n• A beneficiary deed or quitclaim deed can transfer ownership to another family member\n• Tax implications vary—consult a CPA or tax advisor\n\nThere is no wrong choice. The best option depends on your timeline, financial situation, and family dynamics.",
        contentEs: "Generalmente tiene tres caminos:\n\nConservar la Propiedad\n• Mudarse, rentarla, o mantenerla como inversión\n• Considere los costos continuos: impuestos de propiedad, seguro, mantenimiento, cuotas HOA\n• Si hay múltiples herederos, uno puede comprar la parte de los otros\n\nVender la Propiedad\n• Vender en el mercado abierto típicamente produce el precio más alto\n• Las ofertas en efectivo pueden ser más rápidas pero generalmente vienen a un precio más bajo\n• La propiedad a menudo puede venderse como está si las reparaciones no son factibles\n\nTransferir la Propiedad\n• Una escritura de beneficiario o escritura de renuncia puede transferir la propiedad a otro miembro de la familia\n• Las implicaciones fiscales varían—consulte a un contador o asesor fiscal\n\nNo hay elección incorrecta. La mejor opción depende de su cronograma, situación financiera, y dinámicas familiares.",
      },
      {
        heading: "Working with Multiple Heirs",
        headingEs: "Trabajando con Múltiples Herederos",
        content: "When multiple family members inherit a property together, decisions require agreement—or at least clear communication.\n\nCommon situations include:\n• All heirs agree to sell and split proceeds\n• One heir wants to keep the property and buy out the others\n• Heirs disagree on what to do\n\nIn cases of disagreement, mediation or legal guidance may be necessary. Under Arizona law, any co-owner can file a partition action—a court-ordered process that can result in the property being sold, even without unanimous agreement. This is a last resort, but it means that the common belief that \"the house can't be sold if heirs disagree\" is not accurate.\n\nAn experienced real estate professional can help facilitate conversations by providing clear market data and options for all parties. The goal is clarity for everyone involved.",
        contentEs: "Cuando múltiples miembros de la familia heredan una propiedad juntos, las decisiones requieren acuerdo—o al menos comunicación clara.\n\nSituaciones comunes incluyen:\n• Todos los herederos acuerdan vender y dividir las ganancias\n• Un heredero quiere conservar la propiedad y comprar la parte de los otros\n• Los herederos no están de acuerdo en qué hacer\n\nEn casos de desacuerdo, la mediación o guía legal puede ser necesaria. Bajo la ley de Arizona, cualquier copropietario puede presentar una acción de partición—un proceso ordenado por el tribunal que puede resultar en la venta de la propiedad, incluso sin acuerdo unánime. Este es un último recurso, pero significa que la creencia común de que \"la casa no puede venderse si los herederos no están de acuerdo\" no es precisa.\n\nUn profesional inmobiliario experimentado puede ayudar a facilitar conversaciones proporcionando datos de mercado claros y opciones para todas las partes. El objetivo es claridad para todos los involucrados.",
      },
      {
        heading: "Do You Owe Taxes on Inherited Property in Arizona?",
        headingEs: "¿Debe Impuestos por Propiedad Heredada en Arizona?",
        content: "This is one of the most common concerns—and for most heirs, the news is reassuring. Under current Arizona statutes (subject to change):\n\n• No State Inheritance or Estate Tax: Arizona does not impose a state-level inheritance tax or estate tax.\n\n• Stepped-Up Basis: This is the most important tax benefit for heirs. The property's tax basis resets to its fair market value (FMV) at the date of death. For example: if the home was originally purchased for $120,000 and is worth $350,000 at the time of death, the new tax basis is $350,000. If you sell for $360,000, the taxable capital gain is only $10,000—not $240,000.\n\n• Arizona Capital Gains Deduction: Arizona offers a 25% deduction on long-term capital gains, resulting in an effective state capital gains rate of approximately 1.875%. Inherited property is automatically treated as long-term, regardless of how long you hold it after inheriting.\n\n• Property Taxes: Arizona reassesses property taxes upon sale, not upon inheritance. Until then, existing rates generally continue.\n\n• Ongoing Costs During Probate: Even during the probate process, someone is responsible for property insurance, utilities, and maintenance.\n\nCommon myth: \"The state takes the house if there's no will.\" In reality, Arizona's intestacy laws distribute property to surviving family members in a defined order—the state does not seize the property.\n\nThese are general principles—your specific situation may differ. A qualified CPA or tax advisor can provide guidance tailored to your circumstances.",
        contentEs: "Esta es una de las preocupaciones más comunes—y para la mayoría de los herederos, las noticias son tranquilizadoras. Según los estatutos actuales de Arizona (sujetos a cambio):\n\n• Sin Impuesto Estatal de Herencia o Patrimonio: Arizona no impone un impuesto estatal de herencia ni de patrimonio.\n\n• Base Incrementada (Stepped-Up Basis): Este es el beneficio fiscal más importante para los herederos. La base fiscal de la propiedad se restablece a su valor justo de mercado (FMV) en la fecha del fallecimiento. Por ejemplo: si la casa fue comprada originalmente por $120,000 y vale $350,000 al momento del fallecimiento, la nueva base fiscal es $350,000. Si vende por $360,000, la ganancia de capital gravable es solo $10,000—no $240,000.\n\n• Deducción de Ganancias de Capital de Arizona: Arizona ofrece una deducción del 25% sobre ganancias de capital a largo plazo, resultando en una tasa efectiva estatal de ganancias de capital de aproximadamente 1.875%. La propiedad heredada se trata automáticamente como a largo plazo, independientemente de cuánto tiempo la posea después de heredarla.\n\n• Impuestos de Propiedad: Arizona reevalúa los impuestos de propiedad al momento de la venta, no al heredar. Hasta entonces, las tasas existentes generalmente continúan.\n\n• Costos Continuos Durante la Sucesión: Incluso durante el proceso de sucesión, alguien es responsable del seguro de propiedad, servicios y mantenimiento.\n\nMito común: \"El estado se queda con la casa si no hay testamento.\" En realidad, las leyes de intestado de Arizona distribuyen la propiedad a los miembros sobrevivientes de la familia en un orden definido—el estado no confisca la propiedad.\n\nEstos son principios generales—su situación específica puede diferir. Un contador o asesor fiscal calificado puede proporcionar orientación adaptada a sus circunstancias.",
      },
      {
        heading: "Important Information",
        headingEs: "Información Importante",
        content: "This guide is for general educational purposes only. It is not legal, tax, or financial advice. For questions about probate proceedings, property transfers, or estate matters, please consult with a qualified attorney. For tax implications, consult a CPA or tax advisor.\n\nNo promises or guarantees are made regarding property values, legal outcomes, or timelines.",
        contentEs: "Esta guía es solo para propósitos educativos generales. No es asesoría legal, fiscal o financiera. Para preguntas sobre procedimientos de sucesión, transferencias de propiedad o asuntos de patrimonio, consulte con un abogado calificado. Para implicaciones fiscales, consulte a un contador o asesor fiscal.\n\nNo se hacen promesas ni garantías respecto a valores de propiedad, resultados legales o cronogramas.",
      },
      {
        heading: "Your Next Step",
        headingEs: "Su Próximo Paso",
        content: "If you've inherited a property and want to understand your options, you're welcome to have a calm, no-pressure conversation about your situation. Whether you're leaning toward keeping, selling, or simply need clarity on what comes next—support is available when you're ready.",
        contentEs: "Si ha heredado una propiedad y desea entender sus opciones, es bienvenido(a) a tener una conversación tranquila, sin presión, sobre su situación. Ya sea que se incline hacia conservar, vender, o simplemente necesite claridad sobre qué viene después—el apoyo está disponible cuando esté listo(a).",
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
          const slots = guideId ? getGovernedMediaSlots(guideId) : [];
          if (slots.length && guideId) validateMediaSlots(slots, guideId);
          const introSlots = slots.filter((s) => s.afterSection === -1);
          return introSlots.map((slot) => <MediaSlotRenderer key={slot.id} slot={slot} />);
        })()}

        {/* Content Sections with Per-Guide Media Slots */}
        {guide.sections.map((section, index) => {
          const slots = guideId ? getGovernedMediaSlots(guideId) : [];
          const sectionSlots = slots.filter((s) => s.afterSection === index);

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
