/**
 * Strips Perplexity Sonar citation markers like [2][5] from AI-generated text.
 */
export const stripCitations = (text: string): string =>
  text.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
