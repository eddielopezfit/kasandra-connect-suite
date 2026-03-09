/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SELENA ENTRY GREETINGS - Context-Aware First Messages
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Different entry points produce different first sentences, even if the
 * follow-up question is the same. This creates personalized onboarding
 * based on where the user came from.
 * 
 * Priority order for greeting selection:
 * 1. Calculator completion (highest context)
 * 2. Guide handoff
 * 3. Synthesis footer ("Summarize what I've learned")
 * 4. Hero CTA
 * 5. Floating button (default)
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type EntrySource = 
  | 'calculator' 
  | 'guide_handoff'
  | 'guide_exit_ramp'
  | 'guide_mid_cta'
  | 'synthesis' 
  | 'hero'
  | 'hero_returning'
  | 'floating'
  | 'proactive'
  | 'question'
  | 'post_booking'
  | 'quiz_result'
  | 'seller_decision'
  | 'ad_funnel_text_trigger'
  | '404_page'
  | 'post_funnel_unlock'
  | 'pre_unlock'
  | 'buyer_readiness_capture'
  | 'cash_readiness_capture'
  | 'cash_offer_options_hero'
  | 'off_market_capture'
  | 'off_market_registered'
  | 'community_mid_page'
  | 'podcast_page'
  | 'seller_readiness_capture'
  | 'market_intelligence'
  | 'market_intelligence_result'
  | 'neighborhood_compare'
  | 'neighborhood_compare_result'
  | 'buyer_closing_costs'
  | 'seller_timeline';

export interface EntryContext {
  source: EntrySource;
  // Calculator context
  calculatorAdvantage?: 'cash' | 'traditional' | 'consult';
  calculatorDifference?: number;
  // Guide context
  guideId?: string;
  guideTitle?: string;
  guideCategory?: string;
  // Synthesis context
  guidesReadCount?: number;
  // Post-booking context
  intent?: string;
  userName?: string;
  // General
  language: 'en' | 'es';
  // Buyer closing costs
  closingCostData?: {
    purchasePrice: number;
    loanType: string;
    downPaymentPercent: number;
    estimatedLow: number;
    estimatedHigh: number;
    totalCashNeeded: number;
  };
  // Seller Net Calculator
  sellerCalcData?: {
    estimatedValue: number;
    mortgageBalance: number;
    cashNetProceeds: number;
    traditionalNetProceeds: number;
    recommendation: string;
    netDifference: number;
    motivation: string;
    timeline: string;
  };
  // Readiness check
  readinessData?: {
    score: number;
    primaryPriority: string;
    toolType: 'buyer' | 'seller' | 'cash';
  };
  offMarketData?: {
    areas: string[];
    budgetRange: string;
    timeline: string;
    propertyType: string;
  };
  neighborhoodCompareData?: {
    areasCompared: string[];
  };
  marketIntelData?: {
    daysOnMarket: number;
    saleToListRatio: string;
    holdingCostPerDay: number;
    isLive: boolean;
  };
}

interface GreetingResult {
  content: string;
  suggestedReplies: string[];
}

/**
 * Generates context-aware greeting based on entry point
 */
export function generateEntryGreeting(context: EntryContext): GreetingResult {
  const { source, language } = context;

  switch (source) {
    case 'post_booking':
      return generatePostBookingGreeting(context);
    case 'quiz_result':
      return generateQuizResultGreeting(context);
    case 'calculator':
      return generateCalculatorGreeting(context);
    case 'guide_handoff':
      return generateGuideHandoffGreeting(context);
    case 'synthesis':
      return generateSynthesisGreeting(context);
    case 'hero':
      return generateHeroGreeting(language);
    case 'question':
      return generateQuestionGreeting(language, context.intent);
    case 'proactive':
      return generateProactiveGreeting(language);
    case 'cash_offer_options_hero':
      return generateQuestionGreeting(language, 'cash');
    case 'off_market_capture':
    case 'off_market_registered':
      return generateOffMarketGreeting(language, context.offMarketData);
    case 'market_intelligence':
    case 'market_intelligence_result':
      return generateMarketIntelligenceGreeting(language, context.marketIntelData);
    case 'neighborhood_compare':
    case 'neighborhood_compare_result':
      return generateNeighborhoodCompareGreeting(language, context.neighborhoodCompareData);
    case 'buyer_closing_costs':
      return generateBuyerClosingCostsGreeting(language, context.closingCostData);
    case 'seller_timeline':
      return generateSellerTimelineGreeting(context);
    case 'floating':
    default:
      return generateDefaultGreeting(language);
  }
}

