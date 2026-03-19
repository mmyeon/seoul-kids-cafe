import { parseAgeRange, getMatchStatus, sortKidsCafes } from '../../src/lib/ageFilter';
import type { KidsCafe, AgeFilter } from '../../types/index';

// ============================================================
// Test fixtures
// ============================================================

const makeCafe = (overrides: Partial<KidsCafe> = {}): KidsCafe => ({
  id: 'cafe-1',
  name: '테스트 카페',
  address: '서울시 강남구',
  lat: 37.5665,
  lng: 126.978,
  ageRange: { minAge: 0, maxAge: 7 },
  operatingHours: '화~일요일',
  phone: '02-0000-0000',
  ...overrides,
});

// ============================================================
// parseAgeRange
// ============================================================

describe('parseAgeRange', () => {
  it('shouldParse0To12MonthText', () => {
    expect(parseAgeRange('0~12개월')).toEqual({ minAge: 0, maxAge: 0 });
  });

  it('shouldParseAgeRangeWithYearsKorean', () => {
    expect(parseAgeRange('1세 ~ 7세')).toEqual({ minAge: 1, maxAge: 7 });
  });

  it('shouldParse0세To7세Format', () => {
    expect(parseAgeRange('0세 ~ 7세')).toEqual({ minAge: 0, maxAge: 7 });
  });

  it('shouldParseAgeRangeWithoutSpaces', () => {
    expect(parseAgeRange('2세~5세')).toEqual({ minAge: 2, maxAge: 5 });
  });

  it('shouldParseMixedMonthAndYearFormat', () => {
    // "0개월 ~ 7세" style — months converted: 0개월 = 0, 7세 = 7
    expect(parseAgeRange('0개월 ~ 7세')).toEqual({ minAge: 0, maxAge: 7 });
  });

  it('shouldReturnDefaultRangeForUnrecognizedText', () => {
    expect(parseAgeRange('')).toEqual({ minAge: 0, maxAge: 7 });
  });

  it('shouldReturnDefaultRangeForTextWithNoNumbers', () => {
    expect(parseAgeRange('제한없음')).toEqual({ minAge: 0, maxAge: 7 });
  });
});

// ============================================================
// getMatchStatus
// ============================================================

describe('getMatchStatus', () => {
  const cafe07 = makeCafe({ ageRange: { minAge: 0, maxAge: 7 } });
  const cafe13 = makeCafe({ ageRange: { minAge: 1, maxAge: 3 } });
  const cafe46 = makeCafe({ ageRange: { minAge: 4, maxAge: 6 } });

  it('shouldReturnNoneWhenNoFiltersSelected', () => {
    expect(getMatchStatus(cafe07, [])).toBe('none');
  });

  it('shouldReturnFullWhenAllSelectedAgesAreInsideRange', () => {
    const selected: AgeFilter[] = ['1', '2', '3'];
    expect(getMatchStatus(cafe07, selected)).toBe('full');
  });

  it('shouldReturnFullWhenUnder12mIsSelectedAndCafeStartsAt0', () => {
    const selected: AgeFilter[] = ['under12m'];
    expect(getMatchStatus(cafe07, selected)).toBe('full');
  });

  it('shouldReturnNoneWhenUnder12mIsSelectedAndCafeStartsAt1', () => {
    const selected: AgeFilter[] = ['under12m'];
    expect(getMatchStatus(cafe13, selected)).toBe('none');
  });

  it('shouldReturnPartialWhenSomeSelectedAgesAreOutsideRange', () => {
    const selected: AgeFilter[] = ['1', '2', '5'];
    expect(getMatchStatus(cafe13, selected)).toBe('partial');
  });

  it('shouldReturnNoneWhenNoSelectedAgesAreInsideRange', () => {
    const selected: AgeFilter[] = ['5', '6', '7'];
    expect(getMatchStatus(cafe13, selected)).toBe('none');
  });

  it('shouldReturnFullForExactBoundaryMatch', () => {
    const selected: AgeFilter[] = ['4', '5', '6'];
    expect(getMatchStatus(cafe46, selected)).toBe('full');
  });

  it('shouldReturnPartialWhenOneOfTwoAgesMatches', () => {
    const selected: AgeFilter[] = ['3', '4'];
    expect(getMatchStatus(cafe46, selected)).toBe('partial');
  });
});

// ============================================================
// sortCafes
// ============================================================

