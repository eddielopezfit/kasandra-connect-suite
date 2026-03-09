import { EntryContext, ChatMessage } from './types';
import { SessionContext, updateSessionContext } from '@/lib/analytics/selenaSession';
import { MappedReply } from '@/lib/registry/chipsRegistry';
import { mapChipsToActionSpecs, getPhaseAwareChips } from './chipGovernance';
import type { Language } from '@/contexts/LanguageContext';

export function computeGreeting(
  entryContext: EntryContext | undefined,
  sessionContext: SessionContext | null,
  messages: ChatMessage[],
  storedHistoryExists: boolean,
  t: (en: string, es: string) => string,
  language: Language = 'en',
): { greetingContent: string; suggestedReplies: MappedReply[]; } | null {
  const isPostBooking = entryContext?.source === 'post_booking';
  const isMeaningfulSource = entryContext && 
    entryContext.source !== 'floating' && 
    entryContext.source !== 'proactive';

  const isBlockedSource = !entryContext || 
    entryContext.source === 'floating' || 
    entryContext.source === 'proactive';
  
  const isAllowedGreetingSource = !!entryContext && [
    'calculator', 'guide_handoff', 'synthesis', 'hero', 'quiz_result', 'post_booking', 'seller_decision',
    'market_intelligence', 'neighborhood_compare', 'buyer_closing_costs',
    'neighborhood_detail', 'neighborhoods_index'
  ].includes(entryContext.source);

  const hasRecoveryCandidate = !sessionContext?.recovery_shown && !!sessionContext?.booking_chips_shown_at;

  const shouldInjectGreeting = (() => {
    if (storedHistoryExists && isBlockedSource && !hasRecoveryCandidate) return false;
    if (isPostBooking) return true;
    if (isBlockedSource && hasRecoveryCandidate) return true;
    if (storedHistoryExists && !isAllowedGreetingSource) return false;
    if (!storedHistoryExists && messages.length === 0) return true;
    if (messages.length > 3 && isMeaningfulSource && isAllowedGreetingSource) {
      const contextualSources = ['guide_handoff', 'calculator', 'synthesis', 'quiz_result', 'seller_decision',
        'market_intelligence', 'neighborhood_compare', 'buyer_closing_costs', 'neighborhood_detail', 'neighborhoods_index'];
      return contextualSources.includes(entryContext?.source || '');
    }
    if (isMeaningfulSource && isAllowedGreetingSource) return true;
    return false;
  })();

  if (!shouldInjectGreeting) return null;

  let greetingContent = '';
  let suggestedReplies: MappedReply[] = [];

  if (isPostBooking) {
    const name = entryContext?.userName ? `${entryContext.userName}, ` : '';
    greetingContent = t(
      `${name}You're all set. You've already done the hard part — thinking this through carefully.\n\nKasandra will personally review what you shared before your call so you get complete clarity in 10 minutes.\n\nIf you'd like, tell me one thing you want to be 100% certain about when you two talk.`,
      `${name}Listo. Usted ya hizo lo más difícil — pensar esto con cuidado.\n\nKasandra revisará personalmente lo que compartió antes de su llamada para que tenga claridad completa en 10 minutos.\n\nSi gusta, dígame una cosa sobre la que quiera estar 100% seguro/a cuando hablen.`
    );
    suggestedReplies = [
      { label: t("What should I prepare for the call?", "¿Qué debo preparar para la llamada?") },
      { label: t("Can I reschedule if needed?", "¿Puedo reprogramar si es necesario?") },
      { label: t("Thanks, Selena", "Gracias, Selena") },
    ];
  } else if (isBlockedSource && !sessionContext?.recovery_shown && sessionContext?.booking_chips_shown_at) {
    const shownAt = new Date(sessionContext.booking_chips_shown_at).getTime();
    const now = Date.now();
    const isWithin24h = (now - shownAt) < 24 * 60 * 60 * 1000;
    if (isWithin24h) {
      greetingContent = t(
        "You were close to connecting with Kasandra. Would you like to continue?",
        "Estaba cerca de conectarse con Kasandra. ¿Le gustaría continuar?"
      );
      suggestedReplies = mapChipsToActionSpecs([
        t("Talk with Kasandra", "Hablar con Kasandra"),
      ], language);
      suggestedReplies.push({ label: t("Keep exploring", "Seguir explorando") });
      updateSessionContext({ recovery_shown: true });
    } else {
        return null;
    }
  } else if (sessionContext?.restored_from_snapshot && !storedHistoryExists) {
    const intentLabel = sessionContext.intent && sessionContext.intent !== 'explore'
      ? sessionContext.intent
      : '';
    const intentFragment = intentLabel
      ? t(` Last time we were looking at ${intentLabel} options.`, ` La última vez estábamos viendo opciones de ${intentLabel}.`)
      : '';
    greetingContent = t(
      `Welcome back — I saved your place.${intentFragment} Want to continue where you left off?`,
      `Bienvenido/a de nuevo — guardé tu progreso.${intentFragment} ¿Quieres continuar donde lo dejamos?`
    );

    const resumeChips: string[] = [];
    const lastPage = sessionContext.last_page;
    if (lastPage && lastPage.startsWith('/')) {
      resumeChips.push(t("Continue where I left off", "Continuar donde lo dejé"));
    }
    if (sessionContext.readiness_score || sessionContext.estimated_value) {
      resumeChips.push(t("Show my results", "Ver mis resultados"));
    }
    resumeChips.push(t("Start fresh", "Empezar de nuevo"));

    suggestedReplies = resumeChips.map(label => ({ label }));
    updateSessionContext({ restored_from_snapshot: false });
  } else if (entryContext?.source === 'calculator' && entryContext.calculatorAdvantage) {
    const calcValue = sessionContext?.estimated_value;
    const calcDiff = sessionContext?.calculator_difference ?? entryContext.calculatorDifference;
    const formattedValue = calcValue ? `$${calcValue.toLocaleString()}` : '';
    const formattedDiff = calcDiff ? `$${calcDiff.toLocaleString()}` : '';
    
    if (entryContext.calculatorAdvantage === 'cash') {
      greetingContent = formattedValue
        ? t(
            `You ran the numbers on a ~${formattedValue} home. Cash looks like a strong option — speed and certainty without the prep costs.${formattedDiff ? ` The difference is about ${formattedDiff}.` : ''}\n\nWant the 30-second breakdown or tell me your timeline?`,
            `Analizó los números de una casa de ~${formattedValue}. El efectivo parece ser una buena opción — velocidad y certeza sin los costos de preparación.${formattedDiff ? ` La diferencia es de unos ${formattedDiff}.` : ''}\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
          )
        : t(
            `Nice work on the analysis. Cash looks like a strong option for you — speed and certainty without the prep costs.\n\nWant the 30-second breakdown or tell me your timeline?`,
            `Excelente trabajo con el análisis. El efectivo parece una buena opción — velocidad y certeza sin los costos de preparación.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
          );
    } else if (entryContext.calculatorAdvantage === 'traditional') {
      greetingContent = formattedValue
        ? t(
            `You ran the numbers on a ~${formattedValue} home. Listing could net about ${formattedDiff || 'more'} — if you have the time to maximize value.\n\nWant the 30-second breakdown or tell me your timeline?`,
            `Analizó los números de una casa de ~${formattedValue}. Vender de forma tradicional podría darle unos ${formattedDiff || 'más'} — si tiene el tiempo para maximizar el valor.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
          )
        : t(
            `Great job on the numbers. A traditional sale could net you ${formattedDiff || 'more'} — if you have the time to maximize value.\n\nWant the 30-second breakdown or tell me your timeline?`,
            `Buen trabajo con los números. Una venta tradicional podría darle ${formattedDiff || 'más'} — si tiene el tiempo para maximizar el valor.\n\n¿Quiere el resumen de 30 segundos o dígame su plazo?`
          );
    } else {
      greetingContent = formattedValue
        ? t(
            `You ran the numbers on a ~${formattedValue} home. The difference is small — which means your timeline matters most.\n\nWant the 30-second breakdown or tell me what you're deciding?`,
            `Analizó los números de una casa de ~${formattedValue}. La diferencia es pequeña — lo cual significa que su plazo importa más.\n\n¿Quiere el resumen de 30 segundos o dígame qué está decidiendo?`
          )
        : t(
            `You've taken a great step by running your numbers. The difference is subtle — which means the right choice depends on your situation.\n\nWant the 30-second breakdown or tell me what you're deciding?`,
            `Ha hecho un gran paso al analizar sus números. La diferencia es sutil — la decisión correcta depende de su situación.\n\n¿Quiere el resumen de 30 segundos o dígame qué está decidiendo?`
          );
    }
    suggestedReplies = [
      { label: t("30-second breakdown", "Resumen de 30 segundos") },
      { label: t("What would my home net?", "¿Cuánto me daría mi casa?") },
      { label: t("I'm deciding: cash vs list", "Estoy decidiendo: efectivo vs venta") },
    ];
  } else if (entryContext?.source === 'seller_decision') {
    const ctx = sessionContext;

    const situationLabels: Record<string, { en: string; es: string }> = {
      inherited: { en: 'dealing with an inherited property', es: 'lidiando con una propiedad heredada' },
      divorce: { en: 'going through a life change', es: 'pasando por un cambio de vida' },
      tired_landlord: { en: 'a tired landlord', es: 'un propietario cansado' },
      upgrading: { en: 'upgrading', es: 'buscando mejorar' },
      relocating: { en: 'relocating', es: 'reubicándose' },
      other: { en: 'exploring your options', es: 'explorando sus opciones' },
    };
    const goalLabels: Record<string, { en: string; es: string }> = {
      speed: { en: 'speed', es: 'rapidez' },
      price: { en: 'getting the highest price', es: 'obtener el mejor precio' },
      least_stress: { en: 'least stress', es: 'menos estrés' },
      privacy: { en: 'privacy', es: 'privacidad' },
      not_sure: { en: 'still deciding', es: 'aún decidiendo' },
    };
    const conditionLabels: Record<string, { en: string; es: string }> = {
      needs_work: { en: 'needs work', es: 'necesita trabajo' },
      mostly_original: { en: 'mostly original', es: 'mayormente original' },
      standard: { en: 'standard condition', es: 'condición estándar' },
      updated: { en: 'recently updated', es: 'recientemente actualizada' },
      like_new: { en: 'like new', es: 'como nueva' },
    };

    const rawSituation = ctx?.situation || '';
    const rawGoal = ctx?.seller_goal_priority || '';
    const rawCondition = ctx?.property_condition_raw || '';

    const situation = situationLabels[rawSituation]
      ? t(situationLabels[rawSituation].en, situationLabels[rawSituation].es)
      : rawSituation.replace(/_/g, ' ') || t('your situation', 'su situación');
    const goal = goalLabels[rawGoal]
      ? t(goalLabels[rawGoal].en, goalLabels[rawGoal].es)
      : rawGoal.replace(/_/g, ' ') || t('your priority', 'su prioridad');
    const condition = conditionLabels[rawCondition]
      ? t(conditionLabels[rawCondition].en, conditionLabels[rawCondition].es)
      : rawCondition.replace(/_/g, ' ') || t('the condition', 'la condición');

    const path = ctx?.seller_decision_recommended_path;

    const pathLine = path === 'cash'
      ? t("Based on that, it's worth comparing a cash offer to a traditional listing.",
          "Basado en eso, vale la pena comparar una oferta en efectivo con un listado tradicional.")
      : path === 'traditional'
      ? t("Based on that, many sellers start with the traditional path to maximize value.",
          "Basado en eso, muchos vendedores empiezan con el camino tradicional para maximizar valor.")
      : t("Based on that, we can compare both paths calmly.",
          "Basado en eso, podemos comparar ambos caminos con calma.");

    greetingContent = t(
      `I see you're ${situation} and prioritizing ${goal}. Given that your home is ${condition}, it's good that you're looking at your options early.\n\n${pathLine}`,
      `Veo que está ${situation} y priorizando ${goal}. Dado que su casa está ${condition}, es bueno que esté viendo sus opciones con tiempo.\n\n${pathLine}`
    );

    suggestedReplies = [
      { label: t("Compare cash vs. listing", "Comparar efectivo vs. listado") },
      { label: t("How much is my home worth?", "¿Cuánto vale mi casa?") },
      { label: t("Talk with Kasandra", "Hablar con Kasandra") },
    ];
  } else if (entryContext?.source === 'neighborhood_detail') {
    const areaName = entryContext.neighborhoodName || 'this area';
    greetingContent = t(
      `I see you're exploring ${areaName}. Whether you're thinking about buying or selling there, I can help you understand what that market looks like right now.\n\nWhat's on your mind?`,
      `Veo que está explorando ${areaName}. Ya sea que esté pensando en comprar o vender allí, puedo ayudarle a entender cómo se ve ese mercado ahora mismo.\n\n¿Qué tiene en mente?`
    );
    suggestedReplies = [
      { label: t(`What's the market like in ${areaName}?`, `¿Cómo está el mercado en ${areaName}?`) },
      { label: t("I'm thinking about selling there", "Estoy pensando en vender allí") },
      { label: t("I'm looking to buy there", "Estoy buscando comprar allí") },
    ];
  } else if (entryContext?.source === 'neighborhoods_index') {
    greetingContent = t(
      `You're browsing Tucson-area neighborhoods — smart move. I can help you narrow down which areas fit your situation best.\n\nAre you looking to buy or sell?`,
      `Está explorando vecindarios del área de Tucson — buena decisión. Puedo ayudarle a identificar qué áreas se ajustan mejor a su situación.\n\n¿Está buscando comprar o vender?`
    );
    suggestedReplies = [
      { label: t("I'm looking to buy", "Estoy buscando comprar") },
      { label: t("I'm thinking about selling", "Estoy pensando en vender") },
      { label: t("Help me compare areas", "Ayúdame a comparar áreas") },
    ];
  } else if (entryContext?.source === 'guide_handoff') {
    const title = entryContext.guideTitle || 'that guide';
    greetingContent = t(
      `I hope you found ${title} helpful.\n\nSince you're exploring this topic, do you have any specific questions about how it applies to your situation?`,
      `Espero que ${title} le haya sido útil.\n\nYa que está explorando este tema, ¿tiene alguna pregunta específica sobre cómo se aplica a su situación?`
    );
    suggestedReplies = [
      { label: t("I have a specific question", "Tengo una pregunta específica") },
      { label: t("Tell me about my options", "Háblame de mis opciones") },
      { label: t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra") },
    ];
  } else if (entryContext?.source === 'synthesis') {
    const count = entryContext.guidesReadCount || 1;
    const guidesText = count === 1 ? t('a guide', 'una guía') : t(`${count} guides`, `${count} guías`);
    greetingContent = t(
      `You've read ${guidesText} — great research. At this point, it often helps to look at your specific numbers or timeline.\n\nWhat's the biggest question on your mind right now?`,
      `Ha leído ${guidesText} — excelente investigación. En este punto, a menudo ayuda ver sus números específicos o su plazo.\n\n¿Cuál es la pregunta más importante que tiene en mente ahora?`
    );
    suggestedReplies = [
      { label: t("What are my options?", "¿Cuáles son mis opciones?") },
      { label: t("How much do I need total?", "¿Cuánto necesito en total?") },
      { label: t("Talk with Kasandra", "Hablar con Kasandra") },
    ];
  } else if (entryContext?.source === 'hero') {
    greetingContent = t(
      `Hello, I'm Selena — Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure. Whether you're thinking about buying, selling, or just understanding what's possible — I'm here to help.\n\nWhat brings you here today?`,
      `Hola, soy Selena — la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión. Ya sea que esté pensando en comprar, vender, o simplemente entendiendo lo que es posible — estoy aquí para ayudarle.\n\n¿Qué le trae por aquí hoy?`
    );
    suggestedReplies = [
      { label: t("I'm thinking about selling", "Estoy pensando en vender") },
      { label: t("I'm looking to buy", "Estoy buscando comprar") },
      { label: t("Just exploring for now", "Solo estoy explorando") },
    ];
  } else {
    const sessionCtx = sessionContext;
    const declaredIntent = sessionCtx?.intent;
    const declaredTimeline = sessionCtx?.timeline;
    const toolUsed = sessionCtx?.tool_used;
    const readinessScore = sessionCtx?.readiness_score;
    const quizDone = sessionCtx?.quiz_completed;

    if (declaredIntent === 'sell' || declaredIntent === 'cash') {
      if (declaredTimeline === 'asap') {
        greetingContent = t(
          "Welcome back. Since you're on a tight timeline, comparing your cash vs. listing options is the fastest way to see where you stand.",
          "Bienvenido/a de vuelta. Como tiene un cronograma ajustado, comparar sus opciones de efectivo vs. listado es la forma más rápida de ver dónde está."
        );
        suggestedReplies = [
          { label: t("Compare cash vs. listing", "Comparar efectivo vs. listado") },
          { label: t("Get my selling options", "Ver mis opciones de venta") },
          { label: t("I have a question", "Tengo una pregunta") },
        ];
      } else {
        greetingContent = t(
          "Welcome back. I remember you're thinking about selling. How can I help you move forward?",
          "Bienvenido/a de vuelta. Recuerdo que está pensando en vender. ¿Cómo puedo ayudarle a avanzar?"
        );
        suggestedReplies = [
          { label: t("Compare cash vs. listing", "Comparar efectivo vs. listado") },
          { label: t("Read the seller guide", "Leer la guía del vendedor") },
          { label: t("I'm ready to talk to Kasandra", "Estoy listo/a para hablar con Kasandra") },
        ];
      }
    } else if (declaredIntent === 'buy') {
      if (readinessScore !== undefined && readinessScore < 60) {
        greetingContent = t(
          "Welcome back. Based on your readiness check, there are a few steps that could strengthen your position. Let me help you get there.",
          "Bienvenido/a de vuelta. Según su evaluación de preparación, hay algunos pasos que podrían fortalecer su posición. Permítame ayudarle."
        );
        suggestedReplies = [
          { label: t("What should I work on first?", "¿En qué debería trabajar primero?") },
          { label: t("Review my readiness results", "Revisar mis resultados de preparación") },
          { label: t("I have a question", "Tengo una pregunta") },
        ];
      } else if (toolUsed === 'buyer_readiness') {
        greetingContent = t(
          "Welcome back. You've already completed your readiness check — that's a great step. What would you like to explore next?",
          "Bienvenido/a de vuelta. Ya completó su evaluación de preparación — ese es un gran paso. ¿Qué le gustaría explorar a continuación?"
        );
        suggestedReplies = [
          { label: t("Browse buyer guides", "Explorar guías de comprador") },
          { label: t("I'm ready to talk to Kasandra", "Estoy listo/a para hablar con Kasandra") },
          { label: t("I have a question", "Tengo una pregunta") },
        ];
      } else {
        greetingContent = t(
          "Welcome back. I remember you're looking to buy. The Buyer Readiness Check is a great place to start.",
          "Bienvenido/a de vuelta. Recuerdo que está buscando comprar. La Evaluación de Preparación del Comprador es un buen lugar para comenzar."
        );
        suggestedReplies = [
          { label: t("Take the Buyer Readiness Check", "Tomar la Evaluación de Preparación") },
          { label: t("Browse buyer guides", "Explorar guías de comprador") },
          { label: t("I have a question", "Tengo una pregunta") },
        ];
      }
    } else if (declaredIntent === 'dual') {
      greetingContent = t(
        "Welcome back. Buying and selling at the same time requires careful coordination. Kasandra specializes in exactly this.",
        "Bienvenido/a de vuelta. Comprar y vender al mismo tiempo requiere coordinación cuidadosa. Kasandra se especializa exactamente en esto."
      );
      suggestedReplies = [
        { label: t("How does a dual move work?", "¿Cómo funciona una mudanza dual?") },
        { label: t("I'd like to talk to Kasandra", "Me gustaría hablar con Kasandra") },
        { label: t("I have a question", "Tengo una pregunta") },
      ];
    } else if (quizDone) {
      greetingContent = t(
        "Welcome back. I see you completed the orientation quiz — great start. How can I help you take the next step?",
        "Bienvenido/a de vuelta. Veo que completó el cuestionario de orientación — excelente comienzo. ¿Cómo puedo ayudarle a dar el siguiente paso?"
      );
      suggestedReplies = [
        { label: t("What should I do next?", "¿Qué debería hacer a continuación?") },
        { label: t("Browse guides", "Explorar guías") },
        { label: t("I have a specific question", "Tengo una pregunta específica") },
      ];
    } else if (sessionCtx?.intent) {
      greetingContent = t(
        "Welcome back — we can pick up where you left off.",
        "Bienvenido/a de vuelta — podemos continuar donde lo dejamos."
      );
      suggestedReplies = getPhaseAwareChips(t, sessionCtx);
    } else {
      greetingContent = t(
        "Hello, I'm Selena, Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure.\n\nAre you looking to buy, sell, or just explore what's possible?",
        "Hola, soy Selena, la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión.\n\n¿Está pensando en comprar, vender, o solo explorar qué es posible?"
      );
      suggestedReplies = [
        { label: t("I'm thinking about selling", "Estoy pensando en vender") },
        { label: t("I'm looking to buy", "Estoy buscando comprar") },
        { label: t("Just exploring for now", "Solo estoy explorando") },
      ];
    }
  }

  return { greetingContent, suggestedReplies };
}