/**
 * Post-booking identity reinforcement greeting
 * Seals the decision and positions Kasandra as preparing for the call
 */
function generatePostBookingGreeting(context: EntryContext): GreetingResult {
  const { userName, intent, language } = context;
  const name = userName ? `${userName}, ` : '';
  
  if (language === 'es') {
    return {
      content: `${name}Todo listo. Kasandra revisará personalmente lo que compartiste antes de tu llamada — para que llegues preparado/a, no con dudas.

¿Hay algo sobre lo que quieras tener total claridad antes de hablar con ella?`,
      suggestedReplies: [
        "¿Qué debo preparar para la llamada?",
        "¿Puedo reprogramar si es necesario?",
        "Gracias, Selena",
      ],
    };
  }
  
  // English
  return {
    content: `${name}You're all set. Kasandra will personally review what you shared before your call — so you'll walk in prepared, not scrambling.

Is there one thing you want to be completely clear on before you two talk?`,
    suggestedReplies: [
      "What should I prepare for the call?",
      "Can I reschedule if needed?",
      "Thanks, Selena",
    ],
  };
}

/**
 * Quiz result greeting — acknowledges completed path quiz and routes based on intent
 * intent values: 'buy' | 'sell' | 'cash' | 'explore'
 */
function generateQuizResultGreeting(context: EntryContext): GreetingResult {
  const { intent, language } = context;

  if (language === 'es') {
    if (intent === 'sell') {
      return {
        content: `Completaste tu camino — y parece que vender está en tu mente.\n\nBasado en lo que compartiste, hay dos cosas que te ayudarán a avanzar: entender el valor actual de tu casa y saber qué opciones tienes antes de comprometerte con algo.`,
        suggestedReplies: [
          "Ver mis opciones de venta",
          "Comparar efectivo vs. listado",
          "Hablar con Kasandra",
        ],
      };
    }
    if (intent === 'cash') {
      return {
        content: `Completaste tu camino — y las opciones de oferta en efectivo llamaron tu atención. Vale la pena explorarlo.\n\nDéjame ayudarte a entender qué significa realmente una oferta en efectivo para tu situación específica.`,
        suggestedReplies: [
          "Comparar efectivo vs. listado",
          "Check rápido de preparación para vender",
          "Hablar con Kasandra",
        ],
      };
    }
    if (intent === 'buy') {
      return {
        content: `Completaste tu camino — y estás pensando en comprar. Es un excelente lugar para comenzar.\n\nAquí está lo que normalmente ayuda más en esta etapa: saber dónde estás financieramente y entender el proceso antes de comprometerte con algo.`,
        suggestedReplies: [
          "Tomar la evaluación de preparación",
          "¿Qué debo preparar?",
          "Hablar con Kasandra",
        ],
      };
    }
    // explore / default
    return {
      content: `Completaste tu camino — y está bien que las cosas no estén completamente claras aún. Eso es más normal de lo que piensas.\n\nFiguremos juntos cuál es tu próximo paso más útil.`,
      suggestedReplies: [
        "Ayúdame a encontrar mi camino",
        "Muéstrame mis opciones",
        "Solo explorando por ahora",
      ],
    };
  }

  // English
  if (intent === 'sell') {
    return {
      content: `You've just completed your path — and it looks like selling is on your mind.\n\nBased on what you shared, here are two things that will help you move forward: understanding your home's current value and knowing what options you have before committing to anything.`,
      suggestedReplies: [
        "Get my selling options",
        "Compare cash vs. listing",
        "Talk with Kasandra",
      ],
    };
  }
  if (intent === 'cash') {
    return {
      content: `You've just completed your path — and cash offer options caught your attention. That's worth exploring.\n\nLet me help you understand what a cash offer actually means for your specific situation.`,
      suggestedReplies: [
        "Compare cash vs. listing",
        "Quick seller readiness check",
        "Talk with Kasandra",
      ],
    };
  }
  if (intent === 'buy') {
    return {
      content: `You've just completed your path — and you're thinking about buying. That's a great place to start.\n\nHere's what usually helps most at this stage: knowing where you stand financially and understanding the process before committing to anything.`,
      suggestedReplies: [
        "Take the readiness check",
        "What should I prepare?",
        "Talk with Kasandra",
      ],
    };
  }
  // explore / default
  return {
    content: `You've just completed your path — and it's okay that things aren't fully clear yet. That's more normal than you think.\n\nLet's figure out your most useful next step together.`,
    suggestedReplies: [
      "Help me figure out my path",
      "Show me my options",
      "Just exploring for now",
    ],
  };
}


