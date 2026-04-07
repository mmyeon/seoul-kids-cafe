import type { KidsCafe, AgeFilter } from '../../types/index';
import { getMatchStatus } from './ageFilter';

export type MarkerState = 'default' | 'matching' | 'selected';

export function isValidCoordinate(lat: number, lng: number): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  // (0, 0) 좌표는 한국 서비스에서 미설정 데이터로 처리
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function findKidsCafeById(
  id: string,
  kidsCafes: KidsCafe[]
): KidsCafe | undefined {
  return kidsCafes.find((kidsCafe) => kidsCafe.id === id);
}

export function getMarkerZIndex(
  kidsCafeId: string,
  selectedKidsCafeId: string | undefined
): number {
  return kidsCafeId === selectedKidsCafeId ? 10 : 1;
}

export function createMarkerImageUrl(color: string, selected: boolean): string {
  // 선택 시 약간 크게 (26×38), 기본은 20×29
  const w = selected ? 26 : 20;
  const h = selected ? 38 : 29;
  const pinPath = `M12 0C5.373 0 0 5.373 0 12c0 9 12 23 12 23s12-14 12-23C24 5.373 18.627 0 12 0z`;

  const filterDefs = selected
    ? `<defs><filter id="s" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(234,179,8,0.6)"/></filter></defs>`
    : '';
  const extraAttrs = selected ? ' filter="url(#s)"' : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 24 35">${filterDefs}<path d="${pinPath}" fill="${color}"${extraAttrs}/><circle cx="12" cy="12" r="5" fill="white" opacity="0.95"/></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getMarkerState(
  cafeId: string,
  selectedCafeId: string | undefined,
  selectedAges: AgeFilter[],
  cafe: KidsCafe,
): MarkerState {
  if (cafeId === selectedCafeId) return 'selected';
  if (selectedAges.length > 0 && getMatchStatus(cafe, selectedAges) === 'full') return 'matching';
  return 'default';
}
