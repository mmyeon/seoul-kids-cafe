'use client';

import { useEffect, useRef } from 'react';
import KidsCafeCard from './KidsCafeCard';
import type { CafeListItem } from '../src/lib/cafeListUtils';
import { isOpenToday } from '../src/lib/openStatus';

export interface CafeListSectionProps {
  items: CafeListItem[];
  selectedCafeId: string | null;
  onCardClick: (id: string) => void;
}

export default function CafeListSection({
  items,
  selectedCafeId,
  onCardClick,
}: CafeListSectionProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedCafeId || !listRef.current) return;

    const cardEl = listRef.current.querySelector(`[data-cafe-id="${selectedCafeId}"]`);
    cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedCafeId]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-base">표시할 카페가 없습니다.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
      {items.map(({ cafe, matchStatus, distanceKm }) => (
        <div
          key={cafe.id}
          data-cafe-id={cafe.id}
          className={`transition-all duration-200 ${
            selectedCafeId === cafe.id ? 'ring-2 ring-blue-500 rounded-2xl' : ''
          }`}
        >
          <KidsCafeCard
            kidsCafe={cafe}
            matchStatus={matchStatus}
            distanceKm={distanceKm ?? undefined}
            isOpen={isOpenToday(cafe.operatingHours)}
            onClick={() => onCardClick(cafe.id)}
          />
        </div>
      ))}
    </div>
  );
}