function generateCalculatorGreeting(context: EntryContext): GreetingResult {
  const { calculatorAdvantage, calculatorDifference, language } = context;
  const diff = calculatorDifference ? `$${calculatorDifference.toLocaleString()}` : '';

  if (language === 'es') {
    let content = 'Veo que completaste el análisis.';
    
    if (calculatorAdvantage === 'cash') {
      content = `Analizaste los números. El camino en efectivo muestra menos costos iniciales y cierre más rápido — si eso es lo correcto depende de lo que más te importa en este momento.`;
    } else if (calculatorAdvantage === 'traditional') {
      content = `Analizaste los números — y hay una diferencia que vale entender. El camino correcto depende de tu cronograma, tu situación y lo que te dé más certeza ahora mismo.`;
    } else {
      content = `Has dado un gran paso al analizar tus números. La diferencia es sutil — lo cual significa que la decisión correcta depende de tu situación.`;
    }

    return {
      content: content + `\n\n¿Te gustaría explorar lo que significa esto para ti?`,
      suggestedReplies: [
        "¿Qué opción es mejor para mí?",
        "Revisar estrategia con Kasandra",
        "Tengo más preguntas",
      ],
    };
  }

  // English
  let content = 'I see you completed the analysis.';
  
  if (calculatorAdvantage === 'cash') {
    content = `You ran the numbers. The cash path shows fewer upfront costs and a faster close — whether that's the right fit depends on what matters most to you right now.`;
  } else if (calculatorAdvantage === 'traditional') {
    content = `You ran the numbers — and there's a gap worth understanding. The right path depends on your timeline, your situation, and what feels most certain to you right now.`;
  } else {
    content = `You've taken a great step by running your numbers. The difference is subtle — which means the right choice depends on your situation.`;
  }

  return {
    content: content + `\n\nWould you like to explore what this means for you?`,
    suggestedReplies: [
      "Which option is better for me?",
      "Review strategy with Kasandra",
      "I have more questions",
    ],
  };
}

/**
 * GUARD: Guide handoff greetings must NEVER include identity statements
 * ("I'm Selena", "Soy Selena"). They are contextual-only mid-conversation injections.
 */
function generateGuideHandoffGreeting(context: EntryContext): GreetingResult {
  const { guideTitle, guideCategory, language } = context;

  if (language === 'es') {
    const title = guideTitle || 'esta guía';
    let content = `Veo que estás leyendo "${title}."`;
    
    if (guideCategory === 'buying') {
      content += ` Es un excelente recurso para compradores. ¿Tienes alguna pregunta específica sobre el proceso de compra?`;
    } else if (guideCategory === 'selling' || guideCategory === 'valuation') {
      content += ` ¿Qué pregunta surgió — o te ayudaría hablar de tu situación específica?`;
    } else {
      content += ` ¿Hay algo específico que te gustaría explorar más?`;
    }

    return {
      content,
      suggestedReplies: [
        "Sí, tengo una pregunta",
        "¿Cuál es mi siguiente paso?",
        "Solo estoy explorando",
      ],
    };
  }

  // English
  const title = guideTitle || 'this guide';
  let content = `I see you're reading "${title}."`;
  
  if (guideCategory === 'buying') {
    content += ` It's a great resource for buyers. Do you have any specific questions about the buying process?`;
  } else if (guideCategory === 'selling' || guideCategory === 'valuation') {
    content += ` What question came up for you — or would it help to talk through your specific situation?`;
  } else {
    content += ` Is there anything specific you'd like to explore further?`;
  }

  return {
    content,
    suggestedReplies: [
      "Yes, I have a question",
      "What's my next step?",
      "Just exploring for now",
    ],
  };
}

