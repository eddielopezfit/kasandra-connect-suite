import { EntryContext, ChatMessage } from './types';
import { SessionContext, updateSessionContext } from '@/lib/analytics/selenaSession';
import { MappedReply } from '@/lib/registry/chipsRegistry';
import { mapChipsToActionSpecs, getPhaseAwareChips } from './chipGovernance';
import type { Language } from '@/contexts/LanguageContext';
import { TrailEvent, serializeTrailForSelena } from '@/lib/analytics/sessionTrail';

// FIX 5: Trail-aware greeting generation
interface TrailSummary {
  neighborhoodCount: number;
  guideCount: number;
  toolCount: number;
  hasCalculator: boolean;
  lastNeighborhood: string | null;
  lastGuide: string | null;
  lastTool: string | null;
}

function summarizeTrail(trail: Array<{ label: string; type: string; minutes_ago: number }>): TrailSummary {
  let neighborhoodCount = 0;
  let guideCount = 0;
  let toolCount = 0;
  let hasCalculator = false;
  let lastNeighborhood: string | null = null;
  let lastGuide: string | null = null;
  let lastTool: string | null = null;

  for (const event of trail) {
    if (event.type === 'page' && (event.label.includes('Neighborhood') || event.label.includes('Catalina') || event.label.includes('Oro Valley') || event.label.includes('Marana'))) {
      neighborhoodCount++;
      if (!lastNeighborhood) lastNeighborhood = event.label;
    }
    if (event.type === 'guide') {
      guideCount++;
      if (!lastGuide) lastGuide = event.label;
    }
    if (event.type === 'tool' || event.type === 'quiz') {
      toolCount++;
      if (!lastTool) lastTool = event.label;
      if (event.label.includes('Calculator') || event.label.includes('Net')) hasCalculator = true;
    }
  }

  return { neighborhoodCount, guideCount, toolCount, hasCalculator, lastNeighborhood, lastGuide, lastTool };
}

