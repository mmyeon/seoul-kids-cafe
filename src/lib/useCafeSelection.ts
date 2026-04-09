'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export type CafeSelectionState = {
  selectedCafeId: string | null;
  selectCafe: (id: string) => void;
  clearSelection: () => void;
};

export function useCafeSelection(): CafeSelectionState {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCafeId = searchParams.get('cafeId');

  const selectCafe = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get('cafeId') === id) {
        params.delete('cafeId');
      } else {
        params.set('cafeId', id);
      }
      router.replace(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  const clearSelection = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('cafeId');
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  return { selectedCafeId, selectCafe, clearSelection };
}
