import { cacheLife } from 'next/cache';
import { fetchSeoulKidsCafes } from './seoul-api';
import { enrichKidsCafeWithKakaoData } from './kakao-api';
import { getUmppaImageUrl, getUmppaDetailUrl } from './umppa-data';
import type { KidsCafe } from '../../types/index';

/**
 * 서울시 키즈카페 데이터를 가져와 Kakao 플레이스 URL을 enrichment한 결과를 반환한다.
 * `use cache`로 서버에 캐싱되어 최초 1회만 Kakao API를 호출한다.
 */
export async function getEnrichedCafes(
  seoulApiKey: string,
  kakaoRestApiKey: string
): Promise<KidsCafe[]> {
  'use cache';
  cacheLife('weeks');

  const kidsCafes = await fetchSeoulKidsCafes(seoulApiKey);

  const kidsCafesInfo: KidsCafe[] = kidsCafes.map((cafe) => ({
    ...cafe,
    imageUrl: getUmppaImageUrl(cafe.id),
    detailUrl: getUmppaDetailUrl(cafe.id),
  }));

  if (!kakaoRestApiKey) {
    return kidsCafesInfo;
  }

  const results = await Promise.allSettled(
    kidsCafesInfo.map((cafe) => enrichKidsCafeWithKakaoData(cafe, { restApiKey: kakaoRestApiKey }))
  );

  return results.map((result, index) =>
    result.status === 'fulfilled' ? result.value : kidsCafesInfo[index]
  );
}
