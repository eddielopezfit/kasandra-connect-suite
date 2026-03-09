/**
 * Returns the public URL for a neighborhood hero image from Supabase storage.
 * Falls back to undefined if the image hasn't been generated yet.
 */
export function getNeighborhoodHeroUrl(slug: string): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'sghuhlmsrmqryfvcbqqj';
  return `https://${projectId}.supabase.co/storage/v1/object/public/guide-assets/neighborhoods/${slug}/hero.jpg`;
}
