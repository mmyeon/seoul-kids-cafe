/**
 * CafeCard 컴포넌트 헬퍼 함수 테스트
 *
 * CafeCard 컴포넌트(src/components/CafeCard.tsx)에서 내보내는
 * 순수 함수들을 테스트합니다.
 * jest 환경(node)에서 React 컴포넌트 렌더링 없이 로직을 검증합니다.
 */

import {
  formatAgeRange,
  formatDistance,
  formatParking,
  getCardOpacity,
  shouldShowPartialBadge,
  isSafeUrl,
} from '../../src/components/KidsCafeCard';
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
  it('shouldShowInfantLabelWhenMinAgeIsZero', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 0, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('0-12개월');
  });

  it('shouldShowYearFormatWhenMinAgeIsAtLeast12Months', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 12, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('1세');
  });

  it('shouldShowCorrectMaxAgeInYears', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 0, maxAge: 84 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('7세');
  });

  it('shouldShowSingleValueWhenMinAndMaxAgeAreSame', () => {
    const cafe: KidsCafe = { ...baseCafe, ageRange: { minAge: 24, maxAge: 24 } };
    const result = formatAgeRange(cafe.ageRange);
    expect(result).toContain('2세');
  });
});

// ============================================================
// formatDistance 테스트
// ============================================================

describe('formatDistance', () => {
  it('shouldReturnEmptyStringWhenDistanceIsUndefined', () => {
    expect(formatDistance(undefined)).toBe('');
  });

  it('shouldReturnOneDecimalPlaceForDistanceLessThan1km', () => {
    expect(formatDistance(0.8)).toBe('0.8km');
  });

  it('shouldReturnOneDecimalPlaceForDistanceGreaterThan1km', () => {
    expect(formatDistance(2.5)).toBe('2.5km');
  });

  it('shouldReturnZeroPointZeroKmWhenDistanceIsZero', () => {
    expect(formatDistance(0)).toBe('0.0km');
  });
});

// ============================================================
// formatParking 테스트
// ============================================================

describe('formatParking', () => {
  it('shouldReturnParkingAvailableWhenStatusIsAvailable', () => {
    expect(formatParking('available')).toBe('주차 가능');
  });

  it('shouldReturnParkingUnavailableWhenStatusIsUnavailable', () => {
    expect(formatParking('unavailable')).toBe('주차 불가');
  });

  it('shouldReturnNoInfoWhenStatusIsUnknown', () => {
    expect(formatParking('unknown')).toBe('주차 정보 없음');
  });

  it('shouldReturnNoInfoWhenStatusIsUndefined', () => {
    expect(formatParking(undefined)).toBe('주차 정보 없음');
  });
});

// ============================================================
// getCardOpacity 테스트
// ============================================================

describe('getCardOpacity', () => {
  it('shouldReturnFullOpacityForFullMatch', () => {
    expect(getCardOpacity('full')).toBe('opacity-100');
  });

  it('shouldReturnHalfOpacityForPartialMatch', () => {
    expect(getCardOpacity('partial')).toBe('opacity-50');
  });

  it('shouldReturnLowOpacityForNoMatch', () => {
    expect(getCardOpacity('none')).toBe('opacity-30');
  });
});

// ============================================================
// shouldShowPartialBadge 테스트
// ============================================================

describe('shouldShowPartialBadge', () => {
  it('shouldReturnTrueForPartialMatch', () => {
    expect(shouldShowPartialBadge('partial')).toBe(true);
  });

  it('shouldReturnFalseForFullMatch', () => {
    expect(shouldShowPartialBadge('full')).toBe(false);
  });

  it('shouldReturnFalseForNoMatch', () => {
    expect(shouldShowPartialBadge('none')).toBe(false);
  });
});

// ============================================================
// isSafeUrl 테스트
// ============================================================

describe('isSafeUrl', () => {
  it('shouldReturnTrueForHttpsUrl', () => {
    expect(isSafeUrl('https://example.com')).toBe(true);
  });

  it('shouldReturnTrueForHttpUrl', () => {
    expect(isSafeUrl('http://example.com')).toBe(true);
  });

  it('shouldReturnFalseForJavascriptProtocol', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
  });

  it('shouldReturnFalseForDataProtocol', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});
