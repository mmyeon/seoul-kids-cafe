import type { AgeFilter } from '../../types/index';

export const AGE_FILTER_OPTIONS: AgeFilter[] = ['under12m', '1', '2', '3', '4', '5', '6', '7'];

export function getChipLabel(age: AgeFilter): string {
  if (age === 'under12m') return '12개월 미만';
  return `${age}세`;
}

export function isChipSelected(filter: AgeFilter, selected: AgeFilter[]): boolean {
  return selected.includes(filter);
}

export function toggleAgeFilter(filter: AgeFilter, selected: AgeFilter[]): AgeFilter[] {
  if (isChipSelected(filter, selected)) {
    return selected.filter((f) => f !== filter);
  }
  return [...selected, filter];
}
