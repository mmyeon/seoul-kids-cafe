/**
 * KakaoMap 컴포넌트
 *
 * Kakao Maps SDK를 동적으로 로드하고 키즈카페 위치 마커를 렌더링합니다.
 * 마커 클릭 시 카드 하이라이트 연동, 카드 선택 시 지도 중심 이동을 지원합니다.
 */

'use client';

import { useEffect, useRef } from 'react';
import type { KidsCafe } from '../types/index';

// ============================================================
// Props 타입
// ============================================================

export interface KakaoMapProps {
  cafes: KidsCafe[];
  selectedCafeId?: string;
  onMarkerClick: (id: string) => void;
}

// ============================================================
// 순수 헬퍼 함수 (테스트 가능)
// ============================================================

/**
 * Kakao Maps SDK 스크립트 URL을 생성합니다.
 * appKey가 빈 문자열이면 빈 문자열을 반환합니다.
 */
export function buildSdkUrl(appKey: string): string {
  if (!appKey) return '';
  return `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services`;
}

/**
 * 위도/경도가 유효한 범위인지 검증합니다.
 * - 위도: -90 ~ 90 (단, 0은 미설정으로 간주하여 제외)
 * - 경도: -180 ~ 180 (단, 0은 미설정으로 간주하여 제외)
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
  if (isNaN(lat) || isNaN(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * 카페 목록에서 id로 카페를 찾아 반환합니다.
 * 일치하는 카페가 없으면 undefined를 반환합니다.
 */
export function findCafeById(
  id: string,
  cafes: KidsCafe[]
): KidsCafe | undefined {
  return cafes.find((cafe) => cafe.id === id);
}

/**
 * 마커의 z-index를 반환합니다.
 * 선택된 카페의 마커는 10, 나머지는 1을 반환합니다.
 */
export function getMarkerZIndex(
  cafeId: string,
  selectedCafeId: string | undefined
): number {
  return cafeId === selectedCafeId ? 10 : 1;
}

// ============================================================
// Kakao Maps SDK 타입 선언
// ============================================================

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: InstanceType<Window['kakao']['maps']['LatLng']>; level: number }
        ) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: {
          position: KakaoLatLng;
          map?: KakaoMapInstance;
          zIndex?: number;
        }) => KakaoMarker;
        event: {
          addListener: (
            target: KakaoMarker,
            type: string,
            handler: () => void
          ) => void;
        };
      };
    };
  }
}

interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
  setZIndex: (zIndex: number) => void;
}

// ============================================================
// Kakao Maps SDK 동적 로드
// ============================================================

const KAKAO_SDK_ID = 'kakao-maps-sdk';

/**
 * Kakao Maps SDK 스크립트를 동적으로 DOM에 삽입합니다.
 * 이미 로드된 경우 콜백을 즉시 호출합니다.
 */
function loadKakaoSdk(appKey: string, onLoad: () => void): void {
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

// ============================================================
// 컴포넌트
// ============================================================

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청
const DEFAULT_LEVEL = 8;

export default function KakaoMap({
  cafes,
  selectedCafeId,
  onMarkerClick,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());

  // SDK 로드 및 지도 초기화
  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '';

    loadKakaoSdk(appKey, () => {
      if (!containerRef.current) return;

      const center = new window.kakao.maps.LatLng(
        DEFAULT_CENTER.lat,
        DEFAULT_CENTER.lng
      );

      const map = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: DEFAULT_LEVEL,
      });

      mapRef.current = map;

      // 마커 렌더링
      cafes.forEach((cafe) => {
        if (!isValidCoordinate(cafe.lat, cafe.lng)) return;

        const position = new window.kakao.maps.LatLng(cafe.lat, cafe.lng);
        const zIndex = getMarkerZIndex(cafe.id, selectedCafeId);

        const marker = new window.kakao.maps.Marker({
          position,
          map,
          zIndex,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(cafe.id);
        });

        markersRef.current.set(cafe.id, marker);
      });
    });
  }, [cafes, selectedCafeId, onMarkerClick]);

  // 선택된 카페가 변경되면 지도 중심 이동 및 마커 z-index 업데이트
  useEffect(() => {
    if (!mapRef.current || !selectedCafeId) return;

    const cafe = findCafeById(selectedCafeId, cafes);
    if (!cafe || !isValidCoordinate(cafe.lat, cafe.lng)) return;

    const position = new window.kakao.maps.LatLng(cafe.lat, cafe.lng);
    mapRef.current.setCenter(position);

    // 마커 z-index 갱신
    markersRef.current.forEach((marker, cafeId) => {
      marker.setZIndex(getMarkerZIndex(cafeId, selectedCafeId));
    });
  }, [selectedCafeId, cafes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[300px] rounded-xl overflow-hidden"
      aria-label="키즈카페 위치 지도"
      role="img"
    />
  );
}
