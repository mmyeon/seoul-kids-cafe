'use client';

const SEOUL_DISTRICTS = [
  '강남구', '강동구', '강북구', '강서구', '관악구',
  '광진구', '구로구', '금천구', '노원구', '도봉구',
  '동대문구', '동작구', '마포구', '서대문구', '서초구',
  '성동구', '성북구', '송파구', '양천구', '영등포구',
  '용산구', '은평구', '종로구', '중구', '중랑구',
];

export interface DistrictFallbackProps {
  selectedDistrict: string | null;
  onSelect: (district: string) => void;
}

export default function DistrictFallback({ selectedDistrict, onSelect }: DistrictFallbackProps) {
  return (
    <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
      <p className="text-sm text-amber-800 mb-2 font-medium">
        위치 권한이 거부되었습니다. 자치구를 선택해주세요.
      </p>
      <select
        className="w-full text-sm border border-amber-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
        value={selectedDistrict ?? ''}
        onChange={(e) => onSelect(e.target.value)}
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
