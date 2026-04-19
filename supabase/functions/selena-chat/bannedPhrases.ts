// KB-16 Anti-Deflection Doctrine — banned phrase enforcement.
// These phrases signal evasion and destroy trust. If the model emits one,
// the post-processor in index.ts rewrites the reply with a substance-first opener.

export const BANNED_PHRASES_EN: RegExp[] = [
  /\bI'?d\s+recommend\s+(speaking|talking|reaching out)\s+(with|to)\s+Kasandra\s+directly\b/i,
  /\bfor\s+accurate\s+(pricing|information|details),?\s+please\s+contact\b/i,
  /\bI\s+want\s+to\s+make\s+sure\s+I\s+give\s+you\s+accurate\s+information\b/i,
  /\bevery\s+home\s+is\s+different\b/i,
  /\bit\s+depends\s+on\s+many\s+factors\b/i,
  /\bI\s+can'?t\s+speak\s+to\s+that\b/i,
  /\bI'?m\s+not\s+able\s+to\s+provide\s+that\b/i,
  /\bas\s+an\s+AI\b/i,
  /\blanguage\s+model\b/i,
];

export const BANNED_PHRASES_ES: RegExp[] = [
  /\bte\s+recomiendo\s+hablar\s+(directamente\s+)?con\s+Kasandra\b/i,
  /\bpara\s+(precios|información)\s+precisos?,?\s+contacta\b/i,
  /\bquiero\s+asegurarme\s+de\s+darte\s+información\s+precisa\b/i,
  /\bcada\s+casa\s+es\s+diferente\b/i,
  /\bdepende\s+de\s+muchos\s+factores\b/i,
  /\bno\s+puedo\s+hablar\s+de\s+eso\b/i,
  /\bno\s+puedo\s+proporcionar\s+esa\s+información\b/i,
  /\bcomo\s+(una?\s+)?IA\b/i,
  /\bmodelo\s+de\s+lenguaje\b/i,
];

export interface BannedPhraseHit {
  matched: boolean;
  phrase?: string;
}

export function detectBannedPhrase(reply: string, language: 'en' | 'es'): BannedPhraseHit {
  const list = language === 'es' ? BANNED_PHRASES_ES : BANNED_PHRASES_EN;
  for (const rx of list) {
    const m = reply.match(rx);
    if (m) return { matched: true, phrase: m[0] };
  }
  return { matched: false };
}

export function buildAntiDeflectionNudge(language: 'en' | 'es', offendingPhrase?: string): string {
  if (language === 'es') {
    return `\n\nKB-16 SOBREESCRITURA — REGENERAR:\nTu respuesta anterior contenía una frase de evasión${offendingPhrase ? ` ("${offendingPhrase}")` : ''}. Reescríbela siguiendo el patrón de KB-16: lidera con una respuesta directa o direccional (rango, plazo, hecho del proceso, detalle del vecindario), luego conecta con Kasandra como el siguiente paso natural — no como evasión. Máximo 3 oraciones, ~70 palabras.`;
  }
  return `\n\nKB-16 OVERRIDE — REGENERATE:\nYour previous reply contained a deflection phrase${offendingPhrase ? ` ("${offendingPhrase}")` : ''}. Rewrite it following KB-16: lead with a direct or directional answer (range, timeline, process fact, neighborhood detail), then frame Kasandra as the natural next step — not as a punt. Max 3 sentences, ~70 words.`;
}
