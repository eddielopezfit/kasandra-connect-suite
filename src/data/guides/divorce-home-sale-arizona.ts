import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Selling a Home During Divorce in Arizona: What You Need to Know',
  titleEs: 'Vender una Casa Durante el Divorcio en Arizona: Lo Que Necesitas Saber',
  category: 'Hardship & Life Change',
  categoryEs: 'Dificultades y Cambios de Vida',
  author: 'Kasandra Prieto',
  intro: "There's no easy way to say this: selling a home during a divorce is hard. The logistics are complex, the emotions are high, and Arizona's community property laws add a layer that most people don't fully understand going in. I've been through this process with clients in Tucson, and the families who navigate it best are the ones who understand what's actually required before they're in the middle of it. Let me give you that picture.",
  introEs: "Vender una casa durante un divorcio es una de las situaciones inmobiliarias más complejas emocional y logísticamente que una persona puede enfrentar. Las leyes de propiedad comunitaria de Arizona agregan otra capa de complejidad que no aplica en la mayoría de los otros estados. Esta guía te da un resumen claro y factual de cómo funciona el proceso — para que puedas tomar decisiones informadas durante un momento ya difícil.",
  sections: [
    {
      heading: 'Arizona Is a Community Property State — What This Means for Your Home',
      headingEs: 'Arizona Es un Estado de Propiedad Comunitaria — Lo Que Esto Significa para Tu Casa',
      content: "Arizona is one of nine community property states in the U.S. Under Arizona law, most property acquired during a marriage is considered jointly owned by both spouses — regardless of whose name is on the deed or who made the mortgage payments.\n\n**What this means for your home:**\n• If the home was purchased during the marriage, both spouses typically have equal ownership\n• Both spouses must generally agree to sell the home (or a court order must authorize the sale)\n• Proceeds from the sale are typically divided 50/50 unless a divorce agreement specifies otherwise\n• A home owned before the marriage (or inherited by one spouse) may be considered separate property — but improvements made during the marriage can complicate this\n\n**What this does NOT mean:**\n• Community property does not automatically mean an equal physical split of assets — a divorce agreement can assign other assets to offset the home's value\n• Whose name is on the mortgage does not necessarily determine ownership rights under Arizona law\n\nThis guide provides general information only. For guidance specific to your situation, consult an Arizona family law attorney.",
      contentEs: "Arizona es uno de los nueve estados de propiedad comunitaria en EE.UU. Bajo la ley de Arizona, la mayoría de los bienes adquiridos durante el matrimonio se consideran de propiedad conjunta de ambos cónyuges — independientemente de cuyo nombre esté en la escritura o quién hizo los pagos de la hipoteca.\n\n**Lo que esto significa para tu casa:**\n• Si la casa se compró durante el matrimonio, ambos cónyuges típicamente tienen propiedad igual\n• Ambos cónyuges generalmente deben acordar vender la casa (o una orden judicial debe autorizar la venta)\n• Las ganancias de la venta típicamente se dividen 50/50 a menos que el acuerdo de divorcio especifique lo contrario\n\n**Lo que NO significa:**\n• La propiedad comunitaria no significa automáticamente una división física igual de activos\n• El nombre en la hipoteca no determina necesariamente los derechos de propiedad bajo la ley de Arizona",
      variant: 'stats-grid' as const,
      statsData: [
        { value: 'Community', valueEs: 'Comunitaria', label: 'Arizona property law — both spouses own marital assets equally', labelEs: 'Ley de propiedad de Arizona — ambos cónyuges poseen activos maritales igualmente' },
        { value: '50/50', valueEs: '50/50', label: 'Default split of home sale proceeds (unless agreement differs)', labelEs: 'División predeterminada de ganancias (a menos que el acuerdo difiera)' },
        { value: 'Both', valueEs: 'Ambos', label: 'Spouses must typically agree to sell', labelEs: 'Cónyuges típicamente deben acordar vender' },
        { value: 'Consult', valueEs: 'Consultar', label: 'Always work with an AZ family law attorney', labelEs: 'Siempre trabajar con un abogado de derecho familiar de AZ' },
      ],
    },
    {
      heading: 'The Three Paths: Sell, Buyout, or Hold',
      headingEs: 'Los Tres Caminos: Vender, Comprar la Parte, o Conservar',
      content: "When a divorcing couple owns a home together, there are generally three paths forward:\n\n**Path 1 — Sell the home and split proceeds**\nThis is the most common resolution. Both spouses agree to list the home, accept an offer, and divide the net proceeds according to the divorce agreement. Key advantages: clean financial break, no ongoing shared obligation, cash for both parties to move forward.\n\nKey complexity: Both spouses must agree on the listing price, the agent, and the sale terms. If agreement can't be reached, the divorce court may appoint a special master to handle the sale or issue a court order authorizing one spouse to proceed.\n\n**Path 2 — One spouse buys out the other**\nOne spouse keeps the home and refinances the mortgage in their name, paying the other spouse their equity share. This requires the remaining spouse to qualify for a mortgage independently — in today's rate environment, this can be challenging. Key consideration: refinancing triggers a new loan at current rates, which may significantly change the monthly payment.\n\n**Path 3 — Both spouses continue to co-own temporarily**\nIn some cases (often when minor children are involved), both spouses agree to defer the sale until a specific event (children finish school, market improves). This is the most complex arrangement and requires detailed co-ownership agreements covering expenses, maintenance, and eventual sale terms.",
      contentEs: "Cuando una pareja en proceso de divorcio posee una casa juntos, generalmente hay tres caminos a seguir:\n\n**Camino 1 — Vender la casa y dividir las ganancias**\nEsta es la resolución más común. Ambos cónyuges acuerdan listar la casa, aceptar una oferta y dividir las ganancias netas según el acuerdo de divorcio.\n\n**Camino 2 — Un cónyuge compra la parte del otro**\nUn cónyuge se queda con la casa y refinancia la hipoteca a su nombre, pagando al otro cónyuge su parte del capital. Esto requiere que el cónyuge restante califique para una hipoteca de forma independiente.\n\n**Camino 3 — Ambos cónyuges continúan co-poseyendo temporalmente**\nEn algunos casos (a menudo cuando hay hijos menores involucrados), ambos cónyuges acuerdan diferir la venta hasta un evento específico.",
    },
    {
      heading: 'Selling When Both Spouses Agree: The Straightforward Path',
      headingEs: 'Vender Cuando Ambos Cónyuges Están de Acuerdo: El Camino Directo',
      content: "When both spouses agree to sell — and can maintain a working communication — the process is similar to any other home sale, with some additional considerations:\n\n**One agent for both, or separate agents?**\nIn most cooperative divorce sales, one listing agent represents the sale (not either individual). This simplifies communication and avoids competing interests. Both spouses sign the listing agreement. Both must approve price reductions and accept offers.\n\n**Keeping emotions out of pricing:**\nThis is where divorce sales can stall. The spouse who doesn't want to sell may resist a realistic list price. The spouse who wants to leave quickly may accept too little. A comparative market analysis from an objective agent provides the anchor that keeps both parties in a data-driven conversation.\n\n**Net proceeds calculation:**\nBefore listing, work with your attorney and agent to calculate expected net proceeds: sale price minus mortgage payoff, agent commission (typically 5–6%), closing costs, and any liens. Understanding what each party will actually receive prevents surprises at closing.\n\n**Tax implications:**\nIf both spouses have lived in the home for at least 2 of the past 5 years, each may be eligible to exclude up to $250,000 in capital gains from the sale. The timing of the divorce relative to the sale can affect this. Consult a tax advisor for your specific situation.",
      contentEs: "Cuando ambos cónyuges están de acuerdo en vender — y pueden mantener una comunicación de trabajo — el proceso es similar a cualquier otra venta de casa, con algunas consideraciones adicionales:\n\n**¿Un agente para ambos, o agentes separados?**\nEn la mayoría de las ventas de divorcio cooperativas, un agente de listado representa la venta (no a ningún individuo). Ambos cónyuges firman el acuerdo de listado. Ambos deben aprobar reducciones de precio y aceptar ofertas.\n\n**Cálculo de ganancias netas:**\nAntes de listar, trabaja con tu abogado y agente para calcular las ganancias netas esperadas: precio de venta menos el pago de la hipoteca, comisión del agente (típicamente 5–6%), costos de cierre y cualquier gravamen.\n\n**Implicaciones fiscales:**\nSi ambos cónyuges han vivido en la casa durante al menos 2 de los últimos 5 años, cada uno puede ser elegible para excluir hasta $250,000 en ganancias de capital de la venta.",
    },
    {
      heading: 'When Spouses Cannot Agree: Court-Ordered Sale',
      headingEs: 'Cuando los Cónyuges No Pueden Estar de Acuerdo: Venta Ordenada por el Tribunal',
      content: "If spouses cannot agree on price, timing, agent selection, or other sale terms, the divorce court has authority to order a sale. This typically involves:\n\n• Court appointing a real estate professional or special master to handle the listing and sale\n• Court setting a listing price based on an independent appraisal\n• Court authorizing one spouse to sign documents if the other is uncooperative\n\nCourt-ordered sales generally take longer and may result in a lower sale price due to the delays and complexity. Working with an attorney to reach agreement before court intervention is almost always in both parties' financial interest.\n\nKasandra has worked with divorcing sellers in situations ranging from fully cooperative to highly contested. Her role in every case is the same: provide objective market data, clear communication, and professional representation for the sale — not for either individual party.",
      contentEs: "Si los cónyuges no pueden ponerse de acuerdo sobre el precio, el tiempo, la selección del agente u otros términos de venta, el tribunal de divorcio tiene autoridad para ordenar una venta. Esto típicamente involucra:\n\n• El tribunal nombrando a un profesional inmobiliario o maestro especial para manejar el listado y la venta\n• El tribunal estableciendo un precio de listado basado en una tasación independiente\n• El tribunal autorizando a un cónyuge a firmar documentos si el otro no coopera",
    },
    {
      heading: 'The Role of a Real Estate Agent in a Divorce Sale',
      headingEs: 'El Rol de un Agente de Bienes Raíces en una Venta por Divorcio',
      content: "An experienced real estate agent in a divorce sale is part transaction manager, part neutral mediator. What to look for and expect:\n\n**Neutrality:** Your agent represents the sale, not either spouse. Both parties should feel the agent is operating in the interest of a successful, fair transaction — not advocating for one side.\n\n**Clear communication protocols:** Establish early how decisions will be made. Will the agent communicate with both spouses separately? Does everything require written approval from both? Who is the primary contact for day-to-day questions?\n\n**Documentation:** In divorce sales, every decision should be documented. A good agent will create a paper trail of price decisions, offer reviews, and approvals.\n\n**Discretion:** Professional conduct means the agent doesn't take sides, doesn't relay one spouse's private communications to the other, and keeps personal dynamics out of the buyer-facing sale process.\n\nKasandra is comfortable with all of these dynamics. She can work with attorneys for both sides, communicate professionally with all parties, and keep the sale moving regardless of the relational complexity.",
      contentEs: "Un agente de bienes raíces experimentado en una venta por divorcio es parte gestor de transacciones, parte mediador neutral.\n\n**Neutralidad:** Tu agente representa la venta, no a ningún cónyuge. Ambas partes deben sentir que el agente opera en el interés de una transacción exitosa y justa.\n\n**Protocolos de comunicación claros:** Establece desde el principio cómo se tomarán las decisiones. ¿El agente se comunicará con ambos cónyuges por separado? ¿Todo requiere aprobación escrita de ambos?\n\n**Discreción:** La conducta profesional significa que el agente no toma partido, no transmite las comunicaciones privadas de un cónyuge al otro, y mantiene la dinámica personal fuera del proceso de venta.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "A home sale during divorce doesn't have to add to the stress of an already difficult situation. With the right team — a family law attorney, a trusted real estate agent, and a tax advisor — the process can move forward efficiently and fairly.\n\nIf you're navigating a divorce sale in the Tucson area and need an agent who understands the dynamics and can work professionally with both parties, Kasandra is available for a confidential, no-pressure conversation.",
      contentEs: "La venta de una casa durante el divorcio no tiene que agregar estrés a una situación ya difícil. Con el equipo correcto — un abogado de derecho familiar, un agente de bienes raíces de confianza y un asesor fiscal — el proceso puede avanzar de manera eficiente y justa.\n\nSi estás navegando una venta por divorcio en el área de Tucson y necesitas un agente que entienda la dinámica y pueda trabajar profesionalmente con ambas partes, Kasandra está disponible para una conversación confidencial y sin presión.",
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
          question: 'Do both spouses have to agree to sell the house in an Arizona divorce?',
          questionEs: '¿Ambos cónyuges tienen que acordar vender la casa en un divorcio de Arizona?',
          answer: "Generally yes — both spouses must agree to list and sell. If one spouse refuses, the other can petition the divorce court to order the sale. Arizona courts have authority to order the sale of community property as part of a divorce decree. This process adds time and expense, which is why reaching agreement is usually in both parties' financial interest.",
          answerEs: 'Generalmente sí — ambos cónyuges deben acordar listar y vender. Si un cónyuge se niega, el otro puede solicitar al tribunal de divorcio que ordene la venta. Los tribunales de Arizona tienen autoridad para ordenar la venta de propiedad comunitaria como parte de un decreto de divorcio.',
        },
        {
          question: 'Who pays the mortgage during the divorce while the house is for sale?',
          questionEs: '¿Quién paga la hipoteca durante el divorcio mientras la casa está en venta?',
          answer: 'This should be addressed in the divorce agreement or a temporary court order. Typically, the spouse living in the home pays the mortgage, or payments are made from a joint account, or contributions are tracked for offset at closing. Missing mortgage payments during a divorce will damage both spouses\' credit — ensure this is addressed in writing immediately.',
          answerEs: 'Esto debe abordarse en el acuerdo de divorcio o una orden judicial temporal. Típicamente, el cónyuge que vive en la casa paga la hipoteca, o los pagos se realizan desde una cuenta conjunta. Los pagos de hipoteca perdidos durante un divorcio dañarán el crédito de ambos cónyuges.',
        },
        {
          question: 'Can I sell the house before the divorce is finalized in Arizona?',
          questionEs: '¿Puedo vender la casa antes de que el divorcio sea finalizado en Arizona?',
          answer: "Yes — you can sell the home before the divorce is finalized, and in many cases this is preferable. Both spouses must agree to the sale and sign the necessary documents. The proceeds are held until the divorce is finalized and the agreement specifies how they'll be divided. Selling before finalization can simplify the divorce by converting a shared illiquid asset (the home) into cash that's easier to divide.",
          answerEs: 'Sí — puedes vender la casa antes de que el divorcio sea finalizado, y en muchos casos esto es preferible. Ambos cónyuges deben acordar la venta y firmar los documentos necesarios. Las ganancias se retienen hasta que el divorcio sea finalizado y el acuerdo especifique cómo se dividirán.',
        },
      ],
    },
  ],
};

export default data;
