'use client';

import { useEffect, useState } from 'react';
import { Drawer } from 'vaul';
import CafeListSection from './CafeListSection';
import KidsCafeCardSkeleton from './KidsCafeCard/Skeleton';
import type { CafeListItem } from '../src/lib/cafeListUtils';

interface MobileBottomSheetProps {
  items: CafeListItem[];
  selectedCafeId: string | null;
  onCardClick: (id: string) => void;
  status: 'loading' | 'error' | 'success';
  error: string | null;
  snapTarget: 'half' | 'full' | null;
  onSnapHandled: () => void;
}

const SNAP_POINTS: (number | string)[] = [0.12, 0.5, 1];
const DEFAULT_SNAP = SNAP_POINTS[0];
const HALF_SNAP = SNAP_POINTS[1];
const FULL_SNAP = SNAP_POINTS[2];

export default function MobileBottomSheet({
  items,
  selectedCafeId,
  onCardClick,
  status,
  error,
  snapTarget,
  onSnapHandled,
}: MobileBottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(DEFAULT_SNAP);

  useEffect(() => {
    if (snapTarget === 'full') {
      setSnap(FULL_SNAP);
      onSnapHandled();
    } else if (snapTarget === 'half') {
      setSnap(HALF_SNAP);
      onSnapHandled();
    }
  }, [snapTarget, onSnapHandled]);

  return (
    <div className="md:hidden">
      <Drawer.Root
        open
        dismissible={false}
        modal={false}
        snapPoints={SNAP_POINTS}
        activeSnapPoint={snap}
        setActiveSnapPoint={(value) => setSnap(value)}
        fadeFromIndex={2}
        noBodyStyles
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/20 md:hidden" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl bg-white shadow-xl outline-none md:hidden"
            style={{ height: '96dvh' }}
            aria-describedby={undefined}
          >
            <Drawer.Title className="sr-only">카페 목록</Drawer.Title>
            <Drawer.Handle className="mx-auto mt-3 mb-2 h-1.5 w-10 rounded-full bg-gray-300" />
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {status === 'loading' && (
                <div className="grid grid-cols-1 gap-4 pt-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <KidsCafeCardSkeleton key={i} />
                  ))}
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center justify-center py-20 text-red-500">
                  <p>{error ?? '데이터를 불러오지 못했습니다.'}</p>
                </div>
              )}
              {status === 'success' && (
                <CafeListSection
                  items={items}
                  selectedCafeId={selectedCafeId}
                  onCardClick={onCardClick}
                />
              )}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
