/**
 * 서울시 키즈카페 API 파싱 로직 테스트
 */

import { parseAgeRange, parseSeoulKidsCafe, buildSeoulApiUrl } from '../../src/lib/seoul-api';
import type { SeoulKidsCafeRaw } from '../../types/index';

describe('parseAgeRange', () => {
  it('"0세 ~ 7세" 형식의 텍스트를 파싱해야 한다', () => {
    expect(parseAgeRange('0세 ~ 7세')).toEqual({ minAge: 0, maxAge: 7 });
  });

  it('"1세 ~ 6세" 형식의 텍스트를 파싱해야 한다', () => {
    expect(parseAgeRange('1세 ~ 6세')).toEqual({ minAge: 1, maxAge: 6 });
  });

  it('빈 문자열의 경우 0으로 처리해야 한다', () => {
    expect(parseAgeRange('')).toEqual({ minAge: 0, maxAge: 0 });
  });

  it('"~" 구분자가 없으면 0으로 처리해야 한다', () => {
    expect(parseAgeRange('7세이하')).toEqual({ minAge: 0, maxAge: 0 });
  });
});

describe('parseSeoulKidsCafe', () => {
  const rawCafe: SeoulKidsCafeRaw = {
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

  it('서울시 원본 데이터를 KidsCafe 타입으로 변환해야 한다', () => {
    const result = parseSeoulKidsCafe(rawCafe);

    expect(result.name).toBe('테스트 키즈카페');
    expect(result.address).toBe('서울특별시 강남구 테헤란로 123 3층');
    expect(result.lat).toBe(37.5665);
    expect(result.lng).toBe(126.978);
    expect(result.ageRange).toEqual({ minAge: 0, maxAge: 7 });
    expect(result.operatingHours).toBe('화 ~ 일');
    expect(result.phone).toBe('02-1234-5678');
  });

  it('"서울형 키즈카페" prefix를 제거해야 한다', () => {
    const withPrefix: SeoulKidsCafeRaw = { ...rawCafe, FCLTY_NM: '서울형 키즈카페 마포구청' };
    const result = parseSeoulKidsCafe(withPrefix);
    expect(result.name).toBe('마포구청');
  });

  it('FCLTY_ID가 있으면 id로 사용해야 한다', () => {
    const result = parseSeoulKidsCafe(rawCafe);
    expect(result.id).toBe('DJ260201');
  });

  it('DETAIL_ADRES가 없으면 BASS_ADRES만 주소로 사용해야 한다', () => {
    const noDetail: SeoulKidsCafeRaw = { ...rawCafe, DETAIL_ADRES: '' };
    const result = parseSeoulKidsCafe(noDetail);
    expect(result.address).toBe('서울특별시 강남구 테헤란로 123');
  });

  it('kakaoPlaceUrl과 imageUrl은 undefined여야 한다 (원본에 없는 경우)', () => {
    const result = parseSeoulKidsCafe(rawCafe);
    expect(result.kakaoPlaceUrl).toBeUndefined();
    expect(result.imageUrl).toBeUndefined();
  });

  it('위도/경도가 유효하지 않으면 0으로 처리해야 한다', () => {
    const invalidRaw: SeoulKidsCafeRaw = {
      ...rawCafe,
      Y_CRDNT_VALUE: '',
      X_CRDNT_VALUE: '',
    };
    const result = parseSeoulKidsCafe(invalidRaw);
    expect(result.lat).toBe(0);
    expect(result.lng).toBe(0);
  });
});

describe('buildSeoulApiUrl', () => {
  it('API 키와 엔드포인트로 올바른 URL을 생성해야 한다', () => {
    const url = buildSeoulApiUrl('TEST_KEY', 1, 1000);
    expect(url).toBe('http://openAPI.seoul.go.kr:8088/TEST_KEY/json/tnFcltySttusInfo1011/1/1000/');
  });

  it('페이지 범위를 반영한 URL을 생성해야 한다', () => {
    const url = buildSeoulApiUrl('MY_KEY', 1001, 2000);
    expect(url).toBe('http://openAPI.seoul.go.kr:8088/MY_KEY/json/tnFcltySttusInfo1011/1001/2000/');
  });
});
