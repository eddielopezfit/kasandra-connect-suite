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
  | 'synthesis' 
  | 'hero' 
  | 'floating'
  | 'footer_nudge' // Blocked from greeting injection; aliased to floating behavior
  | 'proactive'
  | 'question'
  | 'post_booking' // After successful booking - identity reinforcement
  | 'quiz_result'; // After completing the path quiz — intent-specific routing

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
    case 'footer_nudge':
    case 'proactive':
      return generateProactiveGreeting(language);
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
      content: `${name}Listo. Usted ya hizo lo más difícil — pensar esto con cuidado.

Kasandra revisará personalmente lo que compartió antes de su llamada para que tenga claridad completa en 10 minutos.

Si gusta, dígame una cosa sobre la que quiera estar 100% seguro/a cuando hablen.`,
      suggestedReplies: [
        "¿Qué debo preparar para la llamada?",
        "¿Puedo reprogramar si es necesario?",
        "Gracias, Selena",
      ],
    };
  }
  
  // English
  return {
    content: `${name}You're all set. You've already done the hard part — thinking this through carefully.

Kasandra will personally review what you shared before your call so you get complete clarity in 10 minutes.

If you'd like, tell me one thing you want to be 100% certain about when you two talk.`,
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
        content: `Completó su camino — y parece que vender está en su mente.\n\nBasado en lo que compartió, hay dos cosas que le ayudarán a avanzar: entender el valor actual de su casa y saber qué opciones tiene antes de comprometerse con algo.`,
        suggestedReplies: [
          "¿Cuánto vale mi casa?",
          "Comparar efectivo vs. venta tradicional",
          "Hablar con Kasandra",
        ],
      };
    }
    if (intent === 'cash') {
      return {
        content: `Completó su camino — y las opciones de oferta en efectivo llamaron su atención. Vale la pena explorarlo.\n\nDéjeme ayudarle a entender qué significa realmente una oferta en efectivo para su situación específica.`,
        suggestedReplies: [
          "¿Cuánto vale mi casa?",
          "Comparar efectivo vs. venta tradicional",
          "Hablar con Kasandra",
        ],
      };
    }
    if (intent === 'buy') {
      return {
        content: `Completó su camino — y está pensando en comprar. Es un excelente lugar para comenzar.\n\nAquí está lo que normalmente ayuda más en esta etapa: saber dónde está financieramente y entender el proceso antes de comprometerse con algo.`,
        suggestedReplies: [
          "Tomar la evaluación de preparación",
          "¿Qué debo preparar?",
          "Hablar con Kasandra",
        ],
      };
    }
    // explore / default
    return {
      content: `Completó su camino — y está bien que las cosas no estén completamente claras aún. Eso es más normal de lo que piensa.\n\nFigurémonos juntos cuál es su próximo paso más útil.`,
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
        "What's my home worth?",
        "Compare cash vs. traditional",
        "Talk with Kasandra",
      ],
    };
  }
  if (intent === 'cash') {
    return {
      content: `You've just completed your path — and cash offer options caught your attention. That's worth exploring.\n\nLet me help you understand what a cash offer actually means for your specific situation.`,
      suggestedReplies: [
        "What's my home worth?",
        "Compare cash vs. traditional",
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
    let content = 'Veo que ha completado el análisis.';
    
    if (calculatorAdvantage === 'cash') {
      content = `Excelente trabajo con el análisis. El efectivo parece ser una buena opción para usted — velocidad y certeza sin los costos de preparación.`;
    } else if (calculatorAdvantage === 'traditional') {
      content = diff 
        ? `Buen trabajo con los números. Parece que una venta tradicional podría darle ${diff} más — si tiene el tiempo para maximizar el valor.`
        : `Buen trabajo con los números. Una venta tradicional podría darle más — si tiene el tiempo para maximizar el valor.`;
    } else {
      content = `Ha hecho un gran paso al analizar sus números. La diferencia es sutil — lo cual significa que la decisión correcta depende de su situación.`;
    }

    return {
      content: content + `\n\n¿Le gustaría explorar lo que significa esto para usted?`,
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
    content = `Nice work on the analysis. Cash looks like a strong option for you — speed and certainty without the prep costs.`;
  } else if (calculatorAdvantage === 'traditional') {
    content = diff 
      ? `Great job on the numbers. It looks like a traditional sale could net you ${diff} more — if you have the time to maximize value.`
      : `Great job on the numbers. A traditional sale could net you more — if you have the time to maximize value.`;
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

function generateGuideHandoffGreeting(context: EntryContext): GreetingResult {
  const { guideTitle, guideCategory, language } = context;

  if (language === 'es') {
    const title = guideTitle || 'esta guía';
    let content = `Veo que está leyendo "${title}."`;
    
    if (guideCategory === 'buying') {
      content += ` Es un excelente recurso para compradores. ¿Tiene alguna pregunta específica sobre el proceso de compra?`;
    } else if (guideCategory === 'selling' || guideCategory === 'valuation') {
      content += ` Gran paso para entender sus opciones de venta. ¿Le gustaría una lista personalizada basada en lo que ha leído?`;
    } else {
      content += ` ¿Hay algo específico que le gustaría explorar más?`;
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
    content += ` Great step toward understanding your selling options. Would you like a personalized checklist based on what you've read?`;
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
      ? `Ha leído ${guidesReadCount} guías — está construyendo una imagen clara de sus opciones. Permítame resumir los puntos clave que más importan para su situación.`
      : `Ha estado explorando sus opciones. ¿Le gustaría que resuma lo que ha aprendido hasta ahora?`;

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
      content: `Hola, soy Selena — la guía digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión. Ya sea que esté pensando en comprar, vender, o simplemente entendiendo lo que es posible — estoy aquí para guiarle.\n\n¿Qué le trae por aquí hoy?`,
      suggestedReplies: [
        "Estoy pensando en vender",
        "Estoy buscando comprar",
        "Solo estoy explorando",
      ],
    };
  }

  return {
    content: `Hello, I'm Selena — Kasandra's digital real estate guide.\n\nI'm here to help you explore your options calmly and without pressure. Whether you're thinking about buying, selling, or just understanding what's possible — I'm here to guide you.\n\nWhat brings you here today?`,
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
        content: `¿Ya recibió una oferta en efectivo? Puedo ayudarle a revisarla — buscar señales de alerta, compararla con lo que el mercado podría ofrecer, y asegurar que entienda lo que está firmando.\n\nCuénteme su situación.`,
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
      content: `Estoy aquí para ayudarle. ¿Qué pregunta tiene en mente?`,
      suggestedReplies: [
        "¿Cuánto vale mi casa?",
        "¿Cómo funciona el proceso?",
        "¿Qué opciones tengo?",
      ],
    };
  }

  return {
    content: `I'm here to help. What question do you have in mind?`,
    suggestedReplies: [
      "What's my home worth?",
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
      content: `Noté que ha estado explorando sus opciones. ¿Hay algo en lo que pueda ayudarle?`,
      suggestedReplies: [
        "Sí, tengo una pregunta",
        "¿Cuáles son mis opciones?",
        "Solo estoy mirando",
      ],
    };
  }

  return {
    content: `I noticed you've been exploring your options. Is there anything I can help you with?`,
    suggestedReplies: [
      "Yes, I have a question",
      "What are my options?",
      "Just browsing",
    ],
  };
}

function generateDefaultGreeting(language: 'en' | 'es'): GreetingResult {
  if (language === 'es') {
    return {
      content: `Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?`,
      suggestedReplies: [
        "Estoy pensando en vender",
        "Estoy buscando comprar",
        "Solo estoy explorando",
      ],
    };
  }

  return {
    content: `Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?`,
    suggestedReplies: [
      "I'm thinking about selling",
      "I'm looking to buy",
      "Just exploring for now",
    ],
  };
}
