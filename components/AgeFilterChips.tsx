'use client';

import { useCallback } from 'react';
import type { AgeFilter } from '../types/index';
import {
  AGE_FILTER_OPTIONS,
  getChipLabel,
  isChipSelected,
  toggleAgeFilter,
} from '../src/lib/ageFilterChips';

export { AGE_FILTER_OPTIONS, getChipLabel, isChipSelected, toggleAgeFilter };

export interface AgeFilterChipsProps {
  selected: AgeFilter[];
  onChange: (ages: AgeFilter[]) => void;
}

export default function AgeFilterChips({ selected, onChange }: AgeFilterChipsProps) {
  const handleChipClick = useCallback(
    (filter: AgeFilter) => {
      onChange(toggleAgeFilter(filter, selected));
    },
    [onChange, selected]
  );

  return (
    <div className="sticky top-0 z-10 bg-white py-3 px-4 overflow-x-auto">
      <div className="flex gap-2 min-w-max">
        {AGE_FILTER_OPTIONS.map((filter) => {
          const active = isChipSelected(filter, selected);
          return (
            <button
              key={filter}
              type="button"
              onClick={() => handleChipClick(filter)}
              aria-pressed={active}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap',
                active
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-500',
              ].join(' ')}
            >
              {getChipLabel(filter)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
