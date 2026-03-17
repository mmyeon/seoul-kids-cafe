/**
 * GET /api/cafes Route 테스트
 *
 * Next.js Route Handler를 직접 import하여 단위 테스트합니다.
 */

import { GET } from '../../src/app/api/cafes/route';

// fetch 모킹
const mockFetch = jest.fn();
global.fetch = mockFetch;

// 환경변수 설정
const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.resetAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    SEOUL_API_KEY: 'TEST_SEOUL_KEY',
    KAKAO_REST_API_KEY: 'TEST_KAKAO_KEY',
  };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

const mockSeoulApiResponse = {
  tnFcltySttusInfo1011: {
    list_total_count: 1,
    RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' },
    row: [
      {
        FCLTY_ID: 'GN260101',
        FCLTY_NM: '강남 키즈카페',
        BASS_ADRES: '서울특별시 강남구 테헤란로 123',
        DETAIL_ADRES: '',
        X_CRDNT_VALUE: '126.9780',
        Y_CRDNT_VALUE: '37.5665',
        POSBL_AGRDE: '0세 ~ 7세',
        OPEN_WEEK: '화~일요일',
        CLOSE_WEEK: '월요일, 공휴일',
        CTTPC: '02-1234-5678',
        RNTFEE_FREE_AT: 'Y',
      },
    ],
  },
};

const mockKakaoLocalResponse = {
  documents: [{ place_url: 'https://place.map.kakao.com/123' }],
};

const mockKakaoImageResponse = {
  documents: [{ image_url: 'https://cdn.example.com/image.jpg' }],
};

describe('GET /api/cafes', () => {
  it('정상적인 요청에 키즈카페 목록을 반환해야 한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSeoulApiResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKakaoLocalResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKakaoImageResponse),
      });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('강남 키즈카페');
  });

  it('Kakao 데이터가 병합되어 반환되어야 한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSeoulApiResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKakaoLocalResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockKakaoImageResponse),
      });

    const response = await GET();
    const data = await response.json();

    expect(data[0].kakaoPlaceUrl).toBe('https://place.map.kakao.com/123');
    expect(data[0].imageUrl).toBe('https://cdn.example.com/image.jpg');
  });

  it('Kakao API 실패 시 서울시 데이터만 반환해야 한다 (fallback)', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSeoulApiResponse),
      })
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0].name).toBe('강남 키즈카페');
    expect(data[0].kakaoPlaceUrl).toBeUndefined();
    expect(data[0].imageUrl).toBeUndefined();
  });

  it('SEOUL_API_KEY 미설정 시 500 에러를 반환해야 한다', async () => {
    delete process.env.SEOUL_API_KEY;

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('SEOUL_API_KEY');
  });

  it('서울시 API 호출 실패 시 500 에러를 반환해야 한다', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeTruthy();
  });
});
