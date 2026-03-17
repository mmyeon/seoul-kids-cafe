import type { AgeFilter, KidsCafe, MatchStatus } from '../../types/index';

// ============================================================
// Constants
// ============================================================

const DEFAULT_AGE_RANGE = { minAge: 0, maxAge: 7 };

/**
 * Ordered short day names in Korean week order (월~일).
 * Used to detect whether a cafe is open today.
 */
const KO_DAYS_SHORT = ['월', '화', '수', '목', '금', '토', '일'] as const;

// Sort priority mapping: lower number = higher priority
const SORT_PRIORITY: Record<MatchStatus, Record<'open' | 'closed', number>> = {
  full: { open: 0, closed: 1 },
  partial: { open: 2, closed: 3 },
  none: { open: 4, closed: 4 },
};

// ============================================================
// parseAgeRange
// ============================================================

/**
 * Converts an AgeFilter value to a year integer used for range comparisons.
 * 'under12m' is treated as year 0 (infant within first year).
 */
const ageFilterToYear = (filter: AgeFilter): number =>
  filter === 'under12m' ? 0 : parseInt(filter, 10);

/**
 * Parses the Seoul API age text into a numeric { minAge, maxAge } range (in years).
 *
 * Supported formats:
 *  - "0~12개월"       → { minAge: 0, maxAge: 0 }  (month-only → year 0)
 *  - "1세 ~ 7세"      → { minAge: 1, maxAge: 7 }
 *  - "0세 ~ 7세"      → { minAge: 0, maxAge: 7 }
 *  - "2세~5세"        → { minAge: 2, maxAge: 5 }
 *  - "0개월 ~ 7세"    → { minAge: 0, maxAge: 7 }
 *  - unrecognised     → DEFAULT_AGE_RANGE
 */
export const parseAgeRange = (text: string): { minAge: number; maxAge: number } => {
  if (!text) return { ...DEFAULT_AGE_RANGE };

  // Extract all number-unit pairs from the string
  // Matches patterns like "0", "12개월", "7세"
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

  // Single token edge-case (shouldn't appear in practice but guard anyway)
  if (tokens.length === 1) {
    const year = tokens[0].unit === '개월' ? 0 : tokens[0].value;
    return { minAge: year, maxAge: year };
  }

  const firstToken = tokens[0];
  const lastToken = tokens[tokens.length - 1];

  // If the entire string contains only months (개월), collapse to year 0
  const allMonths = tokens.every((t) => t.unit === '개월');
  if (allMonths) return { minAge: 0, maxAge: 0 };

  const minAge = firstToken.unit === '개월' ? 0 : firstToken.value;
  const maxAge = lastToken.unit === '개월' ? 0 : lastToken.value;

  return { minAge, maxAge };
};

// ============================================================
// getMatchStatus
// ============================================================

/**
 * Determines whether a single AgeFilter value falls within the cafe's ageRange.
 * 'under12m' matches only cafes that start at age 0 (minAge === 0).
 */
const isAgeInRange = (
  filter: AgeFilter,
  ageRange: { minAge: number; maxAge: number },
): boolean => {
  const year = ageFilterToYear(filter);
  return year >= ageRange.minAge && year <= ageRange.maxAge;
};

/**
 * Calculates the match status of a cafe against a set of selected age filters.
 *
 * - full:    every selected age is within the cafe's range
 * - partial: at least one selected age is within range
 * - none:    no selected age falls within range (or no filters selected)
 */
export const getMatchStatus = (cafe: KidsCafe, selectedAges: AgeFilter[]): MatchStatus => {
  if (selectedAges.length === 0) return 'none';

  const matched = selectedAges.filter((age) => isAgeInRange(age, cafe.ageRange));

  if (matched.length === selectedAges.length) return 'full';
  if (matched.length > 0) return 'partial';
  return 'none';
};

// ============================================================
// isOpenToday
// ============================================================

/**
 * Checks whether a cafe is open today based on its operatingHours string.
 * Handles range format like "화~일요일" or simple inclusion like "월,화,수".
 */
const isOpenToday = (operatingHours: string): boolean => {
  const todayIndex = new Date().getDay(); // 0=Sunday … 6=Saturday
  // Map JS getDay() index to KO_DAYS_SHORT index (월=0 … 일=6)
  const koIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const today = KO_DAYS_SHORT[koIndex];

  // Range detection: "화~일" or "월~토"
  const rangeMatch = operatingHours.match(/([월화수목금토일])~([월화수목금토일])/);
  if (rangeMatch) {
    const startIdx = KO_DAYS_SHORT.indexOf(rangeMatch[1] as (typeof KO_DAYS_SHORT)[number]);
    const endIdx = KO_DAYS_SHORT.indexOf(rangeMatch[2] as (typeof KO_DAYS_SHORT)[number]);
    if (startIdx !== -1 && endIdx !== -1) {
      if (startIdx <= endIdx) {
        return koIndex >= startIdx && koIndex <= endIdx;
      }
      // Wrap-around range (e.g. "금~월")
      return koIndex >= startIdx || koIndex <= endIdx;
    }
  }

  // Fallback: check if today's name appears anywhere in the string
  return operatingHours.includes(today);
};

// ============================================================
// Haversine distance (km)
// ============================================================

const toRad = (deg: number): number => (deg * Math.PI) / 180;

const haversineKm = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================
// sortCafes
// ============================================================

/**
 * Sorts cafes by the following priority:
 *  1. Full match + open today
 *  2. Full match + closed today
 *  3. Partial match + open today
 *  4. Partial match + closed today
 *  5. No match (open/closed treated equally)
 *
 * Within the same priority group, cafes are sorted by distance from the
 * user's location (ascending). If no location is provided, original order
 * within the group is preserved.
 */
export const sortCafes = (
  cafes: KidsCafe[],
  selectedAges: AgeFilter[],
  userLat?: number,
  userLng?: number,
): KidsCafe[] => {
  if (cafes.length === 0) return [];

  const hasLocation = userLat !== undefined && userLng !== undefined;

  return [...cafes].sort((a, b) => {
    const statusA = getMatchStatus(a, selectedAges);
    const statusB = getMatchStatus(b, selectedAges);
    const openA = isOpenToday(a.operatingHours) ? 'open' : 'closed';
    const openB = isOpenToday(b.operatingHours) ? 'open' : 'closed';

    const priorityA = SORT_PRIORITY[statusA][openA];
    const priorityB = SORT_PRIORITY[statusB][openB];

    if (priorityA !== priorityB) return priorityA - priorityB;

    // Same priority group → sort by distance if location is available
    if (hasLocation) {
      const distA = haversineKm(userLat!, userLng!, a.lat, a.lng);
      const distB = haversineKm(userLat!, userLng!, b.lat, b.lng);
      return distA - distB;
    }

    return 0;
  });
};
