/**
 * CafeCard 컴포넌트 헬퍼 함수 테스트
 *
 * CafeCard 컴포넌트에서 사용하는 순수 함수들을 테스트합니다.
 * jest 환경(node)에서 React 컴포넌트 렌더링 없이 로직을 검증합니다.
 */

import {
  formatAgeRange,
  formatDistance,
  formatParking,
  getCardOpacity,
  shouldShowPartialBadge,
  isSafeUrl,
} from '../../components/CafeCard';
import type { KidsCafe, MatchStatus } from '../../types/index';

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

// ============================================================
// formatAgeRange 테스트
// ============================================================

describe('formatAgeRange', () => {
  it('minAge가 0이면 0-12개월로 표시해야 한다', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 0, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('0-12개월');
  });

  it('minAge가 12 이상이면 만 N세 형식으로 표시해야 한다', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 12, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('1세');
  });

  it('maxAge를 세 단위로 올바르게 표시해야 한다', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 0, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('7세');
  });

  it('minAge와 maxAge가 같은 개월 수이면 단일 값을 표시해야 한다', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 24, maxAge: 24 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('2세');
  });
});

// ============================================================
// formatDistance 테스트
// ============================================================

describe('formatDistance', () => {
  it('거리가 undefined이면 빈 문자열을 반환해야 한다', () => {
    expect(formatDistance(undefined)).toBe('');
  });

  it('거리가 1km 미만이면 소수 한 자리로 표시해야 한다', () => {
    expect(formatDistance(0.8)).toBe('0.8km');
  });

  it('거리가 1km 이상이면 소수 한 자리로 표시해야 한다', () => {
    expect(formatDistance(2.5)).toBe('2.5km');
  });

  it('거리가 0이면 0.0km를 반환해야 한다', () => {
    expect(formatDistance(0)).toBe('0.0km');
  });
});

// ============================================================
// formatParking 테스트
// ============================================================

describe('formatParking', () => {
  it('parking이 available이면 주차 가능을 반환해야 한다', () => {
    expect(formatParking('available')).toBe('주차 가능');
  });

  it('parking이 unavailable이면 주차 불가를 반환해야 한다', () => {
    expect(formatParking('unavailable')).toBe('주차 불가');
  });

  it('parking이 unknown이면 주차 정보 없음을 반환해야 한다', () => {
    expect(formatParking('unknown')).toBe('주차 정보 없음');
  });

  it('parking이 undefined이면 주차 정보 없음을 반환해야 한다', () => {
    expect(formatParking(undefined)).toBe('주차 정보 없음');
  });
});

// ============================================================
// getCardOpacity 테스트
// ============================================================

describe('getCardOpacity', () => {
  it('matchStatus가 full이면 opacity-100을 반환해야 한다', () => {
    expect(getCardOpacity('full')).toBe('opacity-100');
  });

  it('matchStatus가 partial이면 opacity-50을 반환해야 한다', () => {
    expect(getCardOpacity('partial')).toBe('opacity-50');
  });

  it('matchStatus가 none이면 opacity-30을 반환해야 한다', () => {
    expect(getCardOpacity('none')).toBe('opacity-30');
  });
});

// ============================================================
// shouldShowPartialBadge 테스트
// ============================================================

describe('shouldShowPartialBadge', () => {
  it('matchStatus가 partial이면 true를 반환해야 한다', () => {
    expect(shouldShowPartialBadge('partial')).toBe(true);
  });

  it('matchStatus가 full이면 false를 반환해야 한다', () => {
    expect(shouldShowPartialBadge('full')).toBe(false);
  });

  it('matchStatus가 none이면 false를 반환해야 한다', () => {
    expect(shouldShowPartialBadge('none')).toBe(false);
  });
});

// ============================================================
// isSafeUrl 테스트
// ============================================================

describe('isSafeUrl', () => {
  it('https:// 로 시작하는 URL은 안전하다고 반환해야 한다', () => {
    expect(isSafeUrl('https://place.map.kakao.com/123')).toBe(true);
  });

  it('http:// 로 시작하는 URL은 안전하다고 반환해야 한다', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('javascript: 로 시작하는 URL은 안전하지 않다고 반환해야 한다', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('data: 로 시작하는 URL은 안전하지 않다고 반환해야 한다', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});
