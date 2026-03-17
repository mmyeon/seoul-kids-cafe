import { NextResponse } from 'next/server';
import { fetchSeoulKidsCafes } from '../../../lib/seoul-api';
import { enrichCafeWithKakaoData } from '../../../lib/kakao-api';
import type { KidsCafe } from '../../../../types/index';

export async function GET(): Promise<NextResponse> {
  const seoulApiKey = process.env.SEOUL_API_KEY;
  if (!seoulApiKey) {
    return NextResponse.json(
      { error: 'SEOUL_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

  try {
    const cafes = await fetchSeoulKidsCafes(seoulApiKey);

    if (!kakaoRestApiKey) {
      return NextResponse.json(cafes);
    }

    const results = await Promise.allSettled(
      cafes.map((cafe) =>
        enrichCafeWithKakaoData(cafe, {
          restApiKey: kakaoRestApiKey,
        })
      )
    );

    const enrichedCafes: KidsCafe[] = results.map((result, index) =>
      result.status === 'fulfilled' ? result.value : cafes[index]
    );

    return NextResponse.json(enrichedCafes);
  } catch (error) {
    console.error('[GET /api/cafes] 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
