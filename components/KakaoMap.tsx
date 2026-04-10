'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
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
  const pendingCenterRef = useRef<InstanceType<typeof window.kakao.maps.LatLng> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);

  useEffect(() => {
    return () => {
      mapRef.current = null;
    };
  }, []);

  function handleSdkLoad() {
    window.kakao.maps.load(() => {
      if (!containerRef.current) return;
      const center = new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
      const map = new window.kakao.maps.Map(containerRef.current, {
        center,
        level: DEFAULT_LEVEL,
      });
      mapRef.current = map;
      setMapReady(true);
    });
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      mapRef.current?.relayout();
      if (pendingCenterRef.current) {
        mapRef.current?.setCenter(pendingCenterRef.current);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const markers = markersRef.current;

    markers.forEach((marker) => marker.setMap(null));
    markers.clear();

    kidsCafes.forEach((kidsCafe) => {
      if (!isValidCoordinate(kidsCafe.lat, kidsCafe.lng)) return;

      const position = new window.kakao.maps.LatLng(kidsCafe.lat, kidsCafe.lng);
      const zIndex = getMarkerZIndex(kidsCafe.id, selectedKidsCafeId);
      const initialState = getMarkerState(kidsCafe.id, selectedKidsCafeId, selectedAges, kidsCafe);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, kidsCafes]);

  // Effect 3: 선택된 카페 변경 시 지도 이동 및 마커 상태 업데이트
  useEffect(() => {
    if (!mapRef.current) return;

    if (selectedKidsCafeId) {
      const kidsCafe = findKidsCafeById(selectedKidsCafeId, kidsCafes);
      if (kidsCafe && isValidCoordinate(kidsCafe.lat, kidsCafe.lng)) {
        const position = new window.kakao.maps.LatLng(kidsCafe.lat, kidsCafe.lng);
        pendingCenterRef.current = position;
        mapRef.current.setLevel(SELECTED_ZOOM_LEVEL);
        mapRef.current.setCenter(position);
      }
    } else {
      pendingCenterRef.current = null;
    }

    markersRef.current.forEach((marker, cafeId) => {
      const cafe = findKidsCafeById(cafeId, kidsCafes);
      if (!cafe) return;

      const state = getMarkerState(cafeId, selectedKidsCafeId, selectedAges, cafe);
      marker.setImage(buildMarkerImage(state));
      marker.setZIndex(getMarkerZIndex(cafeId, selectedKidsCafeId));
    });
  }, [mapReady, selectedKidsCafeId, kidsCafes]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker, cafeId) => {
      const cafe = findKidsCafeById(cafeId, kidsCafes);
      if (!cafe) return;

      const state = getMarkerState(cafeId, selectedKidsCafeId, selectedAges, cafe);

      if (selectedAges.length > 0 && state === 'default') {
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
    <>
      <Script
        id="kakao-maps-sdk"
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`}
        onLoad={handleSdkLoad}
        onError={() => setSdkError(true)}
      />

      {sdkError ? (
        <div className="w-full h-full min-h-75 rounded-xl flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          지도를 불러오지 못했습니다.
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full h-full min-h-75 rounded-xl overflow-hidden"
          aria-label="키즈카페 위치 지도"
          role="img"
        />
      )}
    </>
  );
}
