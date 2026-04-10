'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AgeFilterChips from '../../components/AgeFilterChips';
import CafeListSection from '../../components/CafeListSection';
import MobileBottomSheet from '../../components/MobileBottomSheet';
const LocationBanner = dynamic(() => import('../../components/LocationBanner'), { ssr: false });
import { useGeolocation } from '../lib/useGeolocation';
import { useCafes } from '../lib/useCafes';
import { useAgeFilter, useAgeChange } from '../lib/useAgeFilter';
import { useCafeSelection } from '../lib/useCafeSelection';
import { buildCafeListItems } from '../lib/cafeListUtils';
import type { UserLocation } from '../lib/cafeListUtils';
import KidsCafeCardSkeleton from '../../components/KidsCafeCard/Skeleton';

// KakaoMap은 SSR 불가 컴포넌트이므로 dynamic import 사용
const KakaoMap = dynamic(() => import('../../components/KakaoMap'), { ssr: false });
const WelcomeModal = dynamic(() => import('../../components/WelcomeModal'), { ssr: false });

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const geolocation = useGeolocation();
  const cafesState = useCafes();
  const { selectedAges } = useAgeFilter();
  const handleAgeChange = useAgeChange();
  const { selectedCafeId, selectCafe } = useCafeSelection();
  const [snapTarget, setSnapTarget] = useState<'half' | 'full' | null>(null);
  const prevAgesRef = useRef(selectedAges);

  const selectedDistrict = searchParams.get('district');

  // 나이 필터 변경 시 바텀 시트 반열림
  useEffect(() => {
    const prev = prevAgesRef.current;
    if (prev.length === 0 && selectedAges.length > 0) {
      setSnapTarget('half');
    }
    prevAgesRef.current = selectedAges;
  }, [selectedAges]);

  function setDistrict(value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('district', value);
    } else {
      params.delete('district');
    }
    router.replace('?' + params.toString());
  }

  const userLocation = useMemo((): UserLocation | null => {
    if (geolocation.status === 'granted' && geolocation.position !== null) {
      return geolocation.position;
    }
    return null;
  }, [geolocation.status, geolocation.position]);

  const cafeListItems = useMemo(
    () => buildCafeListItems(cafesState.cafes, selectedAges, userLocation, selectedDistrict),
    [cafesState.cafes, selectedAges, userLocation, selectedDistrict]
  );

  const filteredCafesForMap = useMemo(
    () =>
      selectedDistrict
        ? cafesState.cafes.filter((cafe) => cafe.address.includes(selectedDistrict))
        : cafesState.cafes,
    [cafesState.cafes, selectedDistrict]
  );

  function handleRequestPermission() {
    setDistrict(null);
    geolocation.requestPermission();
  }

  function handleChangeDistrict() {
    setDistrict(null);
  }

  function handleMarkerClick(id: string) {
    selectCafe(id);
    setSnapTarget('full');
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <WelcomeModal />
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">서울형 키즈카페 목록</h1>
      </header>

      {/* 위치 배너 */}
      <LocationBanner
        status={geolocation.status}
        selectedDistrict={selectedDistrict}
        districts={cafesState.districts}
        onRequestPermission={handleRequestPermission}
        onSelectDistrict={setDistrict}
        onChangeDistrict={handleChangeDistrict}
      />

      {/* 나이 필터 (sticky) */}
      <AgeFilterChips selected={selectedAges} onChange={handleAgeChange} />

      {/* 본문: 데스크탑은 사이드바 레이아웃, 모바일은 지도 전체화면 */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* 데스크탑 전용 카드 리스트 */}
        <section
          className="hidden md:flex md:flex-col md:w-1/2 overflow-y-auto p-2"
          aria-label="카페 목록"
        >
          {cafesState.status === 'loading' && (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <KidsCafeCardSkeleton key={i} />
              ))}
            </div>
          )}
          {cafesState.status === 'error' && (
            <div className="flex items-center justify-center py-20 text-red-500">
              <p>{cafesState.error ?? '데이터를 불러오지 못했습니다.'}</p>
            </div>
          )}
          {cafesState.status === 'success' && (
            <CafeListSection
              items={cafeListItems}
              selectedCafeId={selectedCafeId}
              onCardClick={selectCafe}
            />
          )}
        </section>

        {/* 지도: 모바일 전체화면 / 데스크탑 절반 */}
        <section className="flex-1 md:w-1/2" aria-label="지도">
          <KakaoMap
            kidsCafes={filteredCafesForMap}
            selectedKidsCafeId={selectedCafeId ?? undefined}
            selectedAges={selectedAges}
            onMarkerClick={handleMarkerClick}
          />
        </section>
      </main>

      {/* 모바일 전용 바텀 시트 */}
      <MobileBottomSheet
        items={cafeListItems}
        selectedCafeId={selectedCafeId}
        onCardClick={selectCafe}
        status={cafesState.status}
        error={cafesState.error ?? null}
        snapTarget={snapTarget}
        onSnapHandled={() => setSnapTarget(null)}
      />
    </div>
  );
}
