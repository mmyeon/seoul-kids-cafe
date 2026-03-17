'use client';

import { useEffect, useRef } from 'react';
import type { KakaoMapProps, KakaoMapInstance, KakaoMarker } from '../types/kakao-map';
import {
  isValidCoordinate,
  findCafeById,
  getMarkerZIndex,
  loadKakaoSdk,
} from '../src/lib/kakao-map-utils';

export type { KakaoMapProps };

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청
const DEFAULT_LEVEL = 8;

export default function KakaoMap({ cafes, selectedKidsCafeId, onMarkerClick }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());
  // Store callback in a ref so event listeners always invoke the latest version
  // without triggering map re-initialization on every parent re-render.
  const onMarkerClickRef = useRef<(id: string) => void>(onMarkerClick);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '';
    // Capture ref value at effect start so cleanup uses the same Map instance
    const markers = markersRef.current;

    loadKakaoSdk(appKey, () => {
      if (!containerRef.current) return;

      const center = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);

      const map = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: DEFAULT_LEVEL,
      });

      mapRef.current = map;

      cafes.forEach((cafe) => {
        if (!isValidCoordinate(cafe.lat, cafe.lng)) return;

        const position = new window.kakao.maps.LatLng(cafe.lat, cafe.lng);
        const zIndex = getMarkerZIndex(cafe.id, selectedKidsCafeId);

        const marker = new window.kakao.maps.Marker({
          position,
          map,
          zIndex,
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClickRef.current(cafe.id);
        });

        markers.set(cafe.id, marker);
      });
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      markers.clear();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes]);

  useEffect(() => {
    if (!mapRef.current || !selectedKidsCafeId) return;

    const cafe = findCafeById(selectedKidsCafeId, cafes);
    if (!cafe || !isValidCoordinate(cafe.lat, cafe.lng)) return;

    const position = new window.kakao.maps.LatLng(cafe.lat, cafe.lng);
    mapRef.current.setCenter(position);

    markersRef.current.forEach((marker, cafeId) => {
      marker.setZIndex(getMarkerZIndex(cafeId, selectedKidsCafeId));
    });
  }, [selectedKidsCafeId, cafes]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-75 rounded-xl overflow-hidden"
      aria-label="키즈카페 위치 지도"
      role="img"
    />
  );
}
