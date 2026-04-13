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
  onShareMenuToggle,
  onShare,
  isShareMenuOpen,
  isCopied,
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
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-gray-900 line-clamp-1 min-w-0">
            {kidsCafe.name}
          </h2>

          {kidsCafe.kakaoPlaceUrl && isSafeUrl(kidsCafe.kakaoPlaceUrl) && (
            <a
              href={kidsCafe.kakaoPlaceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              ⭐️ 리뷰보기
            </a>
          )}
        </div>

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

        <div className="flex gap-2 mt-2">
          {kidsCafe.phone?.trim() && (
            <a
              href={`tel:${kidsCafe.phone.trim()}`}
              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors cursor-pointer"
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
              className="flex-1 flex items-center justify-center rounded-lg bg-blue-500 text-white text-sm font-semibold py-2 hover:bg-blue-600 transition-colors cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              🕐 이용안내
            </a>
          )}

          {onShareMenuToggle && (
            <div className="relative shrink-0">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onShareMenuToggle();
                }}
                aria-label="공유하기"
              >
                {isCopied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                )}
              </button>

              {isShareMenuOpen && (
                <div className="absolute bottom-full right-0 mb-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare?.('link');
                    }}
                  >
                    🔗 링크 복사
                  </button>
                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare?.('kakao');
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#3A1D1D" d="M12 3C6.477 3 2 6.477 2 10.8c0 2.7 1.6 5.08 4.03 6.52l-1.02 3.8a.3.3 0 0 0 .46.32l4.4-2.9c.7.1 1.42.16 2.13.16 5.523 0 10-3.477 10-7.8S17.523 3 12 3z"/>
                    </svg>
                    카카오톡
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
