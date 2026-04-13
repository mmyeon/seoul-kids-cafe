'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import AgeFilterChips from '../../components/AgeFilterChips';
import CafeListSection from '../../components/CafeListSection';
import MobileTabBar from '../../components/MobileTabBar';
import MapCafeCard from '../../components/MapCafeCard';
const LocationBanner = dynamic(() => import('../../components/LocationBanner'), { ssr: false });
import { useGeolocation } from '../lib/useGeolocation';
import { useCafes } from '../lib/useCafes';
import { useAgeFilter, useAgeChange } from '../lib/useAgeFilter';
import { useCafeSelection } from '../lib/useCafeSelection';
import { buildCafeListItems } from '../lib/cafeListUtils';
import { isOpenToday } from '../lib/openStatus';
import type { UserLocation } from '../lib/cafeListUtils';
import KidsCafeCardSkeleton from '../../components/KidsCafeCard/Skeleton';

const KakaoMap = dynamic(() => import('../../components/KakaoMap'), { ssr: false });
const WelcomeModal = dynamic(() => import('../../components/WelcomeModal'), { ssr: false });

type Tab = 'list' | 'map';

export default function HomeClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const geolocation = useGeolocation();
  const cafesState = useCafes();
  const { selectedAges } = useAgeFilter();
  const handleAgeChange = useAgeChange();
  const { selectedCafeId, selectCafe, clearSelection } = useCafeSelection();
  const [activeTab, setActiveTab] = useState<Tab>('list');

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

  const selectedCafeItem = useMemo(
    () => cafeListItems.find((item) => item.cafe.id === selectedCafeId) ?? null,
    [cafeListItems, selectedCafeId]
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
  }

  const listContent = (
    <>
      {cafesState.status === 'loading' && (
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
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
    </>
  );

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

      {/* 모바일 탭 바 */}
      <MobileTabBar activeTab={activeTab} onChange={setActiveTab} />

      {/* 본문 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 데스크탑 전용 카드 리스트 */}
        <section
          className="hidden md:flex md:flex-col md:w-1/2 overflow-y-auto px-4 pb-4"
          aria-label="카페 목록"
        >
          {listContent}
        </section>

        {/* 모바일 목록 탭 */}
        <section
          className={`flex flex-col flex-1 overflow-y-auto px-4 pb-4 md:hidden ${activeTab !== 'list' ? 'hidden' : ''}`}
          aria-label="카페 목록"
        >
          {cafesState.status === 'loading' && (
            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
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
              scrollKey={activeTab}
            />
          )}
        </section>

        {/* 지도: 모바일 지도 탭 + 데스크탑 우측 */}
        <section
          className={`flex-1 relative md:flex px-4 pb-4 ${activeTab === 'map' ? 'flex' : 'hidden md:flex'}`}
          aria-label="지도"
        >
          <KakaoMap
            kidsCafes={filteredCafesForMap}
            selectedKidsCafeId={selectedCafeId ?? undefined}
            selectedAges={selectedAges}
            onMarkerClick={handleMarkerClick}
            onEmptyClick={clearSelection}
            userPosition={userLocation}
          />
          {/* 모바일 마커 탭 미니 카드 */}
          {selectedCafeItem && (
            <MapCafeCard
              cafe={selectedCafeItem.cafe}
              distanceKm={selectedCafeItem.distanceKm ?? undefined}
              isVisible={true}
              cafeIsOpen={isOpenToday(selectedCafeItem.cafe.operatingHours)}
              onClose={clearSelection}
            />
          )}
        </section>
      </main>
    </div>
  );
}
