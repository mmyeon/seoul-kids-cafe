/**
 * 타입 정의 검증 테스트
 *
 * TypeScript 타입은 런타임에 지워지므로, 컴파일 레벨에서 타입 호환성을 검증합니다.
 * 올바른 값으로 생성한 객체가 타입에 할당 가능한지 검증하는 방식으로 테스트합니다.
 */

import type {
  SeoulKidsCafeRaw,
  KidsCafe,
  AgeFilter,
  MatchStatus,
} from '../../types/index'

describe('SeoulKidsCafeRaw 타입', () => {
  it('서울시 API 원본 응답 필드를 모두 포함해야 한다', () => {
    const raw: SeoulKidsCafeRaw = {
      FCLTY_NM: '테스트 키즈카페',
      RDNMADR: '서울특별시 강남구 테헤란로 123',
      LTTUD: '37.5665',
      LNGTD: '126.9780',
      MIN_AGE: '0',
      MAX_AGE: '84',
      OPER_HR: '10:00~20:00',
      TELNO: '02-1234-5678',
      RESERVATION_URL: 'https://example.com/reserve',
    }

    expect(raw.FCLTY_NM).toBe('테스트 키즈카페')
    expect(raw.RDNMADR).toBe('서울특별시 강남구 테헤란로 123')
    expect(raw.LTTUD).toBe('37.5665')
    expect(raw.LNGTD).toBe('126.9780')
    expect(raw.MIN_AGE).toBe('0')
    expect(raw.MAX_AGE).toBe('84')
    expect(raw.OPER_HR).toBe('10:00~20:00')
    expect(raw.TELNO).toBe('02-1234-5678')
    expect(raw.RESERVATION_URL).toBe('https://example.com/reserve')
  })

  it('선택적 필드(네이버 플레이스 URL, 이미지 URL)를 포함할 수 있어야 한다', () => {
    const raw: SeoulKidsCafeRaw = {
      FCLTY_NM: '테스트 키즈카페',
      RDNMADR: '서울특별시 강남구 테헤란로 123',
      LTTUD: '37.5665',
      LNGTD: '126.9780',
      MIN_AGE: '0',
      MAX_AGE: '84',
      OPER_HR: '10:00~20:00',
      TELNO: '02-1234-5678',
      RESERVATION_URL: 'https://example.com/reserve',
      NAVER_PLACE_URL: 'https://place.naver.com/123',
      IMAGE_URL: 'https://example.com/image.jpg',
    }

    expect(raw.NAVER_PLACE_URL).toBe('https://place.naver.com/123')
    expect(raw.IMAGE_URL).toBe('https://example.com/image.jpg')
  })
})

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
    }

    expect(cafe.id).toBe('cafe-001')
    expect(cafe.name).toBe('테스트 키즈카페')
    expect(cafe.lat).toBe(37.5665)
    expect(cafe.lng).toBe(126.978)
    expect(cafe.ageRange.minAge).toBe(0)
    expect(cafe.ageRange.maxAge).toBe(84)
  })

  it('선택적 필드(naverPlaceUrl, imageUrl, parking)를 포함할 수 있어야 한다', () => {
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
      naverPlaceUrl: 'https://place.naver.com/456',
      imageUrl: 'https://example.com/image2.jpg',
      parking: 'available',
    }

    expect(cafe.naverPlaceUrl).toBe('https://place.naver.com/456')
    expect(cafe.imageUrl).toBe('https://example.com/image2.jpg')
    expect(cafe.parking).toBe('available')
  })

  it('parking 필드는 available, unavailable, unknown 값만 허용해야 한다', () => {
    const withAvailable: KidsCafe = {
      id: 'cafe-003',
      name: '카페3',
      address: '서울',
      lat: 37.5,
      lng: 127.0,
      ageRange: { minAge: 0, maxAge: 36 },
      operatingHours: '09:00~18:00',
      phone: '02-0000-0000',
      reservationUrl: 'https://example.com',
      parking: 'available',
    }

    const withUnavailable: KidsCafe = { ...withAvailable, id: 'cafe-004', parking: 'unavailable' }
    const withUnknown: KidsCafe = { ...withAvailable, id: 'cafe-005', parking: 'unknown' }

    expect(withAvailable.parking).toBe('available')
    expect(withUnavailable.parking).toBe('unavailable')
    expect(withUnknown.parking).toBe('unknown')
  })
})

describe('AgeFilter 타입', () => {
  it('유효한 나이 필터 값을 모두 허용해야 한다', () => {
    const filters: AgeFilter[] = ['under12m', '1', '2', '3', '4', '5', '6', '7']

    expect(filters).toHaveLength(8)
    expect(filters[0]).toBe('under12m')
    expect(filters[1]).toBe('1')
    expect(filters[7]).toBe('7')
  })

  it('각 나이 필터 값이 올바른 리터럴 타입이어야 한다', () => {
    const under12m: AgeFilter = 'under12m'
    const age1: AgeFilter = '1'
    const age7: AgeFilter = '7'

    expect(under12m).toBe('under12m')
    expect(age1).toBe('1')
    expect(age7).toBe('7')
  })
})

describe('MatchStatus 타입', () => {
  it('유효한 매칭 상태 값을 모두 허용해야 한다', () => {
    const statuses: MatchStatus[] = ['full', 'partial', 'none']

    expect(statuses).toHaveLength(3)
  })

  it('각 매칭 상태 값이 올바른 리터럴 타입이어야 한다', () => {
    const full: MatchStatus = 'full'
    const partial: MatchStatus = 'partial'
    const none: MatchStatus = 'none'

    expect(full).toBe('full')
    expect(partial).toBe('partial')
    expect(none).toBe('none')
  })
})
