import type { AgeFilter } from '../../types/index';

export const AGE_FILTER_OPTIONS: AgeFilter[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

export function getChipLabel(age: AgeFilter): string {
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
