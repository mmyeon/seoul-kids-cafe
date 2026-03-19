'use client';

import { useState, useCallback } from 'react';
import type { AgeFilter } from '../../types/index';
import { toggleAgeFilter } from './ageFilterChips';

export type AgeFilterState = {
  selectedAges: AgeFilter[];
  toggleAge: (age: AgeFilter) => void;
  setAges: (ages: AgeFilter[]) => void;
  clearAll: () => void;
};

export function useAgeFilter(): AgeFilterState {
  const [selectedAges, setSelectedAges] = useState<AgeFilter[]>([]);

  const toggleAge = useCallback((age: AgeFilter) => {
    setSelectedAges((prev) => toggleAgeFilter(age, prev));
  }, []);

  const setAges = useCallback((ages: AgeFilter[]) => {
    setSelectedAges(ages);
  }, []);

  const clearAll = useCallback(() => {
    setSelectedAges([]);
  }, []);

  return { selectedAges, toggleAge, setAges, clearAll };
}
