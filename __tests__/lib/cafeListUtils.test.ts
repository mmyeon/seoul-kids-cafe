import { buildCafeListItems, computeDistance, extractDistricts } from '../../src/lib/cafeListUtils';
import type { KidsCafe, AgeFilter } from '../../types/index';

const makeCafe = (overrides: Partial<KidsCafe> = {}): KidsCafe => ({
  id: 'cafe-1',
  name: '테스트 카페',
  address: '서울시 강남구 테헤란로 1',
  lat: 37.5665,
  lng: 126.978,
  ageRange: { minAge: 0, maxAge: 7 },
  operatingHours: '월~일',
  phone: '02-1234-5678',
  imageUrl: '',
  ...overrides,
});

describe('extractDistricts', () => {
  it('카페 주소에서 중복 없이 가나다순으로 자치구를 추출한다', () => {
    const cafes = [
      makeCafe({ address: '서울시 강남구 테헤란로 1' }),
      makeCafe({ address: '서울시 마포구 독막로 1' }),
      makeCafe({ address: '서울시 강남구 역삼로 2' }),
    ];

    const result = extractDistricts(cafes);

    expect(result).toEqual(['강남구', '마포구']);
  });

  it('카페 목록이 비어있으면 빈 배열을 반환한다', () => {
    expect(extractDistricts([])).toEqual([]);
  });

  it('주소에 구 정보가 없는 카페는 무시한다', () => {
    const cafes = [
      makeCafe({ address: '서울시 강남구 테헤란로 1' }),
      makeCafe({ address: '주소 없음' }),
    ];

    const result = extractDistricts(cafes);

    expect(result).toEqual(['강남구']);
  });
});

describe('computeDistance', () => {
  it('사용자 위치가 없으면 null을 반환한다', () => {
    const result = computeDistance(makeCafe(), null);
    expect(result).toBeNull();
  });

  it('사용자 위치와 카페 위치가 같으면 거리 0을 반환한다', () => {
    const cafe = makeCafe({ lat: 37.5665, lng: 126.978 });
    const userLocation = { lat: 37.5665, lng: 126.978 };

    const result = computeDistance(cafe, userLocation);

    expect(result).toBe(0);
  });

  it('서로 다른 위치면 양수 거리를 반환한다', () => {
    const cafe = makeCafe({ lat: 37.5665, lng: 126.978 });
    const userLocation = { lat: 37.4979, lng: 127.0276 };

    const result = computeDistance(cafe, userLocation);

    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });
});

describe('buildCafeListItems', () => {
  it('카페 목록이 비어있으면 빈 배열을 반환한다', () => {
    const result = buildCafeListItems([], [], null);
    expect(result).toEqual([]);
  });

  it('각 카페 아이템에 나이 매칭 상태를 포함한다', () => {
    const cafes = [makeCafe({ id: '1', ageRange: { minAge: 0, maxAge: 3 } })];
    const selectedAges: AgeFilter[] = ['1'];

    const result = buildCafeListItems(cafes, selectedAges, null);

    expect(result[0].matchStatus).toBe('full');
  });

  it('사용자 위치가 없으면 거리를 null로 반환한다', () => {
    const cafes = [makeCafe()];

    const result = buildCafeListItems(cafes, [], null);

    expect(result[0].distanceKm).toBeNull();
  });

  it('사용자 위치가 있으면 거리를 계산해 포함한다', () => {
    const cafes = [makeCafe({ lat: 37.5665, lng: 126.978 })];
    const userLocation = { lat: 37.4979, lng: 127.0276 };

    const result = buildCafeListItems(cafes, [], userLocation);

    expect(result[0].distanceKm).not.toBeNull();
    expect(result[0].distanceKm!).toBeGreaterThan(0);
  });

  it('선택한 자치구에 해당하는 카페만 필터링한다', () => {
    const gangnamCafe = makeCafe({ id: '1', address: '서울시 강남구 테헤란로 1' });
    const mapooCafe = makeCafe({ id: '2', address: '서울시 마포구 독막로 1' });

    const result = buildCafeListItems([gangnamCafe, mapooCafe], [], null, '강남구');

    expect(result).toHaveLength(1);
    expect(result[0].cafe.id).toBe('1');
  });

  it('자치구 선택이 없으면 전체 카페를 반환한다', () => {
    const gangnamCafe = makeCafe({ id: '1', address: '서울시 강남구 테헤란로 1' });
    const mapooCafe = makeCafe({ id: '2', address: '서울시 마포구 독막로 1' });

    const result = buildCafeListItems([gangnamCafe, mapooCafe], [], null, null);

    expect(result).toHaveLength(2);
  });

  it('나이 매칭 상태와 영업 여부 순으로 정렬한다', () => {
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