function generateSynthesisGreeting(context: EntryContext): GreetingResult {
  const { guidesReadCount = 0, language } = context;

  if (language === 'es') {
    const content = guidesReadCount >= 3
      ? `Has leído ${guidesReadCount} guías — estás construyendo una imagen clara de tus opciones. Déjame resumir los puntos clave que más importan para tu situación.`
      : `Has estado explorando tus opciones. ¿Te gustaría que resuma lo que has aprendido hasta ahora?`;

    return {
      content,
      suggestedReplies: [
        "Sí, resume lo que he aprendido",
        "¿Cuál debería ser mi siguiente paso?",
        "Tengo una pregunta específica",
      ],
    };
  }

  // English
  const content = guidesReadCount >= 3
    ? `You've read ${guidesReadCount} guides — you're building a clear picture of your options. Let me summarize the key points that matter most for your situation.`
    : `You've been exploring your options. Would you like me to summarize what you've learned so far?`;

  return {
    content,
    suggestedReplies: [
      "Yes, summarize what I've learned",
      "What should my next step be?",
      "I have a specific question",
    ],
  };
}

function generateHeroGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Hola — soy Selena, la concierge digital de bienes raíces de Kasandra Prieto en Tucson.\n\nYa sea que estés pensando en comprar, vender, o simplemente entender qué es posible, aquí no hay presión.\n\n¿Qué te trae por aquí hoy?`,
      suggestedReplies: [
        "Estoy pensando en vender",
        "Estoy buscando comprar",
        "Solo estoy explorando",
      ],
    };
  }

  return {
    content: `Hi — I'm Selena, Kasandra Prieto's digital real estate concierge in Tucson.\n\nWhether you're thinking about buying, selling, or just understanding what's possible, there's no pressure here.\n\nWhat brings you here today?`,
    suggestedReplies: [
      "I'm thinking about selling",
      "I'm looking to buy",
      "Just exploring for now",
    ],
  };
}

function generateQuestionGreeting(language: 'en' | 'es', intent?: string): GreetingResult {
  // Cash-review context: user clicked "Request a Review" after seeing cash offer info
  if (intent === 'cash') {
    if (language === 'es') {
      return {
        content: `¿Ya recibiste una oferta en efectivo? Puedo ayudarte a revisarla — buscar señales de alerta, compararla con lo que el mercado podría ofrecer, y asegurar que entiendas lo que estás firmando.\n\nCuéntame tu situación.`,
        suggestedReplies: [
          "Recibí una oferta en efectivo",
          "¿Es justa mi oferta?",
          "¿Qué debo tener en cuenta?",
        ],
      };
    }
    return {
      content: `Already received a cash offer? I can help you read it — check for red flags, compare it to what the market might offer, and make sure you understand what you're signing.\n\nTell me about your situation.`,
      suggestedReplies: [
        "I got a cash offer",
        "Is my offer fair?",
        "What should I watch out for?",
      ],
    };
  }

  if (language === 'es') {
    return {
      content: `Estoy aquí para ayudarte. ¿Qué pregunta tienes en mente?`,
      suggestedReplies: [
        "Ver mis opciones de venta",
        "¿Cómo funciona el proceso?",
        "¿Cuáles son mis opciones?",
      ],
    };
  }

  return {
    content: `I'm here to help. What question do you have in mind?`,
    suggestedReplies: [
      "Get my selling options",
      "How does the process work?",
      "What are my options?",
    ],
  };
}

