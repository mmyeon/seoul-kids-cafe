import type { KidsCafe, MatchStatus } from '../../types/index';

export interface KidsCafeCardProps {
  kidsCafe: KidsCafe;
  matchStatus: MatchStatus;
  distanceKm?: number;
  isOpen: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function formatAgeRange(ageRange: KidsCafe['ageRange']): string {
  const { minAge, maxAge } = ageRange;
  if (minAge === maxAge) return `${minAge}세`;
  return `${minAge} ~ ${maxAge}세`;
}

const FULL_DAY_TO_SHORT: Record<string, string> = {
  월요일: '월',
  화요일: '화',
  수요일: '수',
  목요일: '목',
  금요일: '금',
  토요일: '토',
  일요일: '일',
};

export function normalizeOperatingHours(raw: string): string {
  if (!raw) return raw;
  let result = raw;
  for (const [full, short] of Object.entries(FULL_DAY_TO_SHORT)) {
    result = result.replaceAll(full, short);
  }
  return result.replace(/\s*~\s*/g, ' ~ ');
}

export function formatDistance(distanceKm: number | undefined): string {
  if (distanceKm === undefined) return '';
  return `${distanceKm.toFixed(1)}km 거리`;
}

export function getCardOpacity(matchStatus: MatchStatus): string {
  return matchStatus === 'full' ? 'opacity-100' : 'opacity-30';
}

export function isSafeUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}
