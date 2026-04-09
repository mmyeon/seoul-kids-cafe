'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AgeFilterChips from '../../components/AgeFilterChips';
import CafeListSection from '../../components/CafeListSection';
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

type ViewMode = 'list' | 'map';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const geolocation = useGeolocation();
  const cafesState = useCafes();
  const { selectedAges } = useAgeFilter();
  const handleAgeChange = useAgeChange();
  const { selectedCafeId, selectCafe } = useCafeSelection();
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const selectedDistrict = searchParams.get('district');

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

      {/* 본문: 데스크탑은 사이드바 레이아웃, 모바일은 단일 뷰 */}
      <main className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* 카드 리스트 영역 */}
        <section
          className={`${
            viewMode === 'map' ? 'hidden' : 'flex-1'
          } overflow-y-auto p-2 md:flex md:flex-col md:w-1/2`}
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

        {/* 지도 영역 */}
        <section
          className={`${viewMode === 'list' ? 'hidden' : 'flex-1'} md:flex md:flex-1 md:w-1/2`}
          aria-label="지도"
        >
          <KakaoMap
            kidsCafes={filteredCafesForMap}
            selectedKidsCafeId={selectedCafeId ?? undefined}
            selectedAges={selectedAges}
            onMarkerClick={selectCafe}
            isVisible={viewMode === 'map'}
          />
        </section>
      </main>

      {/* 모바일 FAB: 목록/지도 전환 */}
      <button
        type="button"
        onClick={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
        className="md:hidden fixed bottom-6 right-6 z-20 flex items-center gap-2 bg-blue-500 text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
        aria-label={viewMode === 'list' ? '지도 보기' : '목록 보기'}
      >
        {viewMode === 'list' ? '지도 보기' : '목록 보기'}
      </button>
    </div>
  );
}