function generateProactiveGreeting(language: 'en' | 'es'): GreetingResult {
  // Proactive greetings are typically triggered by specific events
  // This is a fallback if no specific context is provided
  if (language === 'es') {
    return {
      content: `Has estado explorando un rato — eso normalmente significa que algo está en tu mente. ¿Cuál es la pregunta que todavía no has hecho?`,
      suggestedReplies: [
        "Sí, tengo una pregunta",
        "¿Cuáles son mis opciones?",
        "Solo estoy mirando",
      ],
    };
  }

  return {
    content: `You've been exploring for a bit — that usually means something is on your mind. What's the question you haven't asked yet?`,
    suggestedReplies: [
      "Yes, I have a question",
      "What are my options?",
      "Just browsing",
    ],
  };
}


function generateOffMarketGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Estás en la lista. Kasandra se comunicará personalmente cuando algo que coincida con tus criterios aparezca — antes de que llegue al mercado.\n\n¿Hay algo sobre el proceso de compra o algún vecindario que te gustaría entender mejor mientras tanto?`,
      suggestedReplies: [
        "Explorar vecindarios de Tucson",
        "¿Cómo funciona el proceso de compra?",
        "Programas para compradores",
      ],
    };
  }
  return {
    content: `You're on the list. Kasandra will personally reach out when something matching your criteria comes up — before it hits the market.\n\nWhile you wait, is there anything about the buying process or Tucson neighborhoods you'd like to understand better?`,
    suggestedReplies: [
      "Explore Tucson neighborhoods",
      "How does the buying process work?",
      "First-Time Buyer Programs",
    ],
  };
}

function generateMarketIntelligenceGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Estás viendo los datos reales del mercado de Tucson — días en el mercado, ratio de venta a precio de lista, y costos de mantenimiento diarios.\n\n¿Quieres entender qué significan estos números para tu situación específica?`,
      suggestedReplies: [
        "¿Es buen momento para vender?",
        "¿Qué significan estos números?",
        "Hablar con Kasandra",
      ],
    };
  }
  return {
    content: `You're looking at live Tucson market data — days on market, sale-to-list ratio, and daily holding costs.\n\nWant to understand what these numbers mean for your specific situation?`,
    suggestedReplies: [
      "Is it a good time to sell?",
      "What do these numbers mean?",
      "Talk with Kasandra",
    ],
  };
}

function generateNeighborhoodCompareGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Estás comparando vecindarios de Tucson — excelente forma de reducir opciones. Kasandra conoce estas comunidades personalmente.\n\n¿Hay algo específico que estés buscando en un vecindario?`,
      suggestedReplies: [
        "¿Qué área es mejor para familias?",
        "Comparar escuelas por zona",
        "Hablar con Kasandra",
      ],
    };
  }
  return {
    content: `You're comparing Tucson neighborhoods — that's a smart way to narrow things down. Kasandra knows these communities personally.\n\nIs there something specific you're looking for in a neighborhood?`,
    suggestedReplies: [
      "Which area is best for families?",
      "Compare schools by area",
      "Talk with Kasandra",
    ],
  };
}

