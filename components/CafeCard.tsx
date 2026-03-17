/**
 * CafeCard 컴포넌트
 *
 * 키즈카페 정보를 카드 형태로 표시합니다.
 * 매칭 상태, 이미지, 거리, 연령대, 운영시간, 주차 정보 등을 렌더링합니다.
 */

import type { KidsCafe, MatchStatus } from '../types/index';

// ============================================================
// Props 타입
// ============================================================

export interface CafeCardProps {
  cafe: KidsCafe;
  matchStatus: MatchStatus;
  distanceKm?: number;
  isOpen: boolean;
  onClick?: () => void;
}

// ============================================================
// 순수 헬퍼 함수 (테스트 가능)
// ============================================================

/**
 * 연령 범위를 사람이 읽기 쉬운 문자열로 변환합니다.
 * minAge가 0이면 "0-12개월"을 앞에 포함합니다.
 * 이후 세 단위(12개월 = 1세)로 표시합니다.
 */
export function formatAgeRange(ageRange: KidsCafe['ageRange']): string {
  const { minAge, maxAge } = ageRange;
  const parts: string[] = [];

  if (minAge === 0) {
    parts.push('0-12개월');
  }

  const startAgeYears = minAge === 0 ? 1 : Math.floor(minAge / 12);
  const endAgeYears = Math.floor(maxAge / 12);

  if (startAgeYears === endAgeYears) {
    parts.push(`${startAgeYears}세`);
  } else if (startAgeYears <= endAgeYears) {
    for (let age = startAgeYears; age <= endAgeYears; age++) {
      parts.push(`${age}세`);
    }
  }

  return parts.join(', ');
}

/**
 * 거리(km)를 소수 한 자리 문자열로 변환합니다.
 * undefined이면 빈 문자열을 반환합니다.
 */
export function formatDistance(distanceKm: number | undefined): string {
  if (distanceKm === undefined) return '';
  return `${distanceKm.toFixed(1)}km`;
}

/**
 * 주차 가능 여부를 한국어 레이블로 변환합니다.
 */
export function formatParking(parking: KidsCafe['parking']): string {
  if (parking === 'available') return '주차 가능';
  if (parking === 'unavailable') return '주차 불가';
  return '주차 정보 없음';
}

/**
 * 매칭 상태에 따른 Tailwind opacity 클래스를 반환합니다.
 */
export function getCardOpacity(matchStatus: MatchStatus): string {
  if (matchStatus === 'full') return 'opacity-100';
  if (matchStatus === 'partial') return 'opacity-50';
  return 'opacity-30';
}

/**
 * 부분 매칭 배지를 표시해야 하는지 여부를 반환합니다.
 */
export function shouldShowPartialBadge(matchStatus: MatchStatus): boolean {
  return matchStatus === 'partial';
}

/**
 * URL이 안전한 https:// 프로토콜로 시작하는지 검증합니다.
 * 안전하지 않은 URL(javascript:, data: 등)을 차단합니다.
 */
export function isSafeUrl(url: string): boolean {
  return url.startsWith('https://') || url.startsWith('http://');
}

// ============================================================
// 컴포넌트
// ============================================================

const PLACEHOLDER_IMAGE = '/placeholder-cafe.png';

export default function CafeCard({
  cafe,
  matchStatus,
  distanceKm,
  isOpen,
  onClick,
}: CafeCardProps) {
  const opacityClass = getCardOpacity(matchStatus);
  const showPartialBadge = shouldShowPartialBadge(matchStatus);
  const distance = formatDistance(distanceKm);
  const ageLabel = formatAgeRange(cafe.ageRange);
  const parkingLabel = formatParking(cafe.parking);
  const imageSrc = cafe.imageUrl ?? PLACEHOLDER_IMAGE;

  return (
    <article
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden cursor-pointer ${opacityClass}`}
      onClick={onClick}
      aria-label={cafe.name}
    >
      {/* 이미지 + 거리 */}
      <div className="relative">
        <img
          src={imageSrc}
          alt={cafe.imageUrl ? `${cafe.name} 이미지` : '이미지 없음'}
          className="w-full h-40 object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
          }}
        />
        {distance && (
          <span className="absolute top-2 right-2 bg-white/80 text-xs font-medium px-2 py-0.5 rounded-full">
            {distance}
          </span>
        )}
        {showPartialBadge && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            부분 매칭
          </span>
        )}
      </div>

      {/* 카드 본문 */}
      <div className="p-4 space-y-1.5">
        {/* 카페명 */}
        <h2 className="text-base font-bold text-gray-900 line-clamp-1">{cafe.name}</h2>

        {/* 주소 */}
        <p className="text-sm text-gray-500 line-clamp-1">
          <span aria-hidden="true">📍 </span>
          {cafe.address}
        </p>

        {/* 연령대 */}
        <p className="text-sm text-gray-600">
          <span aria-hidden="true">🎂 </span>
          {ageLabel} 이용 가능
        </p>

        {/* 운영시간 + 오늘 휴무 배지 */}
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <span aria-hidden="true">⏰ </span>
          {cafe.operatingHours}
          {!isOpen && (
            <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              오늘 휴무
            </span>
          )}
        </p>

        {/* 주차 */}
        <p className="text-sm text-gray-600">
          <span aria-hidden="true">🅿️ </span>
          {parkingLabel}
        </p>

        {/* 네이버/카카오 리뷰 링크 */}
        {cafe.kakaoPlaceUrl && isSafeUrl(cafe.kakaoPlaceUrl) && (
          <a
            href={cafe.kakaoPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            ⭐ 카카오 리뷰 보기 →
          </a>
        )}

        {/* 예약하기 버튼 */}
        {cafe.reservationUrl && isSafeUrl(cafe.reservationUrl) && (
          <a
            href={cafe.reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full text-center rounded-lg bg-blue-500 text-white text-sm font-semibold py-2 hover:bg-blue-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            예약하기
          </a>
        )}
      </div>
    </article>
  );
}
