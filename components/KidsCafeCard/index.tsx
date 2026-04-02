import Image from 'next/image';
import type { KidsCafeCardProps } from '../../src/lib/kidsCafeCard';
import {
  formatAgeRange,
  formatBirthYearRange,
  formatDistance,
  getCardOpacity,
  isSafeUrl,
} from '../../src/lib/kidsCafeCard';

export type { KidsCafeCardProps };
export { formatAgeRange, formatBirthYearRange, formatDistance, getCardOpacity, isSafeUrl };

export default function KidsCafeCard({
  kidsCafe,
  matchStatus,
  distanceKm,
  isOpen,
  onClick,
  isSelected,
}: KidsCafeCardProps) {
  const opacityClass = getCardOpacity(matchStatus);
  const distance = formatDistance(distanceKm);
  const ageLabel = kidsCafe.birthYearRange
    ? formatBirthYearRange(kidsCafe.birthYearRange)
    : formatAgeRange(kidsCafe.ageRange);

  return (
    <article
      className={`rounded-2xl bg-white shadow-sm overflow-hidden cursor-pointer ${opacityClass} border-2 ${
        isSelected ? 'border-blue-500' : 'border-gray-200'
      }`}
      onClick={onClick}
      aria-label={kidsCafe.name}
    >
      <div className="relative h-45 bg-gray-100">
        {kidsCafe.imageUrl ? (
          <Image
            src={kidsCafe.imageUrl}
            alt={`${kidsCafe.name} 이미지`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
            quality={60}
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
        {!isOpen && (
          <span className="absolute top-2 left-2 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm bg-red-500 text-white">
            오늘 휴무
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
          {ageLabel}
        </p>

        <p className="text-sm text-gray-600">
          <span aria-hidden="true">⏰ </span>
          {kidsCafe.operatingHours}
        </p>

        {kidsCafe.kakaoPlaceUrl && isSafeUrl(kidsCafe.kakaoPlaceUrl) && (
          <a
            href={kidsCafe.kakaoPlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-yellow-600 font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            ⭐ 카카오맵에서 리뷰 보기 →
          </a>
        )}

        <div className="flex gap-2 mt-2">
          {kidsCafe.phone?.trim() && (
            <a
              href={`tel:${kidsCafe.phone.trim()}`}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              📞 문의하기
            </a>
          )}

          {isSafeUrl(kidsCafe.detailUrl) && (
            <a
              href={kidsCafe.detailUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center rounded-lg bg-blue-500 text-white text-sm font-semibold py-2 hover:bg-blue-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              🕐 이용안내
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