function generateTrailAwareGreeting(
  trail: TrailSummary,
  t: (en: string, es: string) => string,
): { content: string; replies: MappedReply[] } | null {
  // Trail-aware greetings for floating_button / hero_cta where no specific context exists
  
  // 2+ neighborhood profiles explored
  if (trail.neighborhoodCount >= 2) {
    return {
      content: t(
        "I see you've been exploring some Tucson neighborhoods — what's drawing you to those areas?",
        "Veo que ha estado explorando algunos vecindarios de Tucson — ¿qué le atrae de esas áreas?"
      ),
      replies: [
        { label: t("I'm thinking about buying there", "Estoy pensando en comprar allí") },
        { label: t("I'm considering selling nearby", "Estoy considerando vender cerca") },
        { label: t("Help me compare areas", "Ayúdame a comparar áreas") },
      ],
    };
  }

  // Guide + tool combination
  if (trail.guideCount >= 1 && trail.toolCount >= 1) {
    const guideName = trail.lastGuide?.replace(' Guide', '') || 'a guide';
    const toolName = trail.lastTool || 'a tool';
    return {
      content: t(
        `You've been doing your homework — ${guideName} and the ${toolName}. What question came up?`,
        `Ha estado haciendo su tarea — ${guideName} y el ${toolName}. ¿Qué pregunta surgió?`
      ),
      replies: [
        { label: t("I have a specific question", "Tengo una pregunta específica") },
        { label: t("Help me decide my next step", "Ayúdame a decidir mi próximo paso") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ],
    };
  }

  // Only guides read
  if (trail.guideCount >= 2) {
    return {
      content: t(
        `I see you've been reading up on real estate guides. What would you like to dig into?`,
        `Veo que ha estado leyendo guías de bienes raíces. ¿En qué le gustaría profundizar?`
      ),
      replies: [
        { label: t("I have a question about what I read", "Tengo una pregunta sobre lo que leí") },
        { label: t("What should I do next?", "¿Qué debería hacer a continuación?") },
        { label: t("Browse more guides", "Explorar más guías") },
      ],
    };
  }

  return null;
}

export function computeGreeting(
  entryContext: EntryContext | undefined,
  sessionContext: SessionContext | null,
  messages: ChatMessage[],
  storedHistoryExists: boolean,
  t: (en: string, es: string) => string,
  language: Language = 'en',
  sessionTrail?: Array<{ label: string; type: string; minutes_ago: number }>,
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
    'market_intelligence', 'market_intelligence_result', 'neighborhood_compare', 'neighborhood_compare_result', 
    'buyer_closing_costs', 'neighborhood_detail', 'neighborhoods_index',
    'buyer_readiness_capture', 'seller_readiness_capture', 'cash_readiness_capture',
    'off_market_registered', 'off_market_capture', 'seller_timeline',
    'buyer_fork', 'seller_fork'
  ].includes(entryContext.source);

  const hasRecoveryCandidate = !sessionContext?.recovery_shown && !!sessionContext?.booking_chips_shown_at;

  // FIX 1: Suppress greeting if the last message is from the user (mid-conversation)
  const lastMessageIsUser = messages.length > 0 && messages[messages.length - 1].role === 'user';

  const shouldInjectGreeting = (() => {
    // Fork cards always get a fresh greeting — explicit user intent declaration overrides everything
    if (entryContext?.source === 'buyer_fork' || entryContext?.source === 'seller_fork') return true;
    // Never inject a greeting mid-conversation (after user has spoken) unless post-booking
    if (lastMessageIsUser && !isPostBooking) return false;
    if (storedHistoryExists && isBlockedSource && !hasRecoveryCandidate) return false;
    if (isPostBooking) return true;
    if (isBlockedSource && hasRecoveryCandidate) return true;
    if (storedHistoryExists && !isAllowedGreetingSource) return false;
    if (!storedHistoryExists && messages.length === 0) return true;
    if (messages.length > 3 && isMeaningfulSource && isAllowedGreetingSource) {
      const contextualSources = ['guide_handoff', 'calculator', 'synthesis', 'quiz_result', 'seller_decision',
        'market_intelligence', 'market_intelligence_result', 'neighborhood_compare', 'neighborhood_compare_result', 
        'buyer_closing_costs', 'neighborhood_detail', 'neighborhoods_index',
        'buyer_readiness_capture', 'seller_readiness_capture', 'cash_readiness_capture',
        'off_market_registered', 'off_market_capture', 'seller_timeline',
        'buyer_fork', 'seller_fork'];
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
  } else if (entryContext?.source === 'calculator' && (entryContext.calculatorAdvantage || entryContext.sellerCalcData)) {
    const sc = entryContext.sellerCalcData;
    if (sc && sc.estimatedValue > 0) {
      const fmtNum = (n: number) => `$${Math.round(n).toLocaleString()}`;
      const cashNet = fmtNum(sc.cashNetProceeds);
      const listNet = fmtNum(sc.traditionalNetProceeds);
      const diff = fmtNum(sc.netDifference);
      const value = fmtNum(sc.estimatedValue);
      
      if (sc.recommendation === 'cash') {
        greetingContent = t(
          `On a ${value} home, cash nets you ${cashNet} — ${diff} less than listing at ${listNet}, but you close faster with zero prep costs.\n\nKasandra can walk you through the right strategy based on your timeline. That conversation is worth having.`,
          `En una casa de ${value}, efectivo te da ${cashNet} — ${diff} menos que listado a ${listNet}, pero cierras más rápido sin costos de preparación.\n\nKasandra puede orientarte sobre la estrategia correcta según tu plazo. Esa conversación vale la pena.`
        );
      } else if (sc.recommendation === 'traditional') {
        greetingContent = t(
          `On a ${value} home, listing could net you ${listNet} — about ${diff} more than a cash offer at ${cashNet}. If you have the time, the traditional path pays off.\n\nKasandra can help you maximize that number with the right pricing and negotiation strategy.`,
          `En una casa de ${value}, el listado podría darte ${listNet} — unos ${diff} más que una oferta en efectivo de ${cashNet}. Si tienes el tiempo, el camino tradicional vale la pena.\n\nKasandra puede ayudarte a maximizar ese número con la estrategia correcta de precios y negociación.`
        );
      } else {
        greetingContent = t(
          `On a ${value} home, the difference between cash (${cashNet}) and listing (${listNet}) is only ${diff}. Your timeline and priorities matter more than the number.\n\nKasandra can help you decide which path fits your situation best.`,
          `En una casa de ${value}, la diferencia entre efectivo (${cashNet}) y listado (${listNet}) es solo ${diff}. Tu plazo y prioridades importan más que el número.\n\nKasandra puede ayudarte a decidir qué camino se ajusta mejor a tu situación.`
        );
      }
      suggestedReplies = [
        { label: t("Which path is right for me?", "¿Qué camino es mejor para mí?") },
        { label: t("What affects my net the most?", "¿Qué afecta más mi ganancia neta?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    } else {
      // Fallback to existing advantage-based greeting
      const calcValue = sessionContext?.estimated_value;
      const calcDiff = sessionContext?.calculator_difference ?? entryContext.calculatorDifference;
      const formattedValue = calcValue ? `$${calcValue.toLocaleString()}` : '';
      const formattedDiff = calcDiff ? `$${calcDiff.toLocaleString()}` : '';
      
      if (entryContext.calculatorAdvantage === 'cash') {
        greetingContent = formattedValue
          ? t(
              `You ran the numbers on a ~${formattedValue} home. Cash looks like a strong option — speed and certainty without the prep costs.${formattedDiff ? ` The difference is about ${formattedDiff}.` : ''}\n\nKasandra can help you decide if this is the right move.`,
              `Analizó los números de una casa de ~${formattedValue}. El efectivo parece ser una buena opción — velocidad y certeza sin los costos de preparación.${formattedDiff ? ` La diferencia es de unos ${formattedDiff}.` : ''}\n\nKasandra puede ayudarle a decidir si este es el paso correcto.`
            )
          : t(
              `Nice work on the analysis. Cash looks like a strong option for you.\n\nKasandra can help you decide if this is the right move.`,
              `Excelente trabajo con el análisis. El efectivo parece una buena opción.\n\nKasandra puede ayudarle a decidir si este es el paso correcto.`
            );
      } else if (entryContext.calculatorAdvantage === 'traditional') {
        greetingContent = formattedValue
          ? t(
              `You ran the numbers on a ~${formattedValue} home. Listing could net about ${formattedDiff || 'more'} — if you have the time.\n\nKasandra can help you maximize that number with the right strategy.`,
              `Analizó los números de una casa de ~${formattedValue}. Vender de forma tradicional podría darle unos ${formattedDiff || 'más'} — si tiene el tiempo.\n\nKasandra puede ayudarle a maximizar ese número con la estrategia correcta.`
            )
          : t(
              `Great job on the numbers. A traditional sale could net you more — if you have the time.\n\nKasandra can help you with the right pricing strategy.`,
              `Buen trabajo con los números. Una venta tradicional podría darle más — si tiene el tiempo.\n\nKasandra puede ayudarle con la estrategia de precios correcta.`
            );
      } else {
        greetingContent = formattedValue
          ? t(
              `You ran the numbers on a ~${formattedValue} home. The difference is small — your timeline matters most.\n\nKasandra can help you decide which path fits your situation.`,
              `Analizó los números de una casa de ~${formattedValue}. La diferencia es pequeña — su plazo importa más.\n\nKasandra puede ayudarle a decidir qué camino se ajusta a su situación.`
            )
          : t(
              `You've run your numbers. The difference is subtle — the right choice depends on your situation.\n\nKasandra can help you decide.`,
              `Ha analizado sus números. La diferencia es sutil — la decisión correcta depende de su situación.\n\nKasandra puede ayudarle a decidir.`
            );
      }
      suggestedReplies = [
        { label: t("Which path is right for me?", "¿Qué camino es mejor para mí?") },
        { label: t("What would my home net?", "¿Cuánto me daría mi casa?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    }
  } else if (entryContext?.source === 'buyer_readiness_capture' || entryContext?.source === 'seller_readiness_capture' || entryContext?.source === 'cash_readiness_capture') {
    const rd = entryContext.readinessData;
    if (rd && rd.score > 0) {
      const score = rd.score;
      const band = score >= 75 ? t('ready to move forward', 'listo/a para avanzar') : score >= 50 ? t('nearly ready', 'casi listo/a') : t('building readiness', 'construyendo preparación');
      const priority = rd.primaryPriority || t('your situation', 'tu situación');
      const toolLabel = rd.toolType === 'buyer' ? t('Buyer Readiness', 'Preparación del Comprador') : rd.toolType === 'cash' ? t('Cash Readiness', 'Preparación para Efectivo') : t('Seller Readiness', 'Preparación del Vendedor');
      
      if (score >= 75) {
        greetingContent = t(
          `Your ${toolLabel} score is ${score}/100 — you're ${band}. Your top priority is ${priority}.\n\nAt this level of readiness, a short strategy call with Kasandra could save you time and money on your next steps.`,
          `Tu puntuación de ${toolLabel} es ${score}/100 — estás ${band}. Tu prioridad principal es ${priority}.\n\nCon este nivel de preparación, una llamada corta de estrategia con Kasandra podría ahorrarte tiempo y dinero en tus próximos pasos.`
        );
      } else if (score >= 50) {
        greetingContent = t(
          `Your ${toolLabel} score is ${score}/100 — you're ${band}. Your top priority is ${priority}.\n\nThere are a few areas to strengthen. Kasandra can walk you through exactly what to focus on.`,
          `Tu puntuación de ${toolLabel} es ${score}/100 — estás ${band}. Tu prioridad principal es ${priority}.\n\nHay algunas áreas que fortalecer. Kasandra puede orientarte sobre exactamente en qué enfocarte.`
        );
      } else {
        greetingContent = t(
          `Your ${toolLabel} score is ${score}/100 — you're still ${band}, and that's completely normal. Your top priority is ${priority}.\n\nKasandra can help you build a plan to get there at your own pace.`,
          `Tu puntuación de ${toolLabel} es ${score}/100 — aún estás ${band}, y eso es completamente normal. Tu prioridad principal es ${priority}.\n\nKasandra puede ayudarte a crear un plan para llegar a tu ritmo.`
        );
      }
      suggestedReplies = [
        { label: t("What should I work on first?", "¿En qué debería trabajar primero?") },
        { label: t("Explain my score", "Explica mi puntuación") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    } else {
      greetingContent = t(
        "Great job completing the readiness check. How can I help you take the next step?",
        "Excelente trabajo completando la evaluación. ¿Cómo puedo ayudarte a dar el siguiente paso?"
      );
      suggestedReplies = [
        { label: t("What should I do next?", "¿Qué debería hacer ahora?") },
        { label: t("Browse guides", "Explorar guías") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    }
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
  } else if (entryContext?.source === 'buyer_closing_costs') {
    const cc = entryContext.closingCostData;
    if (cc && cc.purchasePrice > 0) {
      const fmtNum = (n: number) => `$${Math.round(n).toLocaleString()}`;
      const loanLabel = cc.loanType === 'fha' ? 'FHA' : cc.loanType === 'va' ? 'VA' : cc.loanType === 'cash' ? t('cash', 'efectivo') : t('conventional', 'convencional');
      greetingContent = t(
        `You're looking at ${fmtNum(cc.estimatedLow)}–${fmtNum(cc.estimatedHigh)} in closing costs on a ${fmtNum(cc.purchasePrice)} ${loanLabel} purchase — plus your down payment, that's about ${fmtNum(cc.totalCashNeeded)} total at closing.\n\nThe good news: some of these line items are negotiable. Kasandra has reduced these costs on recent Tucson transactions.`,
        `Estás viendo ${fmtNum(cc.estimatedLow)}–${fmtNum(cc.estimatedHigh)} en costos de cierre para una compra ${loanLabel} de ${fmtNum(cc.purchasePrice)} — más tu enganche, eso es aproximadamente ${fmtNum(cc.totalCashNeeded)} total al cierre.\n\nLa buena noticia: algunos de estos rubros son negociables. Kasandra ha reducido estos costos en transacciones recientes en Tucson.`
      );
      suggestedReplies = [
        { label: t("What's negotiable?", "¿Qué es negociable?") },
        { label: t("How do I reduce these costs?", "¿Cómo reduzco estos costos?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    } else {
      greetingContent = t(
        "You're looking into closing costs — smart to do before making an offer. Are you working with a specific price range or loan type?",
        "Estás investigando los costos de cierre — inteligente hacerlo antes de hacer una oferta. ¿Tienes un rango de precio o tipo de préstamo específico?"
      );
      suggestedReplies = [
        { label: t("I'm using FHA", "Estoy usando FHA") },
        { label: t("Help me estimate", "Ayúdame a estimar") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    }
  } else if (entryContext?.source === 'off_market_registered' || entryContext?.source === 'off_market_capture') {
    const om = entryContext.offMarketData;
    if (om && om.areas?.length > 0) {
      const areasStr = om.areas.slice(0, 3).join(', ');
      greetingContent = t(
        `You're registered for off-market access in ${areasStr} — ${om.budgetRange} range, ${om.propertyType}. Kasandra works with sellers before they list — you're in the right place.\n\nWant to share more about what you're looking for so she can keep an eye out?`,
        `Estás registrado/a para acceso fuera del mercado en ${areasStr} — rango ${om.budgetRange}, ${om.propertyType}. Kasandra trabaja con vendedores antes de que publiquen — estás en el lugar correcto.\n\n¿Quieres compartir más sobre lo que buscas para que ella esté atenta?`
      );
      suggestedReplies = [
        { label: t("What does off-market mean?", "¿Qué significa fuera del mercado?") },
        { label: t("How does Kasandra find these?", "¿Cómo encuentra Kasandra estas casas?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    } else {
      greetingContent = t(
        "You're on the list for off-market properties. Kasandra will personally reach out when something matches your criteria.\n\nIs there anything about the buying process you'd like to understand better?",
        "Estás en la lista para propiedades fuera del mercado. Kasandra te contactará personalmente cuando algo coincida con tus criterios.\n\n¿Hay algo sobre el proceso de compra que te gustaría entender mejor?"
      );
      suggestedReplies = [
        { label: t("Explore Tucson neighborhoods", "Explorar vecindarios de Tucson") },
        { label: t("How does buying work?", "¿Cómo funciona comprar?") },
        { label: t("Talk with Kasandra", "Hablar con Kasandra") },
      ];
    }
  } else if (entryContext?.source === 'neighborhood_compare_result' || entryContext?.source === 'neighborhood_compare') {
    const nc = entryContext.neighborhoodCompareData;
    if (nc && nc.areasCompared?.length >= 2) {
      const areasStr = nc.areasCompared.slice(0, 3).join(' vs ');
      greetingContent = t(
        `You compared ${areasStr} — a comparison tool gives you the numbers, but Kasandra knows the streets. Want her perspective on which is the better fit for your situation?`,
        `Comparaste ${areasStr} — una herramienta de comparación te da los números, pero Kasandra conoce las calles. ¿Quieres su perspectiva sobre cuál se ajusta mejor a tu situación?`
      );
    } else {
      greetingContent = t(
        "You're comparing Tucson neighborhoods — smart move. Kasandra knows these communities personally.\n\nIs there something specific you're looking for in a neighborhood?",
        "Estás comparando vecindarios de Tucson — buena decisión. Kasandra conoce estas comunidades personalmente.\n\n¿Hay algo específico que estés buscando en un vecindario?"
      );
    }
    suggestedReplies = [
      { label: t("Which is better for my situation?", "¿Cuál es mejor para mi situación?") },
      { label: t("What's the local context?", "¿Cuál es el contexto local?") },
      { label: t("Talk with Kasandra", "Hablar con Kasandra") },
    ];
  } else if (entryContext?.source === 'market_intelligence_result' || entryContext?.source === 'market_intelligence') {
    const mi = entryContext.marketIntelData;
    if (mi && mi.daysOnMarket > 0) {
      const implication = mi.daysOnMarket <= 20 
        ? t("a fast-moving market", "un mercado activo")
        : mi.daysOnMarket <= 45 
        ? t("a balanced market", "un mercado equilibrado")
        : t("a buyer's market with more negotiating room", "un mercado de compradores con más margen para negociar");
      greetingContent = t(
        `Tucson homes are averaging ${mi.daysOnMarket} days on market with a ${mi.saleToListRatio} sale-to-list ratio — that's ${implication}.\n\nThese are county-wide averages. Want to understand what this means for your specific ZIP and price point?`,
        `Las casas de Tucson promedian ${mi.daysOnMarket} días en mercado con un ratio de ${mi.saleToListRatio} precio/lista — eso es ${implication}.\n\nEstos son promedios del condado. ¿Quieres entender qué significa para tu código postal y rango de precio específico?`
      );
    } else {
      greetingContent = t(
        "You're looking at live Tucson market data — days on market, sale-to-list ratio, and daily holding costs.\n\nWant to understand what these numbers mean for your specific situation?",
        "Estás viendo datos en vivo del mercado de Tucson — días en mercado, ratio precio/lista y costos diarios.\n\n¿Quieres entender qué significan estos números para tu situación específica?"
      );
    }
    suggestedReplies = [
      { label: t("Is it a good time to sell?", "¿Es buen momento para vender?") },
      { label: t("What about buying?", "¿Y para comprar?") },
      { label: t("Talk with Kasandra", "Hablar con Kasandra") },
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
  } else if (entryContext?.source === 'seller_timeline') {
    const ctx = sessionContext;
    const timeline = ctx?.timeline;
    const goalPriority = ctx?.seller_goal_priority;
    
    if (timeline === 'asap') {
      greetingContent = t(
        "You're thinking about selling — let's make sure you have a clear picture of what that looks like on your timeline. What matters most to you: speed, maximizing price, or flexibility?",
        "Está pensando en vender — asegurémonos de que tenga una imagen clara de cómo se ve en su cronograma. ¿Qué le importa más: rapidez, maximizar el precio, o flexibilidad?"
      );
    } else if (goalPriority === 'price') {
      greetingContent = t(
        "You're focused on maximizing your sale price — that's smart. Strategic timing and preparation can make a real difference. Let me help you plan your next steps.",
        "Está enfocado/a en maximizar su precio de venta — eso es inteligente. El tiempo estratégico y la preparación pueden marcar una diferencia real. Permítame ayudarle a planificar sus próximos pasos."
      );
    } else {
      greetingContent = t(
        "You're thinking about selling — let's make sure you have a clear picture of what that looks like on your timeline. What matters most to you: speed, maximizing price, or flexibility?",
        "Está pensando en vender — asegurémonos de que tenga una imagen clara de cómo se ve en su cronograma. ¿Qué le importa más: rapidez, maximizar el precio, o flexibilidad?"
      );
    }
    suggestedReplies = [
      { label: t("I need to move fast", "Necesito moverme rápido") },
      { label: t("I want maximum value", "Quiero el máximo valor") },
      { label: t("I'm still deciding", "Aún estoy decidiendo") },
      { label: t("Talk with Kasandra", "Hablar con Kasandra") },
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
  } else if (entryContext?.source === 'buyer_fork' || entryContext?.source === 'seller_fork') {
    // Fork cards = explicit first-time intent declaration — always fresh greeting, never returning user
    greetingContent = t(
      `Hello, I'm Selena — Kasandra's digital real estate concierge.\n\nI'm here to help you explore your options calmly and without pressure. Whether you're thinking about buying, selling, or just understanding what's possible — I'm here to help.\n\nWhat brings you here today?`,
      `Hola, soy Selena — la concierge digital de bienes raíces de Kasandra.\n\nEstoy aquí para ayudarle a explorar sus opciones con calma y sin presión. Ya sea que esté pensando en comprar, vender, o simplemente entendiendo lo que es posible — estoy aquí para ayudarle.\n\n¿Qué le trae por aquí hoy?`
    );
    suggestedReplies = [
      { label: t("I'm thinking about selling", "Estoy pensando en vender") },
      { label: t("I'm looking to buy", "Estoy buscando comprar") },
      { label: t("Just exploring for now", "Solo estoy explorando") },
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
      // FIX 5: Try trail-aware greeting for floating_button/hero entries with journey context
      const trail = sessionTrail ?? serializeTrailForSelena();
      const trailSummary = summarizeTrail(trail);
      const trailGreeting = generateTrailAwareGreeting(trailSummary, t);
      
      if (trailGreeting && (trail.length >= 2)) {
        greetingContent = trailGreeting.content;
        suggestedReplies = trailGreeting.replies;
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
  }

  return { greetingContent, suggestedReplies };
}
