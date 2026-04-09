/**
 * Kakao API 호출 로직 테스트
 */

import {
  buildKakaoLocalSearchUrl,
  extractKakaoPlaceUrl,
  mergeKakaoData,
  enrichKidsCafeWithKakaoData,
} from '../../src/lib/kakao-api';
import type { KidsCafe } from '../../types/index';

describe('buildKakaoLocalSearchUrl', () => {
  it('주소로 카카오 로컬 검색 URL을 생성해야 한다', () => {
    const url = buildKakaoLocalSearchUrl('서울특별시 양천구 신정로 123');
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe('https://dapi.kakao.com/v2/local/search/keyword.json');
    expect(parsed.searchParams.get('size')).toBe('1');
    expect(parsed.searchParams.get('query')).toBe('서울특별시 양천구 신정로 123');
  });

  it('좌표가 있으면 x, y, radius 파라미터를 포함해야 한다', () => {
    const url = buildKakaoLocalSearchUrl('서울특별시 양천구 신정로 123', { lat: 37.5665, lng: 126.978 });
    const parsed = new URL(url);
    expect(parsed.searchParams.get('x')).toBe('126.978');
    expect(parsed.searchParams.get('y')).toBe('37.5665');
    expect(parsed.searchParams.get('radius')).toBe('300');
  });

  it('좌표가 0,0이면 좌표 파라미터를 포함하지 않아야 한다', () => {
    const url = buildKakaoLocalSearchUrl('서울특별시 양천구 신정로 123', { lat: 0, lng: 0 });
    const parsed = new URL(url);
    expect(parsed.searchParams.has('x')).toBe(false);
    expect(parsed.searchParams.has('y')).toBe(false);
    expect(parsed.searchParams.has('radius')).toBe(false);
  });

  it('coords가 없으면 좌표 파라미터를 포함하지 않아야 한다', () => {
    const url = buildKakaoLocalSearchUrl('서울특별시 양천구 신정로 123');
    const parsed = new URL(url);
    expect(parsed.searchParams.has('x')).toBe(false);
    expect(parsed.searchParams.has('y')).toBe(false);
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
    birthYearRange: { younger: 2018, older: 2025 },
    imageUrl: 'https://example.com/image.jpg',
    detailUrl: 'https://umppa.com/cafe-001',
  };

  it('카카오 플레이스 URL이 있으면 카페에 병합해야 한다', () => {
    const result = mergeKakaoData(baseCafe, 'https://place.map.kakao.com/123');
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/123');
  });

  it('카카오 플레이스 URL이 없으면 원본 카페 데이터를 그대로 반환해야 한다', () => {
    const result = mergeKakaoData(baseCafe, undefined);
    expect(result.kakaoPlaceUrl).toBeUndefined();
    expect(result.name).toBe(baseCafe.name);
  });

  it('기존 카페 객체를 변경하지 않아야 한다 (immutable)', () => {
    mergeKakaoData(baseCafe, 'https://place.map.kakao.com/123');
    expect(baseCafe.kakaoPlaceUrl).toBeUndefined();
  });
});

describe('enrichKidsCafeWithKakaoData', () => {
  const baseCafe: KidsCafe = {
    id: 'cafe-001',
    name: '테스트 키즈카페',
    address: '서울특별시 강남구 테헤란로 123',
    lat: 37.5665,
    lng: 126.978,
    ageRange: { minAge: 0, maxAge: 84 },
    operatingHours: '10:00~20:00',
    phone: '02-1234-5678',
    birthYearRange: { younger: 2018, older: 2025 },
    imageUrl: 'https://example.com/image.jpg',
    detailUrl: 'https://umppa.com/cafe-001',
  };

  const credentials = { restApiKey: 'test-api-key' };

  const makeSuccessResponse = (placeUrl: string) =>
    new Response(JSON.stringify({ documents: [{ place_url: placeUrl }] }), { status: 200 });

  const makeEmptyResponse = () =>
    new Response(JSON.stringify({ documents: [] }), { status: 200 });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const getQueryParam = (callIndex: number) =>
    new URL((global.fetch as jest.Mock).mock.calls[callIndex][0]).searchParams.get('query');

  it('전화번호가 있으면 전화번호로 먼저 검색한다', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce(makeSuccessResponse('https://place.map.kakao.com/phone-result'));

    const result = await enrichKidsCafeWithKakaoData(baseCafe, credentials);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getQueryParam(0)).toBe(baseCafe.phone);
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/phone-result');
  });

  it('전화번호 검색 실패 시 주소로 폴백한다', async () => {
    const mockFetch = global.fetch as jest.Mock;
    mockFetch
      .mockResolvedValueOnce(makeEmptyResponse())
      .mockResolvedValueOnce(makeSuccessResponse('https://place.map.kakao.com/address-result'));

    const result = await enrichKidsCafeWithKakaoData(baseCafe, credentials);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(getQueryParam(1)).toBe(baseCafe.address);
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/address-result');
  });

  it('전화번호가 없으면 주소로 검색한다', async () => {
    const cafeWithoutPhone = { ...baseCafe, phone: '' };
    const mockFetch = global.fetch as jest.Mock;
    mockFetch.mockResolvedValueOnce(makeSuccessResponse('https://place.map.kakao.com/address-result'));

    const result = await enrichKidsCafeWithKakaoData(cafeWithoutPhone, credentials);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getQueryParam(0)).toBe(cafeWithoutPhone.address);
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/address-result');
  });

  it('주소 검색 실패 시 이름으로 폴백한다', async () => {
    const cafeWithoutPhone = { ...baseCafe, phone: '' };
    const mockFetch = global.fetch as jest.Mock;
    mockFetch
      .mockResolvedValueOnce(makeEmptyResponse())
      .mockResolvedValueOnce(makeSuccessResponse('https://place.map.kakao.com/name-result'));

    const result = await enrichKidsCafeWithKakaoData(cafeWithoutPhone, credentials);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(getQueryParam(1)).toBe(cafeWithoutPhone.name);
    expect(result.kakaoPlaceUrl).toBe('https://place.map.kakao.com/name-result');
  });
});
