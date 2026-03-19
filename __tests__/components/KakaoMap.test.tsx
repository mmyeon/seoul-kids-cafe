/**
 * KakaoMap 컴포넌트 헬퍼 함수 테스트
 *
 * KakaoMap 컴포넌트에서 사용하는 순수 함수들을 테스트합니다.
 * jest 환경(node)에서 React 컴포넌트 렌더링 없이 로직을 검증합니다.
 */

import {
  buildSdkUrl,
  isValidCoordinate,
  findKidsCafeById,
  getMarkerZIndex,
} from '../../src/lib/kakao-map-utils';
import type { KidsCafe } from '../../types/index';

// ============================================================
// 테스트 픽스처
// ============================================================

const baseCafe: KidsCafe = {
  id: 'cafe-001',
  name: '테스트 키즈카페',
  address: '서울특별시 강남구 테헤란로 123',
  lat: 37.5665,
  lng: 126.978,
  ageRange: { minAge: 0, maxAge: 84 },
  operatingHours: '10:00~20:00',
  phone: '02-1234-5678',
};

const cafes: KidsCafe[] = [
  baseCafe,
  { ...baseCafe, id: 'cafe-002', name: '두 번째 키즈카페', lat: 37.57, lng: 127.0 },
  { ...baseCafe, id: 'cafe-003', name: '세 번째 키즈카페', lat: 37.58, lng: 127.01 },
];

// ============================================================
// buildSdkUrl 테스트
// ============================================================

describe('buildSdkUrl', () => {
  it('appKey를 포함한 Kakao Maps SDK URL을 반환해야 한다', () => {
    const url = buildSdkUrl('test-api-key');
    expect(url).toBe(
      'https://dapi.kakao.com/v2/maps/sdk.js?appkey=test-api-key&libraries=services'
    );
  });

  it('appKey가 빈 문자열이면 빈 문자열을 반환해야 한다', () => {
    const url = buildSdkUrl('');
    expect(url).toBe('');
  });

  it('URL은 https://로 시작해야 한다', () => {
    const url = buildSdkUrl('some-key');
    expect(url.startsWith('https://')).toBe(true);
  });
});

// ============================================================
// isValidCoordinate 테스트
// ============================================================

describe('isValidCoordinate', () => {
  it('유효한 서울 좌표를 true로 반환해야 한다', () => {
    expect(isValidCoordinate(37.5665, 126.978)).toBe(true);
  });

  it('위도가 -90 미만이면 false를 반환해야 한다', () => {
    expect(isValidCoordinate(-91, 126.978)).toBe(false);
  });

  it('위도가 90 초과이면 false를 반환해야 한다', () => {
    expect(isValidCoordinate(91, 126.978)).toBe(false);
  });

  it('경도가 -180 미만이면 false를 반환해야 한다', () => {
    expect(isValidCoordinate(37.5665, -181)).toBe(false);
  });

  it('경도가 180 초과이면 false를 반환해야 한다', () => {
    expect(isValidCoordinate(37.5665, 181)).toBe(false);
  });

  it('위도 또는 경도가 NaN이면 false를 반환해야 한다', () => {
    expect(isValidCoordinate(NaN, 126.978)).toBe(false);
    expect(isValidCoordinate(37.5665, NaN)).toBe(false);
  });

  it('위도 경도가 0이면 false를 반환해야 한다 (미설정 좌표)', () => {
    expect(isValidCoordinate(0, 0)).toBe(false);
  });
});

// ============================================================
// findCafeById 테스트
// ============================================================

describe('findCafeById', () => {
  it('일치하는 id가 있으면 해당 카페를 반환해야 한다', () => {
    const result = findKidsCafeById('cafe-002', cafes);
    expect(result).toBeDefined();
    expect(result?.id).toBe('cafe-002');
    expect(result?.name).toBe('두 번째 키즈카페');
  });

  it('일치하는 id가 없으면 undefined를 반환해야 한다', () => {
    const result = findKidsCafeById('non-existent', cafes);
    expect(result).toBeUndefined();
  });

  it('빈 배열에서는 undefined를 반환해야 한다', () => {
    const result = findKidsCafeById('cafe-001', []);
    expect(result).toBeUndefined();
  });

  it('첫 번째 카페를 올바르게 찾아야 한다', () => {
    const result = findKidsCafeById('cafe-001', cafes);
    expect(result?.id).toBe('cafe-001');
  });

  it('마지막 카페를 올바르게 찾아야 한다', () => {
    const result = findKidsCafeById('cafe-003', cafes);
    expect(result?.id).toBe('cafe-003');
  });
});

// ============================================================
// getMarkerZIndex 테스트
// ============================================================

describe('getMarkerZIndex', () => {
  it('선택된 카페의 마커는 높은 z-index(10)를 반환해야 한다', () => {
    expect(getMarkerZIndex('cafe-001', 'cafe-001')).toBe(10);
  });

  it('선택되지 않은 카페의 마커는 기본 z-index(1)를 반환해야 한다', () => {
    expect(getMarkerZIndex('cafe-001', 'cafe-002')).toBe(1);
  });

  it('선택된 카페가 없으면(undefined) 기본 z-index(1)를 반환해야 한다', () => {
    expect(getMarkerZIndex('cafe-001', undefined)).toBe(1);
  });
});
