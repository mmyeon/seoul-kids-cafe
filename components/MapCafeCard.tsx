'use client';

import Image from 'next/image';
import { formatAgeRange, formatBirthYearRange, isSafeUrl } from '../src/lib/kidsCafeCard';
import type { KidsCafe } from '../types/index';

interface MapCafeCardProps {
  cafe: KidsCafe;
  isVisible: boolean;
  cafeIsOpen: boolean;
  onClose: () => void;
}

export default function MapCafeCard({ cafe, isVisible, cafeIsOpen, onClose }: MapCafeCardProps) {
  const hasValidImage = Boolean(cafe.imageUrl && isSafeUrl(cafe.imageUrl));
  const hasPhone = Boolean(cafe.phone?.trim());
  const hasDetailUrl = isSafeUrl(cafe.detailUrl);
  const ageLabel = cafe.birthYearRange
    ? formatBirthYearRange(cafe.birthYearRange)
    : formatAgeRange(cafe.ageRange);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-2px_16px_rgba(0,0,0,0.12)] md:hidden transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex gap-3 px-4 py-4">
        {/* 이미지: 카드 높이 전체 채움 */}
        <div className="relative w-32 self-stretch min-h-32.5 shrink-0 rounded-xl overflow-hidden bg-gray-100">
          {hasValidImage ? (
            <Image
              src={cafe.imageUrl}
              alt={`${cafe.name} 이미지`}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <span className="text-gray-400 text-xs">이미지 없음</span>
            </div>
          )}
          {!cafeIsOpen && (
            <span className="absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm">
              오늘 휴무
            </span>
          )}
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-1">
            <p className="text-base font-bold text-gray-900 line-clamp-1 pr-6">{cafe.name}</p>
            <p className="text-sm text-gray-500 line-clamp-1">
              <span aria-hidden="true">📍</span> {cafe.address}
            </p>
            <p className="text-sm text-gray-600">
              <span aria-hidden="true">🎂</span> {ageLabel}
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            {hasPhone && (
              <a
                href={`tel:${cafe.phone.trim()}`}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold py-2 hover:bg-gray-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                📞 문의하기
              </a>
            )}
            {hasDetailUrl && (
              <a
                href={cafe.detailUrl}
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

        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
          aria-label="닫기"
        >
          ×
        </button>
      </div>
    </div>
  );
}
