/**
 * 서울시 키즈카페 API 파싱 로직 테스트
 */

import {
  parseAgeRange,
  parseSeoulKidsCafe,
  buildSeoulApiUrl,
} from '../../src/lib/seoul-api'
import type { SeoulKidsCafeRaw, KidsCafe } from '../../types/index'

describe('parseAgeRange', () => {
  it('개월 수 문자열을 숫자로 파싱해야 한다', () => {
    expect(parseAgeRange('0', '84')).toEqual({ minAge: 0, maxAge: 84 })
  })

  it('빈 문자열의 경우 0으로 처리해야 한다', () => {
    expect(parseAgeRange('', '')).toEqual({ minAge: 0, maxAge: 0 })
  })

  it('숫자가 아닌 문자열의 경우 0으로 처리해야 한다', () => {
    expect(parseAgeRange('abc', 'xyz')).toEqual({ minAge: 0, maxAge: 0 })
  })
})

describe('parseSeoulKidsCafe', () => {
  const rawCafe: SeoulKidsCafeRaw = {
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

  it('서울시 원본 데이터를 KidsCafe 타입으로 변환해야 한다', () => {
    const result = parseSeoulKidsCafe(rawCafe)

    expect(result.name).toBe('테스트 키즈카페')
    expect(result.address).toBe('서울특별시 강남구 테헤란로 123')
    expect(result.lat).toBe(37.5665)
    expect(result.lng).toBe(126.978)
    expect(result.ageRange).toEqual({ minAge: 0, maxAge: 84 })
    expect(result.operatingHours).toBe('10:00~20:00')
    expect(result.phone).toBe('02-1234-5678')
    expect(result.reservationUrl).toBe('https://example.com/reserve')
  })

  it('고유 id는 시설명과 주소를 기반으로 생성되어야 한다', () => {
    const result = parseSeoulKidsCafe(rawCafe)
    expect(result.id).toBeTruthy()
    expect(typeof result.id).toBe('string')
  })

  it('naverPlaceUrl과 imageUrl은 undefined여야 한다 (원본에 없는 경우)', () => {
    const result = parseSeoulKidsCafe(rawCafe)
    expect(result.naverPlaceUrl).toBeUndefined()
    expect(result.imageUrl).toBeUndefined()
  })

  it('위도/경도가 유효하지 않으면 0으로 처리해야 한다', () => {
    const invalidRaw: SeoulKidsCafeRaw = { ...rawCafe, LTTUD: '', LNGTD: '' }
    const result = parseSeoulKidsCafe(invalidRaw)
    expect(result.lat).toBe(0)
    expect(result.lng).toBe(0)
  })
})

describe('buildSeoulApiUrl', () => {
  it('API 키와 엔드포인트로 올바른 URL을 생성해야 한다', () => {
    const url = buildSeoulApiUrl('TEST_KEY', 1, 1000)
    expect(url).toBe(
      'http://openAPI.seoul.go.kr:8088/TEST_KEY/json/ChildCareInfo/1/1000/'
    )
  })

  it('페이지 범위를 반영한 URL을 생성해야 한다', () => {
    const url = buildSeoulApiUrl('MY_KEY', 1001, 2000)
    expect(url).toBe(
      'http://openAPI.seoul.go.kr:8088/MY_KEY/json/ChildCareInfo/1001/2000/'
    )
  })
})
