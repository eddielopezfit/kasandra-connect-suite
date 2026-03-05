import type { GuideContentData } from './types';

const data: GuideContentData = {
  title: 'Move-Up Buying in Tucson: How to Buy and Sell at the Same Time',
  titleEs: 'Comprar para Avanzar en Tucson: Cómo Comprar y Vender al Mismo Tiempo',
  category: 'Buying a Home',
  categoryEs: 'Comprar una Casa',
  author: 'Kasandra Prieto',
  intro: "You've outgrown your current home — or your situation has changed. Now you need to sell what you have and buy something that fits where you're going. Doing both at once is the most common and most stressful move in residential real estate. This guide breaks it down into a clear decision framework so you can move forward with confidence.",
  introEs: "Has superado tu casa actual — o tu situación ha cambiado. Ahora necesitas vender lo que tienes y comprar algo que se adapte a donde vas. Hacer ambas cosas a la vez es el movimiento más común y más estresante en bienes raíces residenciales. Esta guía lo desglosa en un marco de decisión claro para que puedas avanzar con confianza.",
  sections: [
    {
      heading: 'The Core Dilemma: Sell First or Buy First?',
      headingEs: 'El Dilema Central: ¿Vender Primero o Comprar Primero?',
      variant: 'comparison',
      content: "There is no universally right answer — it depends on your financial position, risk tolerance, and the specific Tucson market conditions at the time you're moving.",
      contentEs: "No hay una respuesta universalmente correcta — depende de tu posición financiera, tolerancia al riesgo y las condiciones específicas del mercado de Tucson en el momento en que te estás mudando.",
      comparisonData: {
        left: {
          label: 'Sell First',
          labelEs: 'Vender Primero',
          items: [
            { bold: 'Know your equity:', boldEs: 'Conoce tu capital:', text: "You know exactly what you have before making an offer.", textEs: "Sabes exactamente lo que tienes antes de hacer una oferta." },
            { bold: 'Stronger offer:', boldEs: 'Oferta más fuerte:', text: "No sale contingency means sellers take you more seriously.", textEs: "Sin contingencia de venta significa que los vendedores te toman más en serio." },
            { bold: 'Risk:', boldEs: 'Riesgo:', text: "You may need temporary housing if you can't find your next home in time.", textEs: "Es posible que necesites vivienda temporal si no puedes encontrar tu próxima casa a tiempo." },
            { bold: 'Best when:', boldEs: 'Mejor cuando:', text: "Your current home is highly marketable and you have flexibility on timing.", textEs: "Tu casa actual es muy comercializable y tienes flexibilidad en el tiempo." },
          ],
        },
        right: {
          label: 'Buy First',
          labelEs: 'Comprar Primero',
          items: [
            { bold: 'No transition gap:', boldEs: 'Sin brecha de transición:', text: "Move directly from old home to new — no storage or hotels.", textEs: "Mudarse directamente de la casa antigua a la nueva — sin almacenamiento ni hoteles." },
            { bold: 'Financial risk:', boldEs: 'Riesgo financiero:', text: "Carrying two mortgages until your current home sells.", textEs: "Cargar dos hipotecas hasta que se venda tu casa actual." },
            { bold: 'Requires reserves:', boldEs: 'Requiere reservas:', text: "Lender must qualify you on both payments simultaneously.", textEs: "El prestamista debe calificarte en ambos pagos simultáneamente." },
            { bold: 'Best when:', boldEs: 'Mejor cuando:', text: "You have strong financial reserves and find a rare target property.", textEs: "Tienes reservas financieras sólidas y encuentras una propiedad objetivo rara." },
          ],
        },
      },
    },
    {
      heading: 'Financing Options That Bridge the Gap',
      headingEs: 'Opciones de Financiamiento Que Cubren la Brecha',
      content: "Several loan products exist specifically to help move-up buyers manage the transition:\n\n**Sale Contingency Offer**\nYour offer to buy is contingent on successfully selling your current home. Accepted by some sellers in a buyer's market. In Tucson's current balanced market (January 2026: 4.92 months supply), contingency offers are more accepted than in 2021–2022. The seller retains the right to continue marketing and may accept another offer with a kick-out clause.\n\n**Bridge Loan**\nA short-term loan (typically 6–12 months) that uses your current home's equity to fund the down payment on the new home. You carry both loans until your current home sells. Rates are typically higher than conventional mortgages. Useful when you've found your target property and can't wait.\n\n**Home Equity Line of Credit (HELOC)**\nIf your current home has significant equity, a HELOC can provide a down payment source for the new purchase. Must be set up before your current home goes under contract (lenders freeze HELOCs on listed properties).\n\n**Lender-Specific Programs**\nSome lenders offer \"buy before you sell\" programs that temporarily guarantee your current home's purchase price, letting you buy the new home first. Ask your lender specifically about these — they vary by institution.",
      contentEs: "Existen varios productos de préstamo específicamente para ayudar a los compradores que avanzan a gestionar la transición:\n\n**Oferta con Contingencia de Venta**\nTu oferta de compra está condicionada a la venta exitosa de tu casa actual. Aceptada por algunos vendedores en un mercado de compradores. En el mercado equilibrado actual de Tucson (enero 2026: 4.92 meses de suministro), las ofertas de contingencia son más aceptadas que en 2021–2022.\n\n**Préstamo Puente**\nUn préstamo a corto plazo (típicamente 6–12 meses) que usa el capital de tu casa actual para financiar el pago inicial de la nueva casa. Llevas ambos préstamos hasta que se venda tu casa actual.\n\n**Línea de Crédito con Garantía Hipotecaria (HELOC)**\nSi tu casa actual tiene capital significativo, un HELOC puede proporcionar una fuente de pago inicial para la nueva compra. Debe configurarse antes de que tu casa actual esté bajo contrato.",
    },
    {
      heading: 'How Much Equity Do You Actually Have?',
      headingEs: '¿Cuánto Capital Tienes Realmente?',
      content: "Before making any move, get a real number — not a Zillow estimate.\n\nTucson's current market (January 2026):\n• Median single-family home: $365,000\n• Average $/sqft: $226\n• Sale-to-list ratio: 97.64%\n• Median days on market: 38 days\n\nYour net equity = Sale price − Mortgage payoff − Selling costs (commissions, Pima County transfer tax prorations, title fees, any concessions)\n\nA realistic estimate of selling costs is 7–9% of the sale price in a typical transaction. On a $350,000 home, that's $24,500–$31,500 in costs before you see a dollar.\n\nKasandra can prepare a Comparative Market Analysis (CMA) on your current home and a net proceeds worksheet — so you know your real equity before you start shopping for your next home. This is the most important first step.",
      contentEs: "Antes de dar cualquier paso, obtén un número real — no una estimación de Zillow.\n\nMercado actual de Tucson (enero 2026):\n• Casa unifamiliar mediana: $365,000\n• Promedio $/pie cuadrado: $226\n• Relación venta-lista: 97.64%\n• Mediana de días en mercado: 38 días\n\nTu capital neto = Precio de venta − Pago de hipoteca − Costos de venta (comisiones, prorrateos de impuestos de transferencia del Condado de Pima, tarifas de título, cualquier concesión)\n\nUna estimación realista de los costos de venta es del 7–9% del precio de venta en una transacción típica.",
    },
    {
      heading: 'Structuring Your Timeline to Reduce Stress',
      headingEs: 'Estructurando Tu Cronograma para Reducir el Estrés',
      content: "The biggest source of move-up stress is timeline mismatch — your current home sells faster or slower than expected, or the new purchase falls through.\n\nHow to plan:\n\n**Build in a rent-back buffer.** When you sell your current home, negotiate a rent-back agreement — you remain in the home as a tenant for 30–60 days post-closing while you close on your new purchase. Buyers in Tucson's current market often accept this.\n\n**Pre-shop before listing.** Before your current home goes on the market, do serious scouting on your next home. Know what neighborhood you're targeting, what your budget allows, and have a lender letter ready so you can move fast when the right home appears.\n\n**Extended escrow on the purchase side.** When you make an offer on your next home, negotiate for a 45–60 day closing window instead of the standard 30 days. This gives your current home time to sell and close.\n\n**Have a backup plan.** Know in advance what you'll do if your current home sells and you haven't found the next one yet. Short-term rental? Extended stay hotel? Family? Having a plan reduces panic when timelines slip.",
      contentEs: "La mayor fuente de estrés al avanzar es el desajuste de cronograma — tu casa actual se vende más rápido o más lento de lo esperado, o la nueva compra fracasa.\n\nCómo planificar:\n\n**Incorpora un período de renta de vuelta.** Cuando vendas tu casa actual, negocia un acuerdo de renta de vuelta — permaneces en la casa como inquilino por 30–60 días después del cierre mientras cierras tu nueva compra.\n\n**Pre-busca antes de listar.** Antes de que tu casa actual salga al mercado, haz un scouting serio de tu próxima casa.\n\n**Cierre extendido en el lado de compra.** Cuando hagas una oferta en tu próxima casa, negocia una ventana de cierre de 45–60 días en lugar de los 30 días estándar.",
    },
    {
      heading: "What's Next",
      headingEs: '¿Qué Sigue?',
      content: "Move-up transactions are manageable when the sequencing is clear. The best place to start is knowing what your current home is worth and what your equity position actually is.\n\nKasandra handles both sides of this transaction and can help you build a realistic timeline from day one. If you'd like to start the conversation, Selena can help you get oriented.",
      contentEs: "Las transacciones de avance son manejables cuando la secuencia es clara. El mejor lugar para comenzar es saber cuánto vale tu casa actual y cuál es realmente tu posición de capital.\n\nKasandra maneja ambos lados de esta transacción y puede ayudarte a construir un cronograma realista desde el primer día.",
    },
  ],
};

export default data;
