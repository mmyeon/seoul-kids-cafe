import type { KidsCafeCardProps } from '../../src/lib/kidsCafeCard';
import {
  formatAgeRange,
  formatDistance,
  formatParking,
  getCardOpacity,
  shouldShowPartialBadge,
  isSafeUrl,
} from '../../src/lib/kidsCafeCard';

export type { KidsCafeCardProps };
export {
  formatAgeRange,
  formatDistance,
  formatParking,
  getCardOpacity,
  shouldShowPartialBadge,
  isSafeUrl,
};

export default function KidsCafeCard({
  kidsCafe,
  matchStatus,
  distanceKm,
  isOpen,
  onClick,
}: KidsCafeCardProps) {
  const opacityClass = getCardOpacity(matchStatus);
  const showPartialBadge = shouldShowPartialBadge(matchStatus);
  const distance = formatDistance(distanceKm);
  const ageLabel = formatAgeRange(kidsCafe.ageRange);
  const parkingLabel = formatParking(kidsCafe.parking);

  return (
    <article
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden cursor-pointer ${opacityClass}`}
      onClick={onClick}
      aria-label={kidsCafe.name}
    >
      <div className="relative">
        {kidsCafe.imageUrl ? (
          <img
            src={kidsCafe.imageUrl}
            alt={`${kidsCafe.name} 이미지`}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div
            className="w-full h-40 bg-gray-100 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-gray-400 text-sm">이미지 없음</span>
          </div>
        )}
        {distance && (
          <span className="absolute top-2 right-2 bg-black/70 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {distance}
          </span>
        )}
        {showPartialBadge && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            부분 매칭
          </span>
        )}
      </div>

      <div className="p-4 space-y-1.5">
        <h2 className="text-base font-bold text-gray-900 line-clamp-1">{kidsCafe.name}</h2>

        <p className="text-sm text-gray-500 line-clamp-1">
          <span aria-hidden="true">📍 </span>
          {kidsCafe.address}
        </p>

        <p className="text-sm text-gray-600">
          <span aria-hidden="true">🎂 </span>
          {ageLabel} (연 나이)
        </p>

        <p className="text-sm text-gray-600">
          <span aria-hidden="true">⏰ </span>
          {kidsCafe.operatingHours}
          {!isOpen && (
            <span className="inline-block bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
              오늘 휴무
            </span>
          )}
        </p>

        <p className="text-sm text-gray-600">
          <span aria-hidden="true">🅿️ </span>
          {parkingLabel}
        </p>

        {kidsCafe.kakaoPlaceUrl && isSafeUrl(kidsCafe.kakaoPlaceUrl) && (
          <a
            href={kidsCafe.kakaoPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            ⭐ 카카오 리뷰 보기 →
          </a>
        )}

        {kidsCafe.reservationUrl && isSafeUrl(kidsCafe.reservationUrl) && (
          <a
            href={kidsCafe.reservationUrl}
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
