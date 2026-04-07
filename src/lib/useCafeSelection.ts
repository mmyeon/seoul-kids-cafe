'use client';

import { useState, useCallback } from 'react';

export type CafeSelectionState = {
  selectedCafeId: string | null;
  selectCafe: (id: string) => void;
  clearSelection: () => void;
};

export function useCafeSelection(): CafeSelectionState {
  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(null);

  const selectCafe = useCallback((id: string) => {
    setSelectedCafeId((prev) => (prev === id ? null : id));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCafeId(null);
  }, []);

  return { selectedCafeId, selectCafe, clearSelection };
}
