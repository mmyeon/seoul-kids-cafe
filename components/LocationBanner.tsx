'use client';

import type { GeolocationStatus } from '../src/lib/useGeolocation';

const SEOUL_DISTRICTS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

interface LocationBannerProps {
  status: GeolocationStatus;
  selectedDistrict: string | null;
  onRequestPermission: () => void;
  onSelectDistrict: (district: string) => void;
  onChangeDistrict: () => void;
}

export default function LocationBanner({
  status,
  selectedDistrict,
  onRequestPermission,
  onSelectDistrict,
  onChangeDistrict,
}: LocationBannerProps) {
  if (status === 'granted') return null;

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-3">
        <span className="text-base">📍</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-blue-800">
            현재 위치에서 가까운 카페를 먼저 볼 수 있어요
          </p>
          <p className="text-xs text-blue-600">위치 권한을 허용하면 거리순으로 정렬돼요</p>
        </div>
        {status === 'loading' ? (
          <span className="text-xs text-blue-600">위치 확인 중...</span>
        ) : (
          <button
            onClick={onRequestPermission}
            className="shrink-0 bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-md"
          >
            허용
          </button>
        )}
      </div>
    );
  }

  // denied, error, unsupported
  if (selectedDistrict) {
    return (
      <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center gap-3">
        <span className="text-base">🏘️</span>
        <div className="flex-1">
          <p className="text-xs text-amber-700">현재 지역</p>
          <p className="text-sm font-bold text-amber-900">{selectedDistrict}</p>
        </div>
        <button
          onClick={onChangeDistrict}
          className="shrink-0 bg-white text-amber-800 border border-amber-300 text-xs px-3 py-1.5 rounded-md"
        >
          변경
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-base">⚠️</span>
        <div>
          <p className="text-sm font-semibold text-amber-800">위치 권한이 거부됐어요</p>
          <p className="text-xs text-amber-700">
            자치구를 선택하면 해당 지역 카페를 먼저 볼 수 있어요
          </p>
        </div>
      </div>
      <select
        className="w-full text-sm border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
        value=""
        onChange={(e) => onSelectDistrict(e.target.value)}
        aria-label="자치구 선택"
      >
        <option value="" disabled>
          자치구 선택
        </option>
        {SEOUL_DISTRICTS.map((district) => (
          <option key={district} value={district}>
            {district}
          </option>
        ))}
      </select>
    </div>
  );
}
