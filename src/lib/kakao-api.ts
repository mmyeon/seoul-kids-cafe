import { KidsCafe } from '../../types';

const KAKAO_LOCAL_SEARCH_BASE = 'https://dapi.kakao.com/v2/local/search/keyword.json';

type KakaoSearchCoords = {
  lat: number;
  lng: number;
};

/**
 * 카카오 로컬 검색 URL 생성
 * coords를 전달하면 해당 좌표 근처(300m)에서 검색하여 이름이 다른 경우에도 정확한 장소를 찾을 수 있다
 */
export function buildKakaoLocalSearchUrl(query: string, coords?: KakaoSearchCoords): string {
  const params = new URLSearchParams({
    query,
    size: '1',
  });

  // lat/lng 둘 다 0이면 미설정 데이터로 처리 → 좌표 파라미터 생략
  if (coords && (coords.lat !== 0 || coords.lng !== 0)) {
    params.set('x', String(coords.lng)); // 카카오 API: x = 경도(lng)
    params.set('y', String(coords.lat)); // 카카오 API: y = 위도(lat)
    params.set('radius', '300');
  }

  return `${KAKAO_LOCAL_SEARCH_BASE}?${params.toString()}`;
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
 * 1차: 주소로 검색, 2차: 이름으로 검색 (폴백)
 */
export async function enrichKidsCafeWithKakaoData(
  kidsCafe: KidsCafe,
  credentials: KakaoCredentials
): Promise<KidsCafe> {
  const headers = buildKakaoHeaders(credentials);
  const coords = { lat: kidsCafe.lat, lng: kidsCafe.lng };

  // 1차: 주소로 검색
  const addressResponse = await fetch(
    buildKakaoLocalSearchUrl(kidsCafe.address, coords),
    { headers }
  );
  const addressData: KakaoLocalSearchResponse = addressResponse.ok ? await addressResponse.json() : null;
  const placeUrlFromAddress = extractKakaoPlaceUrl(addressData);

  if (placeUrlFromAddress) {
    return mergeKakaoData(kidsCafe, placeUrlFromAddress);
  }

  // 2차: 이름으로 검색 (폴백)
  const nameResponse = await fetch(
    buildKakaoLocalSearchUrl(kidsCafe.name, coords),
    { headers }
  );
  const nameData: KakaoLocalSearchResponse = nameResponse.ok ? await nameResponse.json() : null;

  return mergeKakaoData(kidsCafe, extractKakaoPlaceUrl(nameData));
}
