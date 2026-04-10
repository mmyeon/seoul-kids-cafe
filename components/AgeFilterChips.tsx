'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
      setCanScrollLeft(el.scrollLeft > 0);
    };

    const id = requestAnimationFrame(checkScroll);
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      cancelAnimationFrame(id);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleChipClick = useCallback(
    (filter: AgeFilter) => {
      onChange(toggleAgeFilter(filter, selected));
    },
    [onChange, selected]
  );

  return (
    <div className="top-0 z-10 bg-white sticky">
      <div ref={scrollRef} className="py-3 px-4 overflow-x-auto">
        <div className="w-fit min-w-max">
          <div className="flex gap-2">
            {AGE_FILTER_OPTIONS.map((filter) => {
              const active = isChipSelected(filter, selected);
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => handleChipClick(filter)}
                  aria-pressed={active}
                  className={[
                    'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap cursor-pointer',
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
          {selected.length === 0 && (
            <div className="relative mt-2">
              <div className="absolute -top-1.5 left-5 w-3 h-3 bg-blue-50 border-l border-t border-blue-200 rotate-45" />
              <div className="bg-blue-50 border border-blue-200 text-blue-600 text-xs px-3 py-2 rounded-lg">
                아이 나이를 모두 선택해주세요! (여러 개 선택 가능)
              </div>
            </div>
          )}
        </div>
      </div>
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-linear-to-r from-white to-transparent z-20" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-linear-to-l from-white to-transparent z-20" />
      )}
    </div>
  );
}
