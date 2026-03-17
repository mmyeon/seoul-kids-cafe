import type { KidsCafe } from '../../types/index';

export const KAKAO_SDK_ID = 'kakao-maps-sdk';

export function buildSdkUrl(appKey: string): string {
  if (!appKey) return '';
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&libraries=services`;
}

export function isValidCoordinate(lat: number, lng: number): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  // (0, 0) 좌표는 한국 서비스에서 미설정 데이터로 처리
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function findCafeById(
  id: string,
  cafes: KidsCafe[]
): KidsCafe | undefined {
  return cafes.find((cafe) => cafe.id === id);
}

export function getMarkerZIndex(
  cafeId: string,
  selectedCafeId: string | undefined
): number {
  return cafeId === selectedCafeId ? 10 : 1;
}

export function loadKakaoSdk(appKey: string, onLoad: () => void): void {
  if (typeof window === 'undefined') return;

  if (window.kakao?.maps) {
    window.kakao.maps.load(onLoad);
    return;
  }

  const existing = document.getElementById(KAKAO_SDK_ID);
  if (existing) {
    existing.addEventListener('load', onLoad);
    return;
  }

  const url = buildSdkUrl(appKey);
  if (!url) return;

  const script = document.createElement('script');
  script.id = KAKAO_SDK_ID;
  script.src = url;
  script.async = true;
  script.addEventListener('load', onLoad);
  document.head.appendChild(script);
}
