import type { AgeFilter, KidsCafe, MatchStatus } from '../../types/index';
import { getMatchStatus } from './ageFilter';
import { isOpenToday } from './openStatus';
import { haversineKm } from './distance';

const SORT_PRIORITY: Record<MatchStatus, Record<'open' | 'closed', number>> = {
  full: { open: 0, closed: 1 },
  none: { open: 2, closed: 2 },
};

export function sortKidsCafes(
  kidsCafes: KidsCafe[],
  selectedAges: AgeFilter[],
  userLat?: number,
  userLng?: number,
): KidsCafe[] {
  if (kidsCafes.length === 0) return [];

  const userLocation =
    userLat !== undefined && userLng !== undefined
      ? { lat: userLat, lng: userLng }
      : null;

  return [...kidsCafes].sort((a, b) => {
    const statusA = getMatchStatus(a, selectedAges);
    const statusB = getMatchStatus(b, selectedAges);
    const openA = isOpenToday(a.operatingHours) ? 'open' : 'closed';
    const openB = isOpenToday(b.operatingHours) ? 'open' : 'closed';

    const priorityA = SORT_PRIORITY[statusA][openA];
    const priorityB = SORT_PRIORITY[statusB][openB];

    if (priorityA !== priorityB) return priorityA - priorityB;

    if (userLocation !== null) {
      const distA = haversineKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = haversineKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    }

    return a.name.localeCompare(b.name, 'ko');
  });
}
