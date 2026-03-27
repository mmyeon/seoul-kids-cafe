import { formatAgeRange, normalizeOperatingHours } from '../../src/lib/kidsCafeCard';

describe('normalizeOperatingHours', () => {
  it('풀네임 요일을 단축형으로 변환하고 ~ 앞뒤에 공백을 추가해야 한다 (화~일요일 → 화 ~ 일)', () => {
    expect(normalizeOperatingHours('화~일요일')).toBe('화 ~ 일');
  });

  it('풀네임 요일을 단축형으로 변환해야 한다 (월요일~금요일 → 월 ~ 금)', () => {
    expect(normalizeOperatingHours('월요일~금요일')).toBe('월 ~ 금');
  });

  it('~ 없는 나열형은 단축형으로 변환만 한다 (월화수목금)', () => {
    expect(normalizeOperatingHours('월화수목금')).toBe('월화수목금');
  });

  it('혼합된 경우를 처리해야 한다 (화~토요일 → 화 ~ 토)', () => {
    expect(normalizeOperatingHours('화~토요일')).toBe('화 ~ 토');
  });

  it('빈 문자열은 그대로 반환해야 한다', () => {
    expect(normalizeOperatingHours('')).toBe('');
  });
});

describe('formatAgeRange', () => {
  it('"0 ~ 7세" 형식으로 반환해야 한다', () => {
    expect(formatAgeRange({ minAge: 0, maxAge: 7 })).toBe('0 ~ 7세');
  });

  it('"1 ~ 6세" 형식으로 반환해야 한다', () => {
    expect(formatAgeRange({ minAge: 1, maxAge: 6 })).toBe('1 ~ 6세');
  });

  it('minAge와 maxAge가 같으면 단일 나이를 반환해야 한다', () => {
    expect(formatAgeRange({ minAge: 5, maxAge: 5 })).toBe('5세');
  });
});
