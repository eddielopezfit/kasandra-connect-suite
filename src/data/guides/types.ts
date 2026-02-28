/**
 * Guide Content Data — shape for individual guide content files.
 * readTime lives in guideRegistry only (not duplicated here).
 */

export interface GuideSection {
  heading: string;
  headingEs: string;
  content: string;
  contentEs: string;
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
