import type { KidsCafe } from '../../../types/index'

const NAVER_LOCAL_SEARCH_BASE = 'https://openapi.naver.com/v1/search/local.json'
const NAVER_IMAGE_SEARCH_BASE = 'https://openapi.naver.com/v1/search/image'

/**
 * 네이버 로컬 검색 URL 생성
 */
export function buildNaverLocalSearchUrl(cafeName: string): string {
  return `${NAVER_LOCAL_SEARCH_BASE}?query=${encodeURIComponent(cafeName)}&display=1`
}

/**
 * 네이버 이미지 검색 URL 생성
 */
export function buildNaverImageSearchUrl(cafeName: string): string {
  return `${NAVER_IMAGE_SEARCH_BASE}?query=${encodeURIComponent(cafeName)}&display=1`
}

type NaverSearchResponse = {
  items: Array<{ link: string; [key: string]: unknown }>
} | null

/**
 * 네이버 로컬 검색 응답에서 플레이스 URL 추출
 */
export function extractNaverPlaceUrl(
  response: NaverSearchResponse
): string | undefined {
  if (!response?.items?.length) return undefined
  return response.items[0].link || undefined
}

/**
 * 네이버 이미지 검색 응답에서 이미지 URL 추출
 */
export function extractNaverImageUrl(
  response: NaverSearchResponse
): string | undefined {
  if (!response?.items?.length) return undefined
  return response.items[0].link || undefined
}

/**
 * 네이버 데이터를 카페에 병합 (immutable)
 */
export function mergeNaverData(
  cafe: KidsCafe,
  naverPlaceUrl: string | undefined,
  imageUrl: string | undefined
): KidsCafe {
  return {
    ...cafe,
    naverPlaceUrl: naverPlaceUrl ?? cafe.naverPlaceUrl,
    imageUrl: imageUrl ?? cafe.imageUrl,
  }
}

type NaverCredentials = {
  clientId: string
  clientSecret: string
}

/**
 * 네이버 API 공통 헤더 생성
 */
function buildNaverHeaders(credentials: NaverCredentials): HeadersInit {
  return {
    'X-Naver-Client-Id': credentials.clientId,
    'X-Naver-Client-Secret': credentials.clientSecret,
  }
}

/**
 * 단일 카페에 대해 Naver Local + Image 병렬 호출 후 데이터 병합
 */
export async function enrichCafeWithNaverData(
  cafe: KidsCafe,
  credentials: NaverCredentials
): Promise<KidsCafe> {
  const headers = buildNaverHeaders(credentials)

  const [localResult, imageResult] = await Promise.allSettled([
    fetch(buildNaverLocalSearchUrl(cafe.name), { headers }).then((r) =>
      r.ok ? (r.json() as Promise<NaverSearchResponse>) : null
    ),
    fetch(buildNaverImageSearchUrl(cafe.name), { headers }).then((r) =>
      r.ok ? (r.json() as Promise<NaverSearchResponse>) : null
    ),
  ])

  const localData =
    localResult.status === 'fulfilled' ? localResult.value : null
  const imageData =
    imageResult.status === 'fulfilled' ? imageResult.value : null

  const naverPlaceUrl = extractNaverPlaceUrl(localData)
  const imageUrl = extractNaverImageUrl(imageData)

  return mergeNaverData(cafe, naverPlaceUrl, imageUrl)
}
