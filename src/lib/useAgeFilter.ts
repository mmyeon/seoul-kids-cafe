'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { AgeFilter } from '../../types/index';
import { toggleAgeFilter } from './ageFilterChips';

export type AgeFilterState = {
  selectedAges: AgeFilter[];
  toggleAge: (age: AgeFilter) => void;
  setAges: (ages: AgeFilter[]) => void;
  clearAll: () => void;
};

export function useAgeFilter(): AgeFilterState {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ages = searchParams.get('ages');

  const selectedAges: AgeFilter[] = ages ? (ages.split(',') as AgeFilter[]) : [];

  const updateUrl = useCallback(
    (ages: AgeFilter[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (ages.length === 0) {
        params.delete('ages');
      } else {
        params.set('ages', ages.join(','));
      }
      router.replace('?' + params.toString());
    },
    [searchParams, router]
  );

  const toggleAge = useCallback(
    (age: AgeFilter) => {
      const next = toggleAgeFilter(age, selectedAges);
      updateUrl(next);
    },
    [selectedAges, updateUrl]
  );

  const setAges = useCallback(
    (ages: AgeFilter[]) => {
      updateUrl(ages);
    },
    [updateUrl]
  );

  const clearAll = useCallback(() => {
    updateUrl([]);
  }, [updateUrl]);

  return { selectedAges, toggleAge, setAges, clearAll };
}

export function useAgeChange(): (ages: AgeFilter[]) => void {
  const searchParams = useSearchParams();
  const router = useRouter();

  return useCallback(
    (ages: AgeFilter[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (ages.length === 0) {
        params.delete('ages');
      } else {
        params.set('ages', ages.join(','));
      }
      params.delete('cafeId');
      router.replace('?' + params.toString());
    },
    [searchParams, router]
  );
}
