/**
 * Guide Content Data — shape for individual guide content files.
 * readTime lives in guideRegistry only (not duplicated here).
 */

export interface ComparisonItem {
  bold: string;
  boldEs: string;
  text: string;
  textEs: string;
}

export interface ComparisonSide {
  label: string;
  labelEs: string;
  items: ComparisonItem[];
}

export interface ComparisonData {
  left: ComparisonSide;
  right: ComparisonSide;
}

export interface PathOption {
  id: string;
  title: string;
  titleEs: string;
  desc: string;
  descEs: string;
}

export interface StatItem {
  value: string;
  valueEs: string;
  label: string;
  labelEs: string;
}

export interface FaqItem {
  /** Question shown as H3 in the accordion and used verbatim in FAQPage schema */
  question: string;
  questionEs: string;
  /** Plain-text answer — injected into FAQPage schema and rendered on page */
  answer: string;
  answerEs: string;
}

export interface GuideSection {
  heading: string;
  headingEs: string;
  content: string;
  contentEs: string;
  /** Optional rich variant renderer. Falls back to plain text if omitted. */
  variant?: 'default' | 'comparison' | 'path-selector' | 'stats-grid' | 'faq';
  /** Structured data for side-by-side comparison cards. */
  comparisonData?: ComparisonData;
  /** Structured data for interactive path-selector cards. */
  pathData?: PathOption[];
  /** Structured data for 2x2 market stats grid. */
  statsData?: StatItem[];
  /**
   * Structured Q&A pairs.
   * Rendered as an accessible accordion on the page.
   * Automatically injected into the FAQPage JSON-LD schema block on every
   * guide detail page — making every Q&A eligible for Google AI Overviews,
   * People Also Ask boxes, and AEO answer extraction.
   */
  faqItems?: FaqItem[];
}

export interface GuideContentData {
  title: string;
  titleEs: string;
  category: string;
  categoryEs: string;
  author: string;
  intro: string;
  introEs: string;
  sections: GuideSection[];
}
