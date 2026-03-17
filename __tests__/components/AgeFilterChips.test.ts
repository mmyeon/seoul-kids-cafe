/**
 * AgeFilterChips 컴포넌트 헬퍼 함수 테스트
 *
 * AgeFilterChips 컴포넌트에서 사용하는 순수 함수들을 테스트합니다.
 * jest 환경(node)에서 React 컴포넌트 렌더링 없이 로직을 검증합니다.
 */

import {
  toggleAgeFilter,
  getChipLabel,
  isChipSelected,
  AGE_FILTER_OPTIONS,
} from '../../components/AgeFilterChips';
import type { AgeFilter } from '../../types/index';

// ============================================================
// AGE_FILTER_OPTIONS 테스트
// ============================================================

describe('AGE_FILTER_OPTIONS', () => {
  it('8개의 나이 필터 옵션을 포함해야 한다', () => {
    expect(AGE_FILTER_OPTIONS).toHaveLength(8);
  });

  it('첫 번째 옵션은 under12m이어야 한다', () => {
    expect(AGE_FILTER_OPTIONS[0]).toBe('under12m');
  });

  it('나머지 옵션은 1세부터 7세까지 순서대로 있어야 한다', () => {
    expect(AGE_FILTER_OPTIONS[1]).toBe('1');
    expect(AGE_FILTER_OPTIONS[2]).toBe('2');
    expect(AGE_FILTER_OPTIONS[3]).toBe('3');
    expect(AGE_FILTER_OPTIONS[4]).toBe('4');
    expect(AGE_FILTER_OPTIONS[5]).toBe('5');
    expect(AGE_FILTER_OPTIONS[6]).toBe('6');
    expect(AGE_FILTER_OPTIONS[7]).toBe('7');
  });
});

// ============================================================
// getChipLabel 테스트
// ============================================================

describe('getChipLabel', () => {
  it('under12m에 대해 "12개월 미만"을 반환해야 한다', () => {
    expect(getChipLabel('under12m')).toBe('12개월 미만');
  });

  it('"1"에 대해 "1세"를 반환해야 한다', () => {
    expect(getChipLabel('1')).toBe('1세');
  });

  it('"7"에 대해 "7세"를 반환해야 한다', () => {
    expect(getChipLabel('7')).toBe('7세');
  });

  it('모든 AgeFilter 값에 대해 한국어 레이블을 반환해야 한다', () => {
    const labels = AGE_FILTER_OPTIONS.map(getChipLabel);
    expect(labels).toEqual([
      '12개월 미만',
      '1세',
      '2세',
      '3세',
      '4세',
      '5세',
      '6세',
      '7세',
    ]);
  });
});

// ============================================================
// isChipSelected 테스트
// ============================================================

describe('isChipSelected', () => {
  it('선택된 목록에 해당 필터가 있으면 true를 반환해야 한다', () => {
    const selected: AgeFilter[] = ['1', '3', '5'];
    expect(isChipSelected('3', selected)).toBe(true);
  });

  it('선택된 목록에 해당 필터가 없으면 false를 반환해야 한다', () => {
    const selected: AgeFilter[] = ['1', '3', '5'];
    expect(isChipSelected('2', selected)).toBe(false);
  });

  it('선택된 목록이 비어 있으면 false를 반환해야 한다', () => {
    const selected: AgeFilter[] = [];
    expect(isChipSelected('under12m', selected)).toBe(false);
  });

  it('under12m이 선택된 목록에 있으면 true를 반환해야 한다', () => {
    const selected: AgeFilter[] = ['under12m', '2'];
    expect(isChipSelected('under12m', selected)).toBe(true);
  });
});

// ============================================================
// toggleAgeFilter 테스트
// ============================================================

describe('toggleAgeFilter', () => {
  it('선택되지 않은 필터를 추가해야 한다', () => {
    const selected: AgeFilter[] = ['1', '3'];
    const result = toggleAgeFilter('2', selected);
    expect(result).toEqual(['1', '3', '2']);
  });

  it('이미 선택된 필터를 제거해야 한다', () => {
    const selected: AgeFilter[] = ['1', '3', '5'];
    const result = toggleAgeFilter('3', selected);
    expect(result).toEqual(['1', '5']);
  });

  it('빈 목록에 필터를 추가해야 한다', () => {
    const selected: AgeFilter[] = [];
    const result = toggleAgeFilter('under12m', selected);
    expect(result).toEqual(['under12m']);
  });

  it('마지막 남은 필터를 제거하면 빈 배열을 반환해야 한다', () => {
    const selected: AgeFilter[] = ['7'];
    const result = toggleAgeFilter('7', selected);
    expect(result).toEqual([]);
  });

  it('원본 배열을 변경하지 않아야 한다 (불변성)', () => {
    const selected: AgeFilter[] = ['1', '3'];
    const originalCopy = [...selected];
    toggleAgeFilter('2', selected);
    expect(selected).toEqual(originalCopy);
  });

  it('원본 배열을 변경하지 않아야 한다 (불변성) - 제거 시', () => {
    const selected: AgeFilter[] = ['1', '3'];
    const originalCopy = [...selected];
    toggleAgeFilter('1', selected);
    expect(selected).toEqual(originalCopy);
  });
});
