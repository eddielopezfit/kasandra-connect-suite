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

export interface GuideSection {
  heading: string;
  headingEs: string;
  content: string;
  contentEs: string;
  /** Optional rich variant renderer. Falls back to plain text if omitted. */
  variant?: 'default' | 'comparison' | 'path-selector' | 'stats-grid';
  /** Structured data for side-by-side comparison cards. */
  comparisonData?: ComparisonData;
  /** Structured data for interactive path-selector cards. */
  pathData?: PathOption[];
  /** Structured data for 2x2 market stats grid. */
  statsData?: StatItem[];
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
