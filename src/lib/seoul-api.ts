import type { SeoulKidsCafeRaw, KidsCafe } from '../../../types/index'

/**
 * 서울시 API URL 생성
 */
export function buildSeoulApiUrl(
  apiKey: string,
  startIndex: number,
  endIndex: number
): string {
  return `http://openAPI.seoul.go.kr:8088/${apiKey}/json/ChildCareInfo/${startIndex}/${endIndex}/`
}

/**
 * 개월 수 문자열을 숫자로 파싱
 */
export function parseAgeRange(
  minAgeStr: string,
  maxAgeStr: string
): { minAge: number; maxAge: number } {
  const minAge = parseInt(minAgeStr, 10)
  const maxAge = parseInt(maxAgeStr, 10)
  return {
    minAge: isNaN(minAge) ? 0 : minAge,
    maxAge: isNaN(maxAge) ? 0 : maxAge,
  }
}

/**
 * 서울시 원본 데이터를 KidsCafe 타입으로 변환
 */
export function parseSeoulKidsCafe(raw: SeoulKidsCafeRaw): KidsCafe {
  const lat = parseFloat(raw.LTTUD)
  const lng = parseFloat(raw.LNGTD)
  const ageRange = parseAgeRange(raw.MIN_AGE, raw.MAX_AGE)

  const id = `${raw.FCLTY_NM}-${raw.RDNMADR}`
    .replace(/\s+/g, '-')
    .toLowerCase()

  return {
    id,
    name: raw.FCLTY_NM,
    address: raw.RDNMADR,
    lat: isNaN(lat) ? 0 : lat,
    lng: isNaN(lng) ? 0 : lng,
    ageRange,
    operatingHours: raw.OPER_HR,
    phone: raw.TELNO,
    reservationUrl: raw.RESERVATION_URL,
    naverPlaceUrl: raw.NAVER_PLACE_URL,
    imageUrl: raw.IMAGE_URL,
  }
}

/**
 * 서울시 API 응답 원본 타입
 */
type SeoulApiResponse = {
  ChildCareInfo: {
    list_total_count: number
    RESULT: { CODE: string; MESSAGE: string }
    row: SeoulKidsCafeRaw[]
  }
}

/**
 * 서울시 키즈카페 API 호출 및 파싱
 */
export async function fetchSeoulKidsCafes(apiKey: string): Promise<KidsCafe[]> {
  const url = buildSeoulApiUrl(apiKey, 1, 1000)
  const response = await fetch(url, {
    next: { revalidate: 86400 },
  })

  if (!response.ok) {
    throw new Error(`서울시 API 호출 실패: ${response.status}`)
  }

  const data: SeoulApiResponse = await response.json()
  const rows = data?.ChildCareInfo?.row ?? []

  return rows.map(parseSeoulKidsCafe)
}