describe('sortKidsCafes', () => {
  // Build day strings that are deterministically "today" or "not today".
  // KO_DAYS maps JS getDay() (0=Sun) to short Korean day names.
  const KO_DAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
  const todayJsDay = new Date().getDay(); // 0-6
  const todayShort = KO_DAYS[todayJsDay]; // e.g. "월"
  // Pick a day that is guaranteed NOT today by advancing one step in the week
  const notTodayShort = KO_DAYS[(todayJsDay + 1) % 7]; // always different

  // "open" cafes: single-day entry equal to today
  // "closed" cafes: single-day entry equal to notToday
  const OPEN_HOURS = `${todayShort}요일`;
  const CLOSED_HOURS = `${notTodayShort}요일`;

  const fullMatchOpenCafe = makeCafe({
    id: 'full-open',
    ageRange: { minAge: 1, maxAge: 7 },
    operatingHours: OPEN_HOURS,
    lat: 37.5665,
    lng: 126.978,
  });

  const fullMatchClosedCafe = makeCafe({
    id: 'full-closed',
    ageRange: { minAge: 1, maxAge: 7 },
    operatingHours: CLOSED_HOURS,
    lat: 37.5665,
    lng: 126.978,
  });

  const partialMatchOpenCafe = makeCafe({
    id: 'partial-open',
    ageRange: { minAge: 1, maxAge: 3 },
    operatingHours: OPEN_HOURS,
    lat: 37.57,
    lng: 126.979,
  });

  const partialMatchClosedCafe = makeCafe({
    id: 'partial-closed',
    ageRange: { minAge: 1, maxAge: 3 },
    operatingHours: CLOSED_HOURS,
    lat: 37.57,
    lng: 126.979,
  });

  const noMatchCafe = makeCafe({
    id: 'no-match',
    ageRange: { minAge: 5, maxAge: 7 },
    operatingHours: OPEN_HOURS,
    lat: 37.58,
    lng: 126.98,
  });

  const selectedAges: AgeFilter[] = ['1', '2', '3', '4'];

  it('shouldReturnEmptyArrayForEmptyInput', () => {
    expect(sortKidsCafes([], selectedAges)).toEqual([]);
  });

  it('shouldPlaceFullMatchOpenBeforeFullMatchClosed', () => {
    const result = sortKidsCafes([fullMatchClosedCafe, fullMatchOpenCafe], selectedAges);
    expect(result[0].id).toBe('full-open');
    expect(result[1].id).toBe('full-closed');
  });

  it('shouldPlaceFullMatchBeforePartialMatch', () => {
    const result = sortKidsCafes(
      [partialMatchOpenCafe, fullMatchOpenCafe],
      selectedAges,
    );
    expect(result[0].id).toBe('full-open');
    expect(result[1].id).toBe('partial-open');
  });

  it('shouldPlacePartialMatchOpenBeforePartialMatchClosed', () => {
    const result = sortKidsCafes([partialMatchClosedCafe, partialMatchOpenCafe], selectedAges);
    expect(result[0].id).toBe('partial-open');
    expect(result[1].id).toBe('partial-closed');
  });

  it('shouldFollowFullPriority1234Order', () => {
    const result = sortKidsCafes(
      [noMatchCafe, partialMatchClosedCafe, partialMatchOpenCafe, fullMatchClosedCafe, fullMatchOpenCafe],
      selectedAges,
    );
    const ids = result.map((c) => c.id);
    expect(ids).toEqual([
      'full-open',
      'full-closed',
      'partial-open',
      'partial-closed',
      'no-match',
    ]);
  });

  it('shouldSortByDistanceWithinSameGroup', () => {
    const nearCafe = makeCafe({
      id: 'near',
      ageRange: { minAge: 1, maxAge: 7 },
      operatingHours: OPEN_HOURS,
      lat: 37.5666,
      lng: 126.9781,
    });
    const farCafe = makeCafe({
      id: 'far',
      ageRange: { minAge: 1, maxAge: 7 },
      operatingHours: OPEN_HOURS,
      lat: 37.6,
      lng: 127.0,
    });
    const result = sortKidsCafes([farCafe, nearCafe], selectedAges, 37.5665, 126.978);
    expect(result[0].id).toBe('near');
    expect(result[1].id).toBe('far');
  });

  it('shouldReturnOriginalOrderWhenNoFiltersSelected', () => {
    const result = sortKidsCafes([fullMatchOpenCafe, partialMatchOpenCafe], []);
    // All are 'none', no user location → original order preserved
    expect(result.map((c) => c.id)).toEqual(['full-open', 'partial-open']);
  });
});
