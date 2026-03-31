import { sortKidsCafes } from '../../src/lib/cafeSort';
import type { KidsCafe } from '../../types/index';

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

describe('sortKidsCafes', () => {
  it('카페 목록이 비어있으면 빈 배열을 반환한다', () => {
    expect(sortKidsCafes([], [])).toEqual([]);
  });

  it('위치 정보가 없으면 이름 가나다순으로 정렬한다', () => {
    const cafes = [
      makeCafe({ id: '1', name: '하나 카페' }),
      makeCafe({ id: '2', name: '가나 카페' }),
      makeCafe({ id: '3', name: '마라 카페' }),
    ];

    const result = sortKidsCafes(cafes, []);

    expect(result.map((c) => c.id)).toEqual(['2', '3', '1']);
  });

  it('위치 정보가 있으면 거리 가까운 순으로 정렬한다', () => {
    const nearCafe = makeCafe({ id: 'near', lat: 37.5665, lng: 126.978 });
    const farCafe = makeCafe({ id: 'far', lat: 37.4000, lng: 126.900 });

    const result = sortKidsCafes([farCafe, nearCafe], [], 37.5665, 126.978);

    expect(result[0].id).toBe('near');
    expect(result[1].id).toBe('far');
  });

  it('나이 매칭 우선순위가 가나다순보다 앞선다', () => {
    const fullMatchCafe = makeCafe({ id: 'full', name: '하나 카페', ageRange: { minAge: 1, maxAge: 3 } });
    const noneMatchCafe = makeCafe({ id: 'none', name: '가나 카페', ageRange: { minAge: 5, maxAge: 10 } });

    const result = sortKidsCafes([noneMatchCafe, fullMatchCafe], ['2']);

    expect(result[0].id).toBe('full');
    expect(result[1].id).toBe('none');
  });
});
