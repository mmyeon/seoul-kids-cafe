import { KidsCafe } from '../../types';

const KAKAO_LOCAL_SEARCH_BASE = 'https://dapi.kakao.com/v2/local/search/keyword.json';
const KAKAO_IMAGE_SEARCH_BASE = 'https://dapi.kakao.com/v2/search/image';

/**
 * 카카오 로컬 검색 URL 생성
 */
export function buildKakaoLocalSearchUrl(cafeName: string): string {
  return `${KAKAO_LOCAL_SEARCH_BASE}?query=${encodeURIComponent(cafeName)}&size=1`;
}

/**
 * 카카오 이미지 검색 URL 생성
 */
export function buildKakaoImageSearchUrl(cafeName: string): string {
  return `${KAKAO_IMAGE_SEARCH_BASE}?query=${encodeURIComponent(cafeName)}&size=5`;
}

const BLOCKED_IMAGE_DOMAINS = ['pstatic.net', 'naver.net'];

/**
 * 핫링크 차단 도메인 여부 확인
 */
export function isBlockedImageDomain(url: string): boolean {
  return BLOCKED_IMAGE_DOMAINS.some((domain) => url.includes(domain));
}

type KakaoLocalSearchResponse = {
  documents: Array<{ place_url: string; [key: string]: unknown }>;
} | null;

type KakaoImageSearchResponse = {
  documents: Array<{ image_url: string; [key: string]: unknown }>;
} | null;

/**
 * 카카오 로컬 검색 응답에서 플레이스 URL 추출
 */
export function extractKakaoPlaceUrl(response: KakaoLocalSearchResponse): string | undefined {
  if (!response?.documents?.length) return undefined;
  return response.documents[0].place_url || undefined;
}

/**
 * 카카오 이미지 검색 응답에서 이미지 URL 추출 (핫링크 차단 도메인 제외)
 */
export function extractKakaoImageUrl(response: KakaoImageSearchResponse): string | undefined {
  if (!response?.documents?.length) return undefined;
  const doc = response.documents.find((d) => {
    const url = d.image_url as string;
    return url && !isBlockedImageDomain(url);
  });
  return (doc?.image_url as string) || undefined;
}

/**
 * 카카오 데이터를 카페에 병합 (immutable)
 */
export function mergeKakaoData(
  kidsCafe: KidsCafe,
  kakaoPlaceUrl: string | undefined,
  imageUrl: string | undefined
): KidsCafe {
  return {
    ...kidsCafe,
    kakaoPlaceUrl: kakaoPlaceUrl ?? kidsCafe.kakaoPlaceUrl,
    imageUrl: imageUrl ?? kidsCafe.imageUrl,
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
 * 단일 카페에 대해 Kakao Local + Image 병렬 호출 후 데이터 병합
 */
export async function enrichKidsCafeWithKakaoData(
  kidsCafe: KidsCafe,
  credentials: KakaoCredentials
): Promise<KidsCafe> {
  const headers = buildKakaoHeaders(credentials);

  const [localResult, imageResult] = await Promise.allSettled([
    fetch(buildKakaoLocalSearchUrl(kidsCafe.name), { headers }).then((r) =>
      r.ok ? (r.json() as Promise<KakaoLocalSearchResponse>) : null
    ),
    fetch(buildKakaoImageSearchUrl(kidsCafe.name), { headers }).then((r) =>
      r.ok ? (r.json() as Promise<KakaoImageSearchResponse>) : null
    ),
  ]);

  const localData = localResult.status === 'fulfilled' ? localResult.value : null;
  const imageData = imageResult.status === 'fulfilled' ? imageResult.value : null;

  const kakaoPlaceUrl = extractKakaoPlaceUrl(localData);
  const imageUrl = extractKakaoImageUrl(imageData);

  return mergeKakaoData(kidsCafe, kakaoPlaceUrl, imageUrl);
}
