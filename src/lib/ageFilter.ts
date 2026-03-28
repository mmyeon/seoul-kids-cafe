import type { AgeFilter, KidsCafe, MatchStatus } from '../../types/index';

const DEFAULT_AGE_RANGE = { minAge: 0, maxAge: 7 };

const ageFilterToYear = (filter: AgeFilter): number => parseInt(filter, 10);

export const parseAgeRange = (text: string): { minAge: number; maxAge: number } => {
  if (!text) return { ...DEFAULT_AGE_RANGE };

  const tokenPattern = /(\d+)\s*(세|개월)?/g;
  const tokens: Array<{ value: number; unit: string }> = [];

  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(text)) !== null) {
    tokens.push({
      value: parseInt(match[1], 10),
      unit: match[2] ?? '',
    });
  }

  if (tokens.length === 0) return { ...DEFAULT_AGE_RANGE };

  if (tokens.length === 1) {
    const year = tokens[0].unit === '개월' ? 0 : tokens[0].value;
    return { minAge: year, maxAge: year };
  }

  const firstToken = tokens[0];
  const lastToken = tokens[tokens.length - 1];

  // If every token carries the '개월' unit (e.g. "6개월~12개월"), collapse to year 0.
  const allMonths = tokens.every((t) => t.unit === '개월');
  if (allMonths) return { minAge: 0, maxAge: 0 };

  const minAge = firstToken.unit === '개월' ? 0 : firstToken.value;
  const maxAge = lastToken.unit === '개월' ? 0 : lastToken.value;

  return { minAge, maxAge };
};

const isAgeInRange = (
  filter: AgeFilter,
  ageRange: { minAge: number; maxAge: number },
): boolean => {
  const year = ageFilterToYear(filter);
  return year >= ageRange.minAge && year <= ageRange.maxAge;
};

export const getMatchStatus = (kidsCafe: KidsCafe, selectedAges: AgeFilter[]): MatchStatus => {
  if (selectedAges.length === 0) return 'full';

  const matched = selectedAges.filter((age) => isAgeInRange(age, kidsCafe.ageRange));

  return matched.length === selectedAges.length ? 'full' : 'none';
};
