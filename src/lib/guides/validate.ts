/**
 * Dev-only: Validate that every live registry entry has a content loader.
 * Called once on V2GuideDetail mount when in dev mode.
 */
import { getLiveGuides } from '@/lib/guides/guideRegistry';
import { GUIDE_DATA_LOADERS } from '@/data/guides';

let validated = false;

export function validateRegistryLoadersOnce(): void {
  if (import.meta.env.PROD || validated) return;
  validated = true;

  const live = getLiveGuides();
  const loaderIds = new Set(Object.keys(GUIDE_DATA_LOADERS));

  live.forEach(entry => {
    if (!loaderIds.has(entry.id)) {
      console.error(`[GuideRegistry] Guide "${entry.id}" has no content loader in GUIDE_DATA_LOADERS`);
    }
  });

  loaderIds.forEach(id => {
    if (!live.find(e => e.id === id)) {
      console.warn(`[GuideRegistry] GUIDE_DATA_LOADERS has "${id}" but it's not a live guide`);
    }
  });
}
