/**
 * Naver API 호출 로직 테스트
 */

import {
  buildNaverLocalSearchUrl,
  buildNaverImageSearchUrl,
  extractNaverPlaceUrl,
  extractNaverImageUrl,
  mergeNaverData,
} from '../../src/lib/naver-api';
import type { KidsCafe } from '../../types/index';

describe('buildNaverLocalSearchUrl', () => {
  it('카페명으로 네이버 로컬 검색 URL을 생성해야 한다', () => {
    const url = buildNaverLocalSearchUrl('테스트 키즈카페');
    expect(url).toContain('https://openapi.naver.com/v1/search/local.json');
    expect(url).toContain('display=1');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('테스트 키즈카페');
  });
});

describe('buildNaverImageSearchUrl', () => {
  it('카페명으로 네이버 이미지 검색 URL을 생성해야 한다', () => {
    const url = buildNaverImageSearchUrl('테스트 키즈카페');
    expect(url).toContain('https://openapi.naver.com/v1/search/image');
    expect(url).toContain('display=1');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('테스트 키즈카페');
  });
});

describe('extractNaverPlaceUrl', () => {
  it('네이버 로컬 검색 응답에서 플레이스 URL을 추출해야 한다', () => {
    const response = {
      items: [{ link: 'https://place.naver.com/restaurant/123' }],
    };
    expect(extractNaverPlaceUrl(response)).toBe('https://place.naver.com/restaurant/123');
  });

  it('검색 결과가 없으면 undefined를 반환해야 한다', () => {
    expect(extractNaverPlaceUrl({ items: [] })).toBeUndefined();
    expect(extractNaverPlaceUrl(null)).toBeUndefined();
  });
});

describe('extractNaverImageUrl', () => {
  it('네이버 이미지 검색 응답에서 이미지 URL을 추출해야 한다', () => {
    const response = {
      items: [{ link: 'https://example.com/image.jpg' }],
    };
    expect(extractNaverImageUrl(response)).toBe('https://example.com/image.jpg');
  });

  it('검색 결과가 없으면 undefined를 반환해야 한다', () => {
    expect(extractNaverImageUrl({ items: [] })).toBeUndefined();
    expect(extractNaverImageUrl(null)).toBeUndefined();
  });
});

describe('mergeNaverData', () => {
  const baseCafe: KidsCafe = {
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

  it('네이버 데이터가 있으면 카페에 병합해야 한다', () => {
    const result = mergeNaverData(
      baseCafe,
      'https://place.naver.com/123',
      'https://example.com/image.jpg'
    );
    expect(result.naverPlaceUrl).toBe('https://place.naver.com/123');
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('네이버 데이터가 없으면 원본 카페 데이터를 그대로 반환해야 한다', () => {
    const result = mergeNaverData(baseCafe, undefined, undefined);
    expect(result.naverPlaceUrl).toBeUndefined();
    expect(result.imageUrl).toBeUndefined();
    expect(result.name).toBe(baseCafe.name);
  });

  it('기존 카페 객체를 변경하지 않아야 한다 (immutable)', () => {
    mergeNaverData(baseCafe, 'https://place.naver.com/123', 'https://example.com/image.jpg');
    expect(baseCafe.naverPlaceUrl).toBeUndefined();
    expect(baseCafe.imageUrl).toBeUndefined();
  });
});
