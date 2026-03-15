// ============================================================
// 서울시 API 원본 응답 타입
// ============================================================

/** 서울시 공공데이터 API에서 반환되는 키즈카페 원본 데이터 */
export type SeoulKidsCafeRaw = {
  /** 시설명 */
  FCLTY_NM: string
  /** 도로명 주소 */
  RDNMADR: string
  /** 위도 (문자열) */
  LTTUD: string
  /** 경도 (문자열) */
  LNGTD: string
  /** 최소 연령 (개월 수, 문자열) */
  MIN_AGE: string
  /** 최대 연령 (개월 수, 문자열) */
  MAX_AGE: string
  /** 운영 시간 */
  OPER_HR: string
  /** 전화번호 */
  TELNO: string
  /** 예약 URL */
  RESERVATION_URL: string
  /** 네이버 플레이스 URL (선택) */
  NAVER_PLACE_URL?: string
  /** 대표 이미지 URL (선택) */
  IMAGE_URL?: string
}

// ============================================================
// 정제된 카페 데이터 타입
// ============================================================

/** 카페 카드에 표시할 정제된 키즈카페 데이터 */
export type KidsCafe = {
  /** 고유 식별자 */
  id: string
  /** 카페 이름 */
  name: string
  /** 도로명 주소 */
  address: string
  /** 위도 */
  lat: number
  /** 경도 */
  lng: number
  /** 이용 가능 연령 범위 (개월 수 기준) */
  ageRange: { minAge: number; maxAge: number }
  /** 운영 시간 */
  operatingHours: string
  /** 전화번호 */
  phone: string
  /** 예약 URL */
  reservationUrl: string
  /** 네이버 플레이스 URL (선택) */
  naverPlaceUrl?: string
  /** 대표 이미지 URL (선택) */
  imageUrl?: string
  /** 주차 가능 여부 (선택) */
  parking?: 'available' | 'unavailable' | 'unknown'
}

// ============================================================
// 필터 및 상태 타입
// ============================================================

/**
 * 나이 필터 옵션
 * - under12m: 12개월 미만
 * - '1'~'7': 만 1세~7세
 */
export type AgeFilter = 'under12m' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

/**
 * 카페 카드와 필터 조건의 매칭 상태
 * - full: 완전 일치
 * - partial: 부분 일치
 * - none: 불일치
 */
export type MatchStatus = 'full' | 'partial' | 'none'
