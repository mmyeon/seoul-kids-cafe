import type { KidsCafe, AgeFilter, MatchStatus } from '../../types/index';
import { getMatchStatus } from './ageFilter';
import { haversineKm } from './distance';
import { sortKidsCafes } from './cafeSort';

export type UserLocation = {
  lat: number;
  lng: number;
};

export type CafeListItem = {
  cafe: KidsCafe;
  matchStatus: MatchStatus;
  distanceKm: number | null;
};

/**
 * 사용자 위치와 카페 위치 사이의 거리를 계산합니다.
 * 사용자 위치가 없으면 null을 반환합니다.
 */
export function computeDistance(cafe: KidsCafe, userLocation: UserLocation | null): number | null {
  if (userLocation === null) return null;
  return haversineKm(userLocation.lat, userLocation.lng, cafe.lat, cafe.lng);
}

/**
 * 카페 주소에서 자치구를 추출해 중복 제거 후 가나다순으로 반환합니다.
 */
export function extractDistricts(cafes: KidsCafe[]): string[] {
  const districts = cafes
    .map((cafe) => cafe.address.match(/(\S+구)/)?.[1])
    .filter((d): d is string => d !== undefined);
  return [...new Set(districts)].sort((a, b) => a.localeCompare(b, 'ko'));
}

/**
 * 카페 목록을 필터/정렬하여 카드 렌더링에 필요한 데이터를 포함한 아이템 목록을 반환합니다.
 */
export function buildCafeListItems(
  cafes: KidsCafe[],
  selectedAges: AgeFilter[],
  userLocation: UserLocation | null,
  selectedDistrict: string | null = null
): CafeListItem[] {
  if (cafes.length === 0) return [];

  const filtered = selectedDistrict
    ? cafes.filter((cafe) => cafe.address.includes(selectedDistrict))
    : cafes;

  const sorted = sortKidsCafes(filtered, selectedAges, userLocation?.lat, userLocation?.lng);

  return sorted.map((cafe) => ({
    cafe,
    matchStatus: getMatchStatus(cafe, selectedAges),
    distanceKm: computeDistance(cafe, userLocation),
  }));
}
