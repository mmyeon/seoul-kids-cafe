import type { KidsCafe, MatchStatus } from '../../types/index';

export interface KidsCafeCardProps {
  kidsCafe: KidsCafe;
  matchStatus: MatchStatus;
  distanceKm?: number;
  isOpen: boolean;
  onClick?: () => void;
}

export function formatAgeRange(ageRange: KidsCafe['ageRange']): string {
  const { minAge, maxAge } = ageRange;
  const parts: string[] = [];

  if (minAge === 0) {
    parts.push('0-12개월');
  }

  const startAgeYears = minAge === 0 ? 1 : Math.floor(minAge / 12);
  const endAgeYears = Math.floor(maxAge / 12);

  if (startAgeYears === endAgeYears) {
    parts.push(`${startAgeYears}세`);
  } else if (startAgeYears <= endAgeYears) {
    for (let age = startAgeYears; age <= endAgeYears; age++) {
      parts.push(`${age}세`);
    }
  }

  return parts.join(', ');
}

export function formatDistance(distanceKm: number | undefined): string {
  if (distanceKm === undefined) return '';
  return `${distanceKm.toFixed(1)}km`;
}

export function formatParking(parking: KidsCafe['parking']): string {
  if (parking === 'available') return '주차 가능';
  if (parking === 'unavailable') return '주차 불가';
  return '주차 정보 없음';
}

export function getCardOpacity(matchStatus: MatchStatus): string {
  if (matchStatus === 'full') return 'opacity-100';
  if (matchStatus === 'partial') return 'opacity-50';
  return 'opacity-30';
}

export function shouldShowPartialBadge(matchStatus: MatchStatus): boolean {
  return matchStatus === 'partial';
}

export function isSafeUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}
