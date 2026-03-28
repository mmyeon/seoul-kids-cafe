/**
 * 타입 정의 검증 테스트
 *
 * TypeScript 타입은 런타임에 지워지므로, 컴파일 레벨에서 타입 호환성을 검증합니다.
 * 올바른 값으로 생성한 객체가 타입에 할당 가능한지 검증하는 방식으로 테스트합니다.
 */

import type { SeoulKidsCafeRaw, KidsCafe, AgeFilter, MatchStatus } from '../../types/index';

describe('SeoulKidsCafeRaw 타입', () => {
  it('서울시 API(tnFcltySttusInfo1011) 원본 응답 필드를 모두 포함해야 한다', () => {
    const raw: SeoulKidsCafeRaw = {
      FCLTY_ID: 'DJ260201',
      FCLTY_NM: '테스트 키즈카페',
      BASS_ADRES: '서울특별시 강남구 테헤란로 123',
      DETAIL_ADRES: '3층',
      X_CRDNT_VALUE: '126.9780',
      Y_CRDNT_VALUE: '37.5665',
      POSBL_AGRDE: '0세 ~ 7세',
      OPEN_WEEK: '화~일요일',
      CLOSE_WEEK: '월요일, 공휴일',
      CTTPC: '02-1234-5678',
      RNTFEE_FREE_AT: 'Y',
    };

    expect(raw.FCLTY_ID).toBe('DJ260201');
    expect(raw.FCLTY_NM).toBe('테스트 키즈카페');
    expect(raw.BASS_ADRES).toBe('서울특별시 강남구 테헤란로 123');
    expect(raw.X_CRDNT_VALUE).toBe('126.9780');
    expect(raw.Y_CRDNT_VALUE).toBe('37.5665');
    expect(raw.POSBL_AGRDE).toBe('0세 ~ 7세');
    expect(raw.CTTPC).toBe('02-1234-5678');
  });
});

describe('KidsCafe 타입', () => {
  it('카페 카드에 표시할 필수 필드를 모두 포함해야 한다', () => {
    const cafe: KidsCafe = {
      id: 'cafe-001',
      name: '테스트 키즈카페',
      address: '서울특별시 강남구 테헤란로 123',
      lat: 37.5665,
      lng: 126.978,
      ageRange: { minAge: 0, maxAge: 84 },
      operatingHours: '10:00~20:00',
      phone: '02-1234-5678',
      reservationUrl: 'https://example.com/reserve',
    };

    expect(cafe.id).toBe('cafe-001');
    expect(cafe.name).toBe('테스트 키즈카페');
    expect(cafe.lat).toBe(37.5665);
    expect(cafe.lng).toBe(126.978);
    expect(cafe.ageRange.minAge).toBe(0);
    expect(cafe.ageRange.maxAge).toBe(84);
  });

  it('선택적 필드(kakaoPlaceUrl, imageUrl)를 포함할 수 있어야 한다', () => {
    const cafe: KidsCafe = {
      id: 'cafe-002',
      name: '테스트 키즈카페2',
      address: '서울특별시 강남구 테헤란로 456',
      lat: 37.5665,
      lng: 126.978,
      ageRange: { minAge: 12, maxAge: 60 },
      operatingHours: '10:00~20:00',
      phone: '02-9876-5432',
      reservationUrl: 'https://example.com/reserve2',
      kakaoPlaceUrl: 'https://place.map.kakao.com/456',
      imageUrl: 'https://example.com/image2.jpg',
    };

    expect(cafe.kakaoPlaceUrl).toBe('https://place.map.kakao.com/456');
    expect(cafe.imageUrl).toBe('https://example.com/image2.jpg');
  });
});

describe('AgeFilter 타입', () => {
  it('유효한 나이 필터 값을 모두 허용해야 한다', () => {
    const filters: AgeFilter[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13'];

    expect(filters).toHaveLength(14);
    expect(filters[0]).toBe('0');
    expect(filters[1]).toBe('1');
    expect(filters[13]).toBe('13');
  });

  it('각 나이 필터 값이 올바른 리터럴 타입이어야 한다', () => {
    const age0: AgeFilter = '0';
    const age1: AgeFilter = '1';
    const age7: AgeFilter = '7';

    expect(age0).toBe('0');
    expect(age1).toBe('1');
    expect(age7).toBe('7');
  });
});

describe('MatchStatus 타입', () => {
  it('유효한 매칭 상태 값을 모두 허용해야 한다', () => {
    const statuses: MatchStatus[] = ['full', 'none'];

    expect(statuses).toHaveLength(2);
  });

  it('각 매칭 상태 값이 올바른 리터럴 타입이어야 한다', () => {
    const full: MatchStatus = 'full';
    const none: MatchStatus = 'none';

    expect(full).toBe('full');
    expect(none).toBe('none');
  });
});
