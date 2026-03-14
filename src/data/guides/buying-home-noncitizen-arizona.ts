import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: "Buying a Home in Arizona as a Non-Citizen or DACA Recipient",
  titleEs: "Comprar una Casa en Arizona como No Ciudadano o Beneficiario de DACA",
  category: "buying",
  categoryEs: "Comprando",
  author: "Kasandra Prieto",
  intro: "This guide is close to my heart — because this is exactly the kind of situation where people are most likely to assume the answer is no without ever asking the right question. Non-citizens, including DACA recipients, can buy homes in Arizona. The path depends on your immigration status and documentation, but it exists. Let me walk you through what's actually available.",
  introEs: "Esta guía está cerca de mi corazón — porque esta es exactamente la clase de situación donde las personas son más propensas a asumir que la respuesta es no sin nunca hacer la pregunta correcta. Los no ciudadanos, incluidos los beneficiarios de DACA, pueden comprar casas en Arizona. El camino depende de tu estatus migratorio y documentación, pero existe. Déjame guiarte por lo que realmente está disponible.",
  sections: [
    {
      heading: "The Short Answer: Yes, Non-Citizens Can Buy Real Estate in Arizona",
      headingEs: "La Respuesta Corta: Sí, los No Ciudadanos Pueden Comprar Bienes Raíces en Arizona",
      content: "U.S. law does not prohibit non-citizens from purchasing real estate. There is no citizenship or immigration status requirement to own property in Arizona or any other U.S. state.\n\nWhat does vary by immigration status is your access to mortgage financing — not your right to own property. If you're purchasing with cash, immigration status is largely irrelevant to the transaction.\n\nHere's how financing options break down by status:\n\n**Permanent Residents (Green Card holders):** Effectively the same loan access as U.S. citizens. Conventional, FHA, VA (if you served), and USDA loans are all available. Lenders treat green card holders essentially identically to citizens.\n\n**Non-Permanent Residents with Valid Visas:** Conventional and FHA loans are available with the right visa type (H-1B, L-1, O-1, TN, and others). Lenders want to see a valid work authorization, stable employment, and that your visa has enough remaining time to cover the loan (or evidence of likely renewal).\n\n**DACA Recipients:** Eligible for FHA loans as of 2021 HUD rule change. Fannie Mae conventional loans also allow DACA buyers. The path exists — see the DACA section below.\n\n**Undocumented Individuals:** Cash purchase is possible. ITIN loans (Individual Taxpayer Identification Number) exist but require larger down payments and careful lender selection — see below.",
      contentEs: "La ley de EE.UU. no prohíbe a los no ciudadanos comprar bienes raíces. No hay requisito de ciudadanía o estatus migratorio para poseer propiedad en Arizona.\n\nLo que varía según el estatus migratorio es tu acceso al financiamiento hipotecario — no tu derecho a poseer propiedad.\n\n**Residentes Permanentes (Tarjeta Verde):** Efectivamente el mismo acceso a préstamos que los ciudadanos de EE.UU.\n\n**Residentes No Permanentes con Visas Válidas:** Los préstamos convencionales y FHA están disponibles con el tipo de visa correcto (H-1B, L-1, O-1, TN y otros).\n\n**Beneficiarios de DACA:** Elegibles para préstamos FHA a partir del cambio de reglas HUD de 2021.\n\n**Personas Indocumentadas:** La compra en efectivo es posible. También existen préstamos ITIN.",
    },
    {
      heading: "Arizona Non-Citizen Buyer Snapshot",
      headingEs: "Panorama del Comprador No Ciudadano en Arizona",
      content: "",
      contentEs: "",
      variant: 'stats-grid' as const,
      statsData: [
        { value: '0%', valueEs: '0%', label: 'Citizenship required to own property in Arizona', labelEs: 'Ciudadanía requerida para poseer propiedad en Arizona' },
        { value: '3.5%', valueEs: '3.5%', label: 'Minimum down — FHA loan for DACA buyers (580+ score)', labelEs: 'Pago inicial mínimo — FHA para compradores DACA (580+ puntaje)' },
        { value: '15–25%', valueEs: '15–25%', label: 'Typical ITIN loan down payment requirement', labelEs: 'Requisito típico de pago inicial para préstamo ITIN' },
        { value: '$541,287', valueEs: '$541,287', label: 'Pima County FHA loan limit (2026)', labelEs: 'Límite de préstamo FHA en el Condado de Pima (2026)' },
      ],
    },
    {
      heading: "DACA Recipients — What's Available",
      headingEs: "Beneficiarios de DACA — Qué Está Disponible",
      content: "A 2021 HUD policy change opened FHA loans to DACA recipients — reversing the prior exclusion. As of 2026, DACA buyers in Arizona can access:\n\n**FHA Loans:**\n• 3.5% down payment with 580+ credit score\n• Pima County loan limit: $541,287\n• Requires Employment Authorization Document (EAD) as work authorization\n• Must have valid Social Security number\n• Same underwriting standards as any FHA borrower\n\n**Conventional Loans (Fannie Mae):**\n• Fannie Mae's guidelines allow DACA borrowers with valid EAD\n• 3–5% down payment available for first-time buyers\n• 620+ credit score typically required\n• Higher loan limits than FHA\n\n**What lenders will ask for:**\n• Valid EAD card\n• Social Security number\n• 2 years of tax returns\n• Employment verification\n• Standard credit and income documentation\n\n**What DACA status does NOT prevent:**\n• Homeownership\n• Qualifying for most assistance programs (HOME Plus, Pima Tucson Homebuyer's Solution)\n• Building equity and wealth through real estate\n\nI work with lenders in Tucson who have experience with DACA borrowers and understand the documentation process. That connection matters.",
      contentEs: "Un cambio de política HUD en 2021 abrió los préstamos FHA a los beneficiarios de DACA.\n\n**Préstamos FHA:** 3.5% de pago inicial con puntaje de crédito de 580+, límite de préstamo del Condado de Pima: $541,287, requiere Documento de Autorización de Empleo (EAD).\n\n**Préstamos Convencionales (Fannie Mae):** Las pautas de Fannie Mae permiten prestatarios DACA con EAD válida. Pago inicial del 3–5% disponible para compradores primerizos.\n\n**Lo que el estatus DACA NO impide:** Ser propietario de vivienda, calificar para la mayoría de los programas de asistencia, construir capital y riqueza a través de bienes raíces.",
    },
    {
      heading: "ITIN Loans — A Path Without a Social Security Number",
      headingEs: "Préstamos ITIN — Un Camino Sin Número de Seguro Social",
      content: "For buyers who have an Individual Taxpayer Identification Number (ITIN) but not a Social Security number, ITIN loans are a real option — not well-advertised, but available through specific lenders.\n\n**What an ITIN loan requires:**\n• Valid ITIN (obtained by filing taxes with the IRS)\n• At least 2 years of tax returns filed using the ITIN\n• Larger down payment: typically 15–20%\n• Stable employment and income documentation\n• Credit history (may be evaluated differently than traditional credit score)\n\n**Terms:**\n• Interest rates are typically 1–2% higher than conventional loans\n• Loan limits and terms vary by lender\n• 30-year fixed rate is the most common structure\n\n**What to look for in a lender:** Not all lenders offer ITIN loans — you need to specifically find lenders who have this program. In Tucson, several community-focused and credit union lenders work with ITIN borrowers. I can connect you with the right people.\n\n**Important:** ITIN loans are not subprime or predatory — they're a legitimate product that serves buyers who have documented income, pay taxes, and are ready to build equity but don't have a Social Security number.",
      contentEs: "Para compradores que tienen un Número de Identificación de Contribuyente Individual (ITIN) pero no un Número de Seguro Social, los préstamos ITIN son una opción real.\n\n**Lo que requiere un préstamo ITIN:** ITIN válido, al menos 2 años de declaraciones de impuestos presentadas usando el ITIN, pago inicial más grande: típicamente del 15–20%, documentación estable de empleo e ingresos.\n\n**Términos:** Las tasas de interés son típicamente un 1–2% más altas que los préstamos convencionales. Los préstamos ITIN no son préstamos de alto riesgo o depredadores — son un producto legítimo.",
    },
    {
      heading: "Important Considerations and Honest Caveats",
      headingEs: "Consideraciones Importantes y Advertencias Honestas",
      content: "I want to be transparent about a few things:\n\n**Immigration law is not my expertise — real estate is.** If you have questions about how homeownership could interact with your immigration case, a pending application, or your long-term status, please consult an immigration attorney. I can point you toward resources.\n\n**DACA program status is subject to political change.** As of early 2026, DACA remains in place and FHA lending to DACA recipients continues. But DACA's legal status has been challenged in courts and the program's future has been subject to ongoing political debate. I won't pretend that's not a reality.\n\n**The down payment and documentation bar is real.** ITIN loans require more cash at closing than FHA or conventional. If you're working toward homeownership with an ITIN, building that down payment and keeping clean tax filing history is the foundation.\n\n**Equity is equity regardless of status.** Whatever path you use to buy a home in Tucson, the equity you build is yours. Property ownership in Arizona doesn't require citizenship. The wealth-building reality of homeownership is available to you.",
      contentEs: "Quiero ser transparente sobre algunas cosas:\n\n**El derecho de inmigración no es mi área de experiencia — los bienes raíces sí lo son.** Si tienes preguntas sobre cómo la propiedad de vivienda podría interactuar con tu caso de inmigración, consulta a un abogado de inmigración.\n\n**El estatus del programa DACA está sujeto a cambios políticos.** A principios de 2026, DACA sigue vigente y los préstamos FHA a los beneficiarios de DACA continúan.\n\n**El patrimonio es patrimonio independientemente del estatus.** Cualquier camino que uses para comprar una casa en Tucson, el capital que construyes es tuyo.",
    },
,
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
          question: "Can DACA recipients buy a house in Arizona?",
          questionEs: "¿Pueden los beneficiarios de DACA comprar una casa en Arizona?",
          answer: "Yes — and this has been explicitly clarified. As of 2021, HUD confirmed FHA loan eligibility for DACA recipients, and Fannie Mae conventional guidelines also allow DACA borrowers with valid Employment Authorization Documents. Arizona has no state-level restriction on DACA homeownership. DACA buyers in Tucson can access most of the same financing options as other buyers, including down payment assistance programs. I work with lenders who have experience with DACA borrowers and can help you navigate the process.",
          answerEs: "Sí — y esto ha sido explícitamente aclarado. A partir de 2021, HUD confirmó la elegibilidad de préstamos FHA para los beneficiarios de DACA, y las pautas convencionales de Fannie Mae también permiten prestatarios DACA con Documentos de Autorización de Empleo válidos. Los compradores DACA en Tucson pueden acceder a la mayoría de las mismas opciones de financiamiento que otros compradores.",
        },
        {
          question: "Can undocumented immigrants buy a house in the United States?",
          questionEs: "¿Pueden los inmigrantes indocumentados comprar una casa en los Estados Unidos?",
          answer: "U.S. law does not prohibit undocumented individuals from owning real property. A cash purchase has no citizenship or immigration requirement. For financing, ITIN loans — available through specific lenders — provide a mortgage path for buyers with a valid ITIN, documented income via tax returns, and typically a 15–20% down payment. The interest rates are higher than conventional loans, but the loans are legitimate and the equity built is real. I can connect you with lenders who offer ITIN programs in Tucson.",
          answerEs: "La ley de EE.UU. no prohíbe a los individuos indocumentados poseer bienes inmuebles. Una compra en efectivo no tiene requisito de ciudadanía o inmigración. Para el financiamiento, los préstamos ITIN — disponibles a través de prestamistas específicos — proporcionan un camino hipotecario para compradores con un ITIN válido, ingresos documentados a través de declaraciones de impuestos, y típicamente un pago inicial del 15–20%.",
        },
        {
          question: "What documents do I need to buy a house in Arizona as a non-citizen?",
          questionEs: "¿Qué documentos necesito para comprar una casa en Arizona como no ciudadano?",
          answer: "It depends on your status and financing path. Green card holders: green card, standard mortgage docs (tax returns, W-2s, pay stubs, bank statements). Visa holders: valid visa, Employment Authorization Document if applicable, same financial docs. DACA recipients: valid EAD, Social Security number, same financial docs as any FHA or conventional borrower. ITIN borrowers: valid ITIN, 2 years of ITIN-filed tax returns, proof of income, larger down payment funds. Cash buyers: no immigration documentation is required for the property purchase itself, though you'll go through title and escrow as normal.",
          answerEs: "Depende de tu estatus y camino de financiamiento. Titulares de tarjeta verde: tarjeta verde, documentos hipotecarios estándar. Titulares de visa: visa válida, Documento de Autorización de Empleo si aplica. Beneficiarios de DACA: EAD válida, número de Seguro Social, mismos documentos financieros que cualquier prestatario FHA o convencional. Prestatarios ITIN: ITIN válido, 2 años de declaraciones de impuestos presentadas con ITIN, prueba de ingresos, fondos de pago inicial más grandes.",
        },
        {
          question: "Is it safe to buy a home in Arizona as an undocumented person?",
          questionEs: "¿Es seguro comprar una casa en Arizona como persona indocumentada?",
          answer: "This is a personal decision that goes beyond real estate, and I want to be honest about the limits of what I can advise on. What I can tell you from the real estate side: owning property in Arizona doesn't affect immigration status or make you more visible to immigration authorities through the property record itself. Property ownership is a private transaction recorded in public county records, like any homeowner. For questions about the interaction between homeownership and your specific immigration situation, please consult an immigration attorney — that's the right person to advise you on safety and strategy.",
          answerEs: "Esta es una decisión personal que va más allá de los bienes raíces, y quiero ser honesta sobre los límites de lo que puedo aconsejar. Lo que puedo decirte desde el lado inmobiliario: poseer propiedad en Arizona no afecta el estatus migratorio ni te hace más visible para las autoridades de inmigración a través del registro de la propiedad en sí. Para preguntas sobre la interacción entre la propiedad de vivienda y tu situación migratoria específica, consulta a un abogado de inmigración.",
        },
      ],
    },
  ],
};

export default data;