function generateBuyerClosingCostsGreeting(language: 'en' | 'es', closingCostData?: EntryContext['closingCostData']): GreetingResult {
  const cc = closingCostData;
  if (cc && cc.purchasePrice > 0) {
    const fmtNum = (n: number) => `$${Math.round(n).toLocaleString()}`;
    const loanLabel = cc.loanType === 'fha' ? 'FHA' : cc.loanType === 'va' ? 'VA' : cc.loanType === 'cash' ? (language === 'es' ? 'efectivo' : 'cash') : (language === 'es' ? 'convencional' : 'conventional');
    
    if (language === 'es') {
      return {
        content: `Estás viendo ${fmtNum(cc.estimatedLow)}–${fmtNum(cc.estimatedHigh)} en costos de cierre para una compra ${loanLabel} de ${fmtNum(cc.purchasePrice)} — más tu enganche, eso es aproximadamente ${fmtNum(cc.totalCashNeeded)} total al cierre.\n\nLa buena noticia: algunos de estos rubros son negociables. Kasandra ha reducido estos costos en transacciones recientes en Tucson.`,
        suggestedReplies: [
          "¿Qué es negociable?",
          "¿Cómo reduzco estos costos?",
          "Hablar con Kasandra",
        ],
      };
    }
    return {
      content: `You're looking at ${fmtNum(cc.estimatedLow)}–${fmtNum(cc.estimatedHigh)} in closing costs on a ${fmtNum(cc.purchasePrice)} ${loanLabel} purchase — plus your down payment, that's about ${fmtNum(cc.totalCashNeeded)} total at closing.\n\nThe good news: some of these line items are negotiable. Kasandra has negotiated these costs down on recent Tucson transactions.`,
      suggestedReplies: [
        "What's negotiable?",
        "How do I reduce these costs?",
        "Talk with Kasandra",
      ],
    };
  }

  if (language === 'es') {
    return {
      content: `Estás investigando los costos de cierre — inteligente hacerlo antes de hacer una oferta. ¿Tienes un rango de precio o tipo de préstamo específico?`,
      suggestedReplies: [
        "Estoy usando FHA",
        "Ayúdame a estimar",
        "Hablar con Kasandra",
      ],
    };
  }
  return {
    content: `You're looking into closing costs — smart to do before making an offer. Are you working with a specific price range or loan type?`,
    suggestedReplies: [
      "I'm using FHA",
      "Help me estimate",
      "Talk with Kasandra",
    ],
  };
}

function generateSellerTimelineGreeting(context: EntryContext): GreetingResult {
  const { language, timeline, seller_goal_priority, estimated_value } = context as any;

  const hasValue = estimated_value && estimated_value > 0;
  const valueStr = hasValue ? `$${Math.round(estimated_value / 1000)}K` : null;

  if (language === 'es') {
    const timelineMsg =
      timeline === 'asap' ? 'quieres cerrar lo antes posible'
      : timeline === '30_days' ? 'tienes ~2–3 meses para cerrar'
      : timeline === '60_90' ? 'tienes ~4–5 meses'
      : 'estás en modo de planificación a largo plazo';
    return {
      content: `Construiste tu cronograma — ${timelineMsg}.${valueStr ? ` Con una casa estimada en ${valueStr}, la preparación estratégica importa.` : ''}

¿Quieres que revisemos las fases juntos, o tienes una pregunta específica sobre tu siguiente paso?`,
      suggestedReplies: [
        'Revisar la Fase 1 conmigo',
        '¿Qué debería hacer primero?',
        'Hablar con Kasandra',
      ],
    };
  }

  const timelineMsg =
    timeline === 'asap' ? 'you want to close as soon as possible'
    : timeline === '30_days' ? 'you have ~2–3 months to close'
    : timeline === '60_90' ? 'you have ~4–5 months'
    : "you're in long-range planning mode";

  return {
    content: `You built your timeline — ${timelineMsg}.${valueStr ? ` On a home estimated at ${valueStr}, strategic prep makes a real difference.` : ''}

Want to walk through the phases together, or do you have a specific question about your next step?`,
    suggestedReplies: [
      'Walk me through Phase 1',
      'What should I do first?',
      'Talk with Kasandra',
    ],
  };
}

function generateDefaultGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nYa sea que estés pensando en comprar, vender, o simplemente entender qué es posible, aquí no hay presión.\n\n¿Qué te trae por aquí hoy?`,
      suggestedReplies: [
        "Estoy pensando en vender",
        "Estoy buscando comprar",
        "Solo estoy explorando",
      ],
    };
  }

  return {
    content: `Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nWhether you're thinking about buying, selling, or just understanding what's possible, there's no pressure here.\n\nWhat brings you here today?`,
    suggestedReplies: [
      "I'm thinking about selling",
      "I'm looking to buy",
      "Just exploring for now",
    ],
  };
}
