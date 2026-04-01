'use client';

import { useEffect, useRef } from 'react';
import type {
  KakaoMapProps,
  KakaoMapInstance,
  KakaoMarker,
  KakaoMarkerImage,
} from '../types/kakao-map';
import {
  isValidCoordinate,
  findKidsCafeById,
  getMarkerZIndex,
  loadKakaoSdk,
  createMarkerImageUrl,
  getMarkerState,
  type MarkerState,
} from '../src/lib/kakao-map-utils';

export type { KakaoMapProps };

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청
const DEFAULT_LEVEL = 8;

const MARKER_COLOR = '#3B82F6';
const MARKER_SIZE = { normal: { w: 20, h: 29 }, selected: { w: 26, h: 38 } } as const;
const SELECTED_ZOOM_LEVEL = 4;

function buildMarkerImage(state: MarkerState): KakaoMarkerImage {
  const isSelected = state === 'selected';
  const color = MARKER_COLOR;
  const { w, h } = isSelected ? MARKER_SIZE.selected : MARKER_SIZE.normal;

  const src = createMarkerImageUrl(color, isSelected);
  const size = new window.kakao.maps.Size(w, h);
  const offset = new window.kakao.maps.Point(w / 2, h);

  return new window.kakao.maps.MarkerImage(src, size, { offset });
}

export default function KakaoMap({
  kidsCafes,
  selectedKidsCafeId,
  selectedAges,
  onMarkerClick,
}: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());

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

      kidsCafes.forEach((kidsCafe) => {
        if (!isValidCoordinate(kidsCafe.lat, kidsCafe.lng)) return;

        const position = new window.kakao.maps.LatLng(kidsCafe.lat, kidsCafe.lng);
        const zIndex = getMarkerZIndex(kidsCafe.id, selectedKidsCafeId);
        const initialState = getMarkerState(
          kidsCafe.id,
          selectedKidsCafeId,
          selectedAges,
          kidsCafe
        );

        const marker = new window.kakao.maps.Marker({
          position,
          map,
          zIndex,
          image: buildMarkerImage(initialState),
        });

        window.kakao.maps.event.addListener(marker, 'click', () => {
          onMarkerClick(kidsCafe.id);
        });

        markers.set(kidsCafe.id, marker);
      });
    });

    return () => {
      markers.forEach((marker) => marker.setMap(null));
      markers.clear();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsCafes]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedKidsCafeId) {
      const kidsCafe = findKidsCafeById(selectedKidsCafeId, kidsCafes);
      if (kidsCafe && isValidCoordinate(kidsCafe.lat, kidsCafe.lng)) {
        const position = new window.kakao.maps.LatLng(kidsCafe.lat, kidsCafe.lng);
        mapRef.current.setLevel(SELECTED_ZOOM_LEVEL);
        mapRef.current.setCenter(position);
      }
    }

    markersRef.current.forEach((marker, cafeId) => {
      const cafe = findKidsCafeById(cafeId, kidsCafes);
      if (!cafe) return;

      const state = getMarkerState(cafeId, selectedKidsCafeId, selectedAges, cafe);
      marker.setImage(buildMarkerImage(state));
      marker.setZIndex(getMarkerZIndex(cafeId, selectedKidsCafeId));
    });
  }, [selectedKidsCafeId, kidsCafes]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker, cafeId) => {
      const cafe = findKidsCafeById(cafeId, kidsCafes);
      if (!cafe) return;

      const state = getMarkerState(cafeId, selectedKidsCafeId, selectedAges, cafe);

      if (selectedAges.length > 0 && state !== 'matching') {
        marker.setMap(null);
      } else {
        marker.setMap(mapRef.current);
        marker.setImage(buildMarkerImage(state));
      }

      marker.setZIndex(getMarkerZIndex(cafeId, selectedKidsCafeId));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAges]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-75 rounded-xl overflow-hidden"
      aria-label="키즈카페 위치 지도"
      role="img"
    />
  );
}
