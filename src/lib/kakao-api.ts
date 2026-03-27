import { KidsCafe } from '../../types';

const KAKAO_LOCAL_SEARCH_BASE = 'https://dapi.kakao.com/v2/local/search/keyword.json';

/**
 * 카카오 로컬 검색 URL 생성
 */
export function buildKakaoLocalSearchUrl(cafeName: string): string {
  return `${KAKAO_LOCAL_SEARCH_BASE}?query=${encodeURIComponent(cafeName)}&size=1`;
}

type KakaoLocalSearchResponse = {
  documents: Array<{ place_url: string; [key: string]: unknown }>;
} | null;

/**
 * 카카오 로컬 검색 응답에서 플레이스 URL 추출
 */
export function extractKakaoPlaceUrl(response: KakaoLocalSearchResponse): string | undefined {
  if (!response?.documents?.length) return undefined;
  return response.documents[0].place_url || undefined;
}

/**
 * 카카오 플레이스 URL을 카페에 병합 (immutable)
 */
export function mergeKakaoData(kidsCafe: KidsCafe, kakaoPlaceUrl: string | undefined): KidsCafe {
  return {
    ...kidsCafe,
    kakaoPlaceUrl: kakaoPlaceUrl ?? kidsCafe.kakaoPlaceUrl,
  };
}

type KakaoCredentials = {
  restApiKey: string;
};

/**
 * 카카오 API 공통 헤더 생성
 */
function buildKakaoHeaders(credentials: KakaoCredentials): HeadersInit {
  return {
    Authorization: `KakaoAK ${credentials.restApiKey}`,
  };
}

/**
 * 단일 카페에 대해 Kakao Local 검색 후 플레이스 URL 병합
 */
export async function enrichKidsCafeWithKakaoData(
  kidsCafe: KidsCafe,
  credentials: KakaoCredentials
): Promise<KidsCafe> {
  const headers = buildKakaoHeaders(credentials);

  const response = await fetch(buildKakaoLocalSearchUrl(kidsCafe.name), { headers });
  const localData: KakaoLocalSearchResponse = response.ok ? await response.json() : null;

  return mergeKakaoData(kidsCafe, extractKakaoPlaceUrl(localData));
}
