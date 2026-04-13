'use client';

import { useEffect, useRef } from 'react';
import KidsCafeCard from './KidsCafeCard';
import type { CafeListItem } from '../src/lib/cafeListUtils';
import { isOpenToday } from '../src/lib/openStatus';
import { useShareMenu } from '../src/lib/useShareMenu';

export interface CafeListSectionProps {
  items: CafeListItem[];
  selectedCafeId: string | null;
  onCardClick: (id: string) => void;
  scrollKey?: string;
}

export default function CafeListSection({
  items,
  selectedCafeId,
  onCardClick,
  scrollKey,
}: CafeListSectionProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const { openMenuId, toggleMenu, closeMenu, copiedId, copyLink, shareKakao } = useShareMenu();

  useEffect(() => {
    if (!selectedCafeId || !listRef.current) return;

    const cardEl = listRef.current.querySelector(`[data-cafe-id="${selectedCafeId}"]`);
    cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedCafeId, scrollKey]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-base">표시할 카페가 없습니다.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map(({ cafe, matchStatus, distanceKm }) => (
        <div key={cafe.id} data-cafe-id={cafe.id}>
          <KidsCafeCard
            kidsCafe={cafe}
            matchStatus={matchStatus}
            distanceKm={distanceKm ?? undefined}
            isOpen={isOpenToday(cafe.operatingHours)}
            onClick={() => { closeMenu(); onCardClick(cafe.id); }}
            isSelected={selectedCafeId === cafe.id}
            onShareMenuToggle={() => toggleMenu(cafe.id)}
            onShare={(action) =>
              action === 'link'
                ? copyLink(cafe.id)
                : shareKakao(cafe.id)
            }
            isShareMenuOpen={openMenuId === cafe.id}
            isCopied={copiedId === cafe.id}
          />
        </div>
      ))}
    </div>
  );
}
