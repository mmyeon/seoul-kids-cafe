/**
 * Kakao API 호출 로직 테스트
 */

import {
  buildKakaoLocalSearchUrl,
  buildKakaoImageSearchUrl,
  extractKakaoPlaceUrl,
  extractKakaoImageUrl,
  mergeKakaoData,
} from '../../src/lib/kakao-api';
import type { KidsCafe } from '../../types/index';

describe('buildKakaoLocalSearchUrl', () => {
  it('카페명으로 카카오 로컬 검색 URL을 생성해야 한다', () => {
    const url = buildKakaoLocalSearchUrl('테스트 키즈카페');
    expect(url).toContain('https://dapi.kakao.com/v2/local/search/keyword.json');
    expect(url).toContain('size=1');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('테스트 키즈카페');
  });
});

describe('buildKakaoImageSearchUrl', () => {
  it('카페명으로 카카오 이미지 검색 URL을 생성해야 한다', () => {
    const url = buildKakaoImageSearchUrl('테스트 키즈카페');
    expect(url).toContain('https://dapi.kakao.com/v2/search/image');
    expect(url).toContain('size=1');
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('테스트 키즈카페');
  });
});

describe('extractKakaoPlaceUrl', () => {
  it('카카오 로컬 검색 응답에서 플레이스 URL을 추출해야 한다', () => {
    const response = {
      documents: [{ place_url: 'https://place.map.kakao.com/123' }],
    };
    expect(extractKakaoPlaceUrl(response)).toBe('https://place.map.kakao.com/123');
  });

  it('검색 결과가 없으면 undefined를 반환해야 한다', () => {
    expect(extractKakaoPlaceUrl({ documents: [] })).toBeUndefined();
    expect(extractKakaoPlaceUrl(null)).toBeUndefined();
  });
});

describe('extractKakaoImageUrl', () => {
  it('카카오 이미지 검색 응답에서 이미지 URL을 추출해야 한다', () => {
    const response = {
      documents: [{ image_url: 'https://t1.daumcdn.net/news/image.jpg' }],
    };
    expect(extractKakaoImageUrl(response)).toBe('https://t1.daumcdn.net/news/image.jpg');
  });

  it('네이버 CDN URL은 건너뛰고 다른 URL을 반환해야 한다', () => {
    const response = {
      documents: [
        { image_url: 'https://postfiles.pstatic.net/blocked.jpg' },
        { image_url: 'https://t1.daumcdn.net/news/image.jpg' },
      ],
    };
    expect(extractKakaoImageUrl(response)).toBe('https://t1.daumcdn.net/news/image.jpg');
  });

  it('모든 결과가 네이버 CDN이면 undefined를 반환해야 한다', () => {
    const response = {
      documents: [
        { image_url: 'https://postfiles.pstatic.net/blocked1.jpg' },
        { image_url: 'https://dthumb-phinf.pstatic.net/blocked2.jpg' },
      ],
    };
    expect(extractKakaoImageUrl(response)).toBeUndefined();
  });

  it('검색 결과가 없으면 undefined를 반환해야 한다', () => {
    expect(extractKakaoImageUrl({ documents: [] })).toBeUndefined();
    expect(extractKakaoImageUrl(null)).toBeUndefined();
  });
});

describe('mergeKakaoData', () => {
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

  it('카카오 데이터가 있으면 카페에 병합해야 한다', () => {
    const result = mergeKakaoData(
      baseCafe,
      'https://place.map.kakao.com/123',
      'https://example.com/image.jpg'
    );
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/123');
    expect(result.imageUrl).toBe('https://example.com/image.jpg');
  });

  it('카카오 데이터가 없으면 원본 카페 데이터를 그대로 반환해야 한다', () => {
    const result = mergeKakaoData(baseCafe, undefined, undefined);
    expect(result.kakaoPlaceUrl).toBeUndefined();
    expect(result.imageUrl).toBeUndefined();
    expect(result.name).toBe(baseCafe.name);
  });

  it('기존 카페 객체를 변경하지 않아야 한다 (immutable)', () => {
    mergeKakaoData(baseCafe, 'https://place.map.kakao.com/123', 'https://example.com/image.jpg');
    expect(baseCafe.kakaoPlaceUrl).toBeUndefined();
    expect(baseCafe.imageUrl).toBeUndefined();
  });
});
