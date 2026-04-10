'use client';

import Image from 'next/image';
import { formatAgeRange, formatBirthYearRange, isSafeUrl } from '../src/lib/kidsCafeCard';
import type { KidsCafe } from '../types/index';

const ImagePlaceholder = (
  <div className="w-28 h-28 rounded-lg bg-gray-200" aria-hidden="true" />
);

interface MapCafeCardProps {
  cafe: KidsCafe;
  distanceKm?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MapCafeCard({ cafe, distanceKm: _distanceKm, isOpen, onClose }: MapCafeCardProps) {
  const hasValidImage = Boolean(cafe.imageUrl && isSafeUrl(cafe.imageUrl));
  const hasPhone = Boolean(cafe.phone?.trim());
  const hasDetailUrl = isSafeUrl(cafe.detailUrl);
  const ageLabel = cafe.birthYearRange
    ? formatBirthYearRange(cafe.birthYearRange)
    : formatAgeRange(cafe.ageRange);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white shadow-[0_-2px_16px_rgba(0,0,0,0.12)] md:hidden transition-transform duration-300 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="px-4 py-3">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="닫기"
        >
          ×
        </button>

        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {hasValidImage ? (
              <Image
                src={cafe.imageUrl}
                alt={cafe.name}
                width={112}
                height={112}
                className="rounded-lg object-cover"
              />
            ) : (
              ImagePlaceholder
            )}
          </div>

          <div className="flex flex-col justify-between flex-1 min-w-0">
            <div className="space-y-0.5">
              <p className="font-bold text-gray-900 truncate">{cafe.name}</p>
              <p className="text-sm text-gray-500 truncate">
                <span aria-hidden="true">📍</span> {cafe.address}
              </p>
              <p className="text-sm text-gray-600">
                <span aria-hidden="true">🎂</span> {ageLabel}
              </p>
            </div>

            <div className="flex gap-2 mt-2">
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
        </div>
      </div>
    </div>
  );
}
