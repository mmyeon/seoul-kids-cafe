import umppaImagesData from '../data/umppa-images.json';

export function getUmppaImageUrl(fcltyId: string): string | undefined {
  return (umppaImagesData as Record<string, string>)[fcltyId];
}
