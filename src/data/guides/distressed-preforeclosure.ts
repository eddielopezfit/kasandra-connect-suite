import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Facing Financial Hardship? Your Options as a Tucson Homeowner',
  titleEs: '¿Enfrentando Dificultades Financieras? Tus Opciones como Propietario en Tucson',
  category: 'Distressed & Pre-Foreclosure',
  categoryEs: 'Propiedades en Dificultad',
  author: 'Kasandra Prieto',
  intro: "If you're behind on mortgage payments — or worried you might fall behind — you're probably not looking for a lecture right now. You need to know what's actually possible, and what to do first. This guide is written plainly, without pressure, and with your best outcome as the goal.",
  introEs: "Si estás atrasado en los pagos de tu hipoteca — o preocupado de que podrías atrasarte — probablemente no estás buscando una clase magistral ahora mismo. Necesitas saber qué es realmente posible, y qué hacer primero. Esta guía está escrita claramente, sin presión, y con tu mejor resultado como objetivo.",
  sections: [
    {
      heading: 'Understanding the Timeline: From Missed Payment to Foreclosure',
      headingEs: 'Entendiendo el Cronograma: Desde el Pago Perdido hasta la Ejecución Hipotecaria',
      content: "Arizona is a non-judicial foreclosure state, which means lenders can foreclose without going through court — but the process still takes time.\n\nHere's a general timeline:\n\n**Day 1–90: Grace period and late fees**\nMost loans have a 15-day grace period before late fees begin. After 30 days, your lender will report the missed payment to credit bureaus. After 90 days of non-payment, most lenders will escalate to pre-foreclosure status.\n\n**Notice of Trustee's Sale (NTS)**\nIn Arizona, after 90+ days of missed payments, lenders typically record a Notice of Trustee's Sale. This is the formal start of the foreclosure clock. Arizona requires a minimum 91-day notice period after the NTS is recorded before the sale can occur.\n\n**Trustee Sale**\nThe home is auctioned to the highest bidder at the courthouse steps. Once sold at trustee sale, redemption rights are limited.\n\n**Your window:** From the NTS recording, you have approximately 91 days minimum to act. That's enough time to pursue a loan modification, short sale, or cash offer — if you start now.\n\nThis guide does not provide legal advice. If you have received a foreclosure notice, consult an Arizona housing attorney or HUD-approved housing counselor immediately.",
      contentEs: "Arizona es un estado de ejecución hipotecaria no judicial, lo que significa que los prestamistas pueden ejecutar hipotecas sin ir a través de los tribunales — pero el proceso aún lleva tiempo.\n\nAquí hay un cronograma general:\n\n**Día 1–90: Período de gracia y cargos por mora**\nLa mayoría de los préstamos tienen un período de gracia de 15 días antes de que comiencen los cargos por mora. Después de 30 días, tu prestamista reportará el pago perdido a las agencias de crédito. Después de 90 días de no pago, la mayoría de los prestamistas escalarán al estado de pre-ejecución hipotecaria.\n\n**Aviso de Venta del Fideicomisario (NTS)**\nEn Arizona, después de 90+ días de pagos perdidos, los prestamistas típicamente registran un Aviso de Venta del Fideicomisario. Este es el inicio formal del reloj de ejecución hipotecaria. Arizona requiere un período mínimo de aviso de 91 días después de que se registra el NTS antes de que pueda ocurrir la venta.",
    },
    {
      heading: "Arizona Foreclosure Timeline: Key Numbers to Know",
      headingEs: "Cronograma de Ejecución Hipotecaria en Arizona: Números Clave que Debes Conocer",
      variant: 'stats-grid' as const,
      content: "Understanding the timeline gives you clarity on how much time you have — and what it costs to wait.",
      contentEs: "Entender el cronograma te da claridad sobre cuánto tiempo tienes — y lo que cuesta esperar.",
      statsData: [
        { value: '90+ days', valueEs: '90+ días', label: 'Arizona minimum foreclosure process — non-judicial, from notice to trustee sale', labelEs: 'Proceso mínimo de ejecución hipotecaria en Arizona — no judicial, desde aviso hasta venta' },
        { value: '30 days', valueEs: '30 días', label: 'Window to respond after Notice of Trustee Sale is recorded', labelEs: 'Ventana para responder después de que se registra el Aviso de Venta del Fideicomisario' },
        { value: '7 years', valueEs: '7 años', label: 'How long a foreclosure stays on your credit report vs. 4 years for short sale', labelEs: 'Cuánto tiempo una ejecución hipotecaria permanece en tu historial crediticio vs. 4 años para venta corta' },
        { value: '$0', valueEs: '$0', label: 'Seller closing costs in many cash offer / short sale scenarios — more equity preserved', labelEs: 'Costos de cierre para el vendedor en muchos escenarios de oferta en efectivo / venta corta' },
      ],
    },
    {
      heading: 'Your Options — From Most to Least Equity-Preserving',
      headingEs: 'Tus Opciones — De Mayor a Menor Preservación de Capital',
      variant: 'path-selector',
      content: "Every situation is different. The right option depends on how much equity you have, your timeline, and what outcome matters most to you.",
      contentEs: "Cada situación es diferente. La opción correcta depende de cuánto capital tienes, tu cronograma y qué resultado te importa más.",
      pathData: [
        {
          id: 'loan-modification',
          title: 'Loan Modification / Forbearance',
          titleEs: 'Modificación de Préstamo / Tolerancia',
          desc: 'Contact your servicer immediately. Many lenders offer forbearance (temporary pause) or modification (permanent restructure). Preserves the home and credit better than any other option.',
          descEs: 'Contacta a tu administrador inmediatamente. Muchos prestamistas ofrecen tolerancia (pausa temporal) o modificación (reestructura permanente). Preserva el hogar y el crédito mejor que cualquier otra opción.',
        },
        {
          id: 'traditional-sale',
          title: 'Traditional Listing Sale',
          titleEs: 'Venta de Listado Tradicional',
          desc: 'If you have equity, a traditional sale pays off the mortgage and returns remaining proceeds to you. Requires time and home preparation but typically yields the highest net.',
          descEs: 'Si tienes capital, una venta tradicional paga la hipoteca y te devuelve las ganancias restantes. Requiere tiempo y preparación de la casa pero típicamente produce el mayor neto.',
        },
        {
          id: 'cash-offer',
          title: 'Cash Sale (As-Is)',
          titleEs: 'Venta en Efectivo (Como Está)',
          desc: 'Fastest path to closing — 10 to 21 days. Sold as-is, no repairs. Works best when speed matters more than maximum price, or when the home needs significant work.',
          descEs: 'El camino más rápido para cerrar — 10 a 21 días. Vendido como está, sin reparaciones. Funciona mejor cuando la velocidad importa más que el precio máximo, o cuando la casa necesita trabajo significativo.',
        },
        {
          id: 'short-sale',
          title: 'Short Sale',
          titleEs: 'Venta Corta',
          desc: 'If the home is worth less than you owe, a short sale lets you sell for current market value with lender approval of the shortfall. Avoids foreclosure. Requires lender cooperation.',
          descEs: 'Si la casa vale menos de lo que debes, una venta corta te permite vender al valor de mercado actual con la aprobación del prestamista para el déficit. Evita la ejecución hipotecaria. Requiere cooperación del prestamista.',
        },
      ],
    },
    {
      heading: 'How to Evaluate a Cash Offer When Time Is Short',
      headingEs: 'Cómo Evaluar una Oferta en Efectivo Cuando el Tiempo Es Corto',
      content: "Cash offers are the fastest exit from a distressed situation — but not all cash buyers are the same. Here's how to evaluate what you're looking at:\n\n**Get a market value baseline first.** Before entertaining any offer, know what your home is worth in today's Tucson market. Tucson's median single-family home is $365,000 (March 2026), but your specific home, condition, and neighborhood matter.\n\n**Compare to a traditional sale net.** A cash offer should be compared to what you'd net after commissions, repair costs, and holding costs on a traditional sale — not just the headline price.\n\n**Watch for these red flags:**\n• Buyer who offers to help with your foreclosure paperwork (conflict of interest)\n• Extremely fast offers with no inspection period (legitimate cash buyers still inspect)\n• Pressure to sign quickly without time to consult an attorney\n• Requests to grant power of attorney or sign paperwork you don't understand\n\n**Your best protection:** Work with a licensed Realtor who has a fiduciary duty to you — not to the buyer. Kasandra can evaluate any offer you're considering against a market value baseline and help you understand what you're actually netting.",
      contentEs: "Las ofertas en efectivo son la salida más rápida de una situación de dificultad — pero no todos los compradores en efectivo son iguales. Así es cómo evaluar lo que estás viendo:\n\n**Obtén primero una línea base del valor de mercado.** Antes de considerar cualquier oferta, conoce cuánto vale tu casa en el mercado actual de Tucson.\n\n**Compara con el neto de una venta tradicional.** Una oferta en efectivo debe compararse con lo que obtendrías después de comisiones, costos de reparación y costos de posesión en una venta tradicional — no solo el precio de titular.\n\n**Presta atención a estas señales de alerta:**\n• Comprador que ofrece ayudar con los trámites de ejecución hipotecaria (conflicto de interés)\n• Ofertas extremadamente rápidas sin período de inspección\n• Presión para firmar rápidamente sin tiempo para consultar un abogado",
    },
    {
      heading: 'Short Sales: What They Are and When They Make Sense',
      headingEs: 'Ventas Cortas: Qué Son y Cuándo Tienen Sentido',
      content: "A short sale occurs when you sell your home for less than the outstanding mortgage balance, with lender approval.\n\nWhen does this make sense?\n• You're underwater on your mortgage (owe more than it's worth)\n• Foreclosure seems unavoidable and you want to minimize credit damage\n• You have a hardship that the lender recognizes (job loss, medical crisis, divorce, death in family)\n\nWhat it requires:\n• Lender approval of both the sale price and the terms\n• Documentation of hardship (income statements, bank statements, hardship letter)\n• Patience — short sales typically take 3–6 months to close\n• A Realtor experienced in short sales to manage lender communications\n\nArizona anti-deficiency law: Arizona's anti-deficiency statutes offer some protection to homeowners. In many situations involving a purchase-money mortgage on a dwelling of 2.5 acres or less, lenders cannot pursue a deficiency judgment after foreclosure or a short sale. This is a complex area of law — consult an Arizona attorney to understand if it applies to your situation.\n\nA short sale is not ideal. But it's almost always better than letting a home go to foreclosure.",
      contentEs: "Una venta corta ocurre cuando vendes tu casa por menos del saldo hipotecario pendiente, con aprobación del prestamista.\n\n¿Cuándo tiene sentido esto?\n• Estás bajo el agua en tu hipoteca (debes más de lo que vale)\n• La ejecución hipotecaria parece inevitable y quieres minimizar el daño al crédito\n• Tienes una dificultad que el prestamista reconoce (pérdida de empleo, crisis médica, divorcio, muerte en la familia)\n\nArizona ley anti-deficiencia: Los estatutos anti-deficiencia de Arizona ofrecen cierta protección a los propietarios. En muchas situaciones que involucran una hipoteca de dinero de compra en una vivienda de 2.5 acres o menos, los prestamistas no pueden perseguir un juicio de deficiencia después de una ejecución hipotecaria o una venta corta. Consulta un abogado de Arizona para entender si aplica a tu situación.",
    },
    {
      heading: '',
      headingEs: '',
      content: '',
      contentEs: '',
      variant: 'tool-bridge' as const,
    },
    {
      heading: 'Free Resources if You Need Immediate Help',
      headingEs: 'Recursos Gratuitos Si Necesitas Ayuda Inmediata',
      content: "You don't have to navigate this alone.\n\n**HUD-Approved Housing Counselors (free):**\nCall 1-800-569-4287 or visit hud.gov to find a HUD-certified counselor near you. They provide free advice on foreclosure prevention, loan modifications, and your rights as a homeowner.\n\n**Arizona Department of Housing (ADOH):**\nAdministers foreclosure prevention programs and emergency mortgage assistance. Visit azhousing.gov.\n\n**Pima County Legal Aid (Tucson):**\n(520) 623-9461 — free legal services for income-eligible homeowners facing foreclosure.\n\n**Consumer Financial Protection Bureau (CFPB):**\nConsumerfinance.gov — resources on mortgage relief, servicer complaints, and rights during hardship.\n\nKasandra is not a legal or financial advisor, but she can help you understand the real estate options available and connect you with the right professionals.",
      contentEs: "No tienes que navegar esto solo.\n\n**Consejeros de Vivienda Aprobados por HUD (gratuito):**\nLlama al 1-800-569-4287 o visita hud.gov para encontrar un consejero certificado por HUD cerca de ti.\n\n**Departamento de Vivienda de Arizona (ADOH):**\nAdministra programas de prevención de ejecución hipotecaria y asistencia hipotecaria de emergencia. Visita azhousing.gov.\n\n**Ayuda Legal del Condado de Pima (Tucson):**\n(520) 623-9461 — servicios legales gratuitos para propietarios con ingresos elegibles que enfrentan ejecución hipotecaria.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "If you're in a difficult situation, the most important thing is to start talking — to your lender, to a housing counselor, or to a Realtor who can help you understand what your home is worth and what options you have.\n\nKasandra handles these conversations with complete confidentiality and no judgment. If you'd like to understand your options without any commitment, Selena can help you get started.",
      contentEs: "Si estás en una situación difícil, lo más importante es comenzar a hablar — con tu prestamista, con un consejero de vivienda, o con un Realtor que pueda ayudarte a entender cuánto vale tu casa y qué opciones tienes.\n\nKasandra maneja estas conversaciones con total confidencialidad y sin juicios. Si deseas entender tus opciones sin ningún compromiso, Selena puede ayudarte a comenzar.",
    },
  {
      heading: "Frequently Asked Questions",
      headingEs: "Preguntas Frecuentes",
      content: "",
      contentEs: "",
      variant: 'faq' as const,
      faqItems: [
        {
          question: "How long does the foreclosure process take in Arizona?",
          questionEs: "¿Cuánto tiempo tarda el proceso de ejecución hipotecaria en Arizona?",
          answer: "Arizona is a non-judicial foreclosure state, which means lenders don't have to go through the courts — the process can move faster than most people expect. Once a Notice of Trustee's Sale is recorded, you typically have 91 days until the auction date. That said, most lenders don't record that notice the moment you miss a payment. There's usually a 90–120 day window of missed payments before that clock starts. If you're behind right now, you likely have more time than you think — but less than you'd want. Call me before you assume it's too late.",
          answerEs: "Arizona es un estado de ejecución hipotecaria no judicial, lo que significa que los prestamistas no tienen que ir a través de los tribunales — el proceso puede moverse más rápido de lo que la mayoría espera. Una vez que se registra un Aviso de Venta del Fideicomisario, generalmente tiene 91 días hasta la fecha de subasta.",
        },
        {
          question: "Can I sell my home to avoid foreclosure in Arizona?",
          questionEs: "¿Puedo vender mi casa para evitar la ejecución hipotecaria en Arizona?",
          answer: "Yes — and this is often the best outcome available when you have equity in the home. Selling before the foreclosure auction lets you pay off the mortgage, protect your credit (a foreclosure stays on your record for 7 years), and potentially walk away with cash in your pocket. Even if you're behind on payments, a quick sale in Tucson's market — where homes are moving in 38 days on average — can often be completed before the Trustee's Sale date. Time is the critical variable. The earlier we start, the more options you have.",
          answerEs: "Sí — y esto es a menudo el mejor resultado disponible cuando tiene capital en la casa. Vender antes de la subasta de ejecución hipotecaria le permite pagar la hipoteca, proteger su crédito (una ejecución hipotecaria permanece en su historial por 7 años), y potencialmente salir con dinero en el bolsillo.",
        },
        {
          question: "What is a short sale and when does it make sense in Arizona?",
          questionEs: "¿Qué es una venta corta y cuándo tiene sentido en Arizona?",
          answer: "A short sale is when you sell the home for less than what you owe on the mortgage, and the lender agrees to accept that lower amount as payment in full — or partial settlement. It requires lender approval, which adds time and paperwork to the process. In Arizona, a short sale is typically better than foreclosure for your credit and your future borrowing ability. But it's not the right fit for everyone — if you have equity, a regular sale is almost always a better path. I can look at your specific situation and tell you honestly which option makes the most sense.",
          answerEs: "Una venta corta es cuando vende la casa por menos de lo que debe en la hipoteca, y el prestamista acepta esa cantidad menor como pago completo — o liquidación parcial. Requiere aprobación del prestamista, lo que agrega tiempo y papeleo al proceso. En Arizona, una venta corta es típicamente mejor que la ejecución hipotecaria para su crédito.",
        },
        {
          question: "Will foreclosure affect my credit score and for how long?",
          questionEs: "¿Afectará la ejecución hipotecaria mi puntaje de crédito y por cuánto tiempo?",
          answer: "A foreclosure stays on your credit report for 7 years and can drop your score by 100–160 points depending on where it starts. The impact is most severe in the first 2–3 years. After foreclosure, most conventional loan programs require a 7-year waiting period before you can buy again — though FHA has a 3-year window and VA loans have a 2-year window in many cases. Avoiding foreclosure through a sale, even a short sale, carries meaningfully shorter credit recovery timelines. This is worth protecting if there's any path to do so.",
          answerEs: "Una ejecución hipotecaria permanece en su informe de crédito por 7 años y puede reducir su puntaje en 100–160 puntos dependiendo de dónde comience. El impacto es más severo en los primeros 2–3 años. Después de una ejecución hipotecaria, la mayoría de los programas de préstamos convencionales requieren un período de espera de 7 años antes de que pueda comprar nuevamente.",
        },
        {
          question: "What resources are available in Tucson if I can't make my mortgage payments?",
          questionEs: "¿Qué recursos están disponibles en Tucson si no puedo hacer mis pagos de hipoteca?",
          answer: "There are real options before it reaches foreclosure. First, contact your lender immediately — forbearance agreements, loan modifications, and repayment plans are all tools lenders would rather use than foreclose. The Arizona Department of Housing's Save Our Home AZ program has historically provided assistance for qualified homeowners facing hardship. HUD-approved housing counseling is available free of charge through several Tucson nonprofits. And if selling is the path that makes the most sense, I can help you move quickly without pressure. You don't have to figure this out alone.",
          answerEs: "Hay opciones reales antes de que llegue a la ejecución hipotecaria. Primero, contacte a su prestamista inmediatamente — los acuerdos de indulgencia, modificaciones de préstamos y planes de pago son herramientas que los prestamistas preferirían usar antes que ejecutar. El programa Save Our Home AZ del Departamento de Vivienda de Arizona ha proporcionado asistencia históricamente.",
        },
      ],
    },
  ],
};

export default data;
