/**
 * AgeFilterChips 컴포넌트
 *
 * 나이 필터 칩 목록을 렌더링합니다.
 * 멀티셀렉트 방식으로 동작하며, 선택된 칩은 시각적으로 강조됩니다.
 * 모바일에서 sticky 상단 고정으로 표시됩니다.
 */

import type { AgeFilter } from '../types/index';

// ============================================================
// Props 타입
// ============================================================

export interface AgeFilterChipsProps {
  selected: AgeFilter[];
  onChange: (ages: AgeFilter[]) => void;
}

// ============================================================
// 상수
// ============================================================

/**
 * 나이 필터 옵션 순서 (under12m → 1세 → ... → 7세)
 */
export const AGE_FILTER_OPTIONS: AgeFilter[] = [
  'under12m',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
];

// ============================================================
// 순수 헬퍼 함수 (테스트 가능)
// ============================================================

/**
 * AgeFilter 값을 사용자에게 표시할 한국어 레이블로 변환합니다.
 */
export function getChipLabel(filter: AgeFilter): string {
  if (filter === 'under12m') return '12개월 미만';
  return `${filter}세`;
}

/**
 * 주어진 필터가 선택된 목록에 포함되어 있는지 확인합니다.
 */
export function isChipSelected(filter: AgeFilter, selected: AgeFilter[]): boolean {
  return selected.includes(filter);
}

/**
 * 필터를 토글합니다.
 * - 선택되지 않은 필터면 목록에 추가합니다.
 * - 이미 선택된 필터면 목록에서 제거합니다.
 * 원본 배열을 변경하지 않고 새 배열을 반환합니다.
 */
export function toggleAgeFilter(filter: AgeFilter, selected: AgeFilter[]): AgeFilter[] {
  if (isChipSelected(filter, selected)) {
    return selected.filter((f) => f !== filter);
  }
  return [...selected, filter];
}

// ============================================================
// 컴포넌트
// ============================================================

export default function AgeFilterChips({ selected, onChange }: AgeFilterChipsProps) {
  const handleChipClick = (filter: AgeFilter) => {
    onChange(toggleAgeFilter(filter, selected));
  };

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
