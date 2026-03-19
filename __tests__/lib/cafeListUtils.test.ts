import { buildCafeListItems, computeDistance } from '../../src/lib/cafeListUtils';
import type { KidsCafe, AgeFilter } from '../../types/index';

const makeCafe = (overrides: Partial<KidsCafe> = {}): KidsCafe => ({
  id: 'cafe-1',
  name: '테스트 카페',
  address: '서울시 강남구',
  lat: 37.5665,
  lng: 126.978,
  ageRange: { minAge: 0, maxAge: 7 },
  operatingHours: '월~일',
  phone: '02-1234-5678',
  ...overrides,
});

describe('computeDistance', () => {
  it('shouldReturnNullWhenUserLocationNotProvided', () => {
    const result = computeDistance(makeCafe(), null);
    expect(result).toBeNull();
  });

  it('shouldReturnDistanceInKmWhenUserLocationProvided', () => {
    const cafe = makeCafe({ lat: 37.5665, lng: 126.978 });
    const userLocation = { lat: 37.5665, lng: 126.978 };

    const result = computeDistance(cafe, userLocation);

    expect(result).toBe(0);
  });

  it('shouldReturnPositiveDistanceForDifferentLocations', () => {
    const cafe = makeCafe({ lat: 37.5665, lng: 126.978 });
    const userLocation = { lat: 37.4979, lng: 127.0276 };

    const result = computeDistance(cafe, userLocation);

    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });
});

describe('buildCafeListItems', () => {
  it('shouldReturnEmptyArrayWhenNoCafes', () => {
    const result = buildCafeListItems([], [], null);
    expect(result).toEqual([]);
  });

  it('shouldIncludeMatchStatusForEachCafe', () => {
    const cafes = [makeCafe({ id: '1', ageRange: { minAge: 0, maxAge: 3 } })];
    const selectedAges: AgeFilter[] = ['1'];

    const result = buildCafeListItems(cafes, selectedAges, null);

    expect(result[0].matchStatus).toBe('full');
  });

  it('shouldIncludeNullDistanceWhenNoUserLocation', () => {
    const cafes = [makeCafe()];

    const result = buildCafeListItems(cafes, [], null);

    expect(result[0].distanceKm).toBeNull();
  });

  it('shouldIncludeDistanceWhenUserLocationProvided', () => {
    const cafes = [makeCafe({ lat: 37.5665, lng: 126.978 })];
    const userLocation = { lat: 37.4979, lng: 127.0276 };

    const result = buildCafeListItems(cafes, [], userLocation);

    expect(result[0].distanceKm).not.toBeNull();
    expect(result[0].distanceKm!).toBeGreaterThan(0);
  });

  it('shouldSortCafesByMatchStatusAndOpenStatus', () => {
    const fullMatchCafe = makeCafe({
      id: '1',
      ageRange: { minAge: 1, maxAge: 3 },
      operatingHours: '월~일',
    });
    const noneMatchCafe = makeCafe({
      id: '2',
      ageRange: { minAge: 4, maxAge: 7 },
      operatingHours: '월~일',
    });

    const selectedAges: AgeFilter[] = ['2'];
    const result = buildCafeListItems([noneMatchCafe, fullMatchCafe], selectedAges, null);

    expect(result[0].cafe.id).toBe('1');
    expect(result[1].cafe.id).toBe('2');
  });
});
