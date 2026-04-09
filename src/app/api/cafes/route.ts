import { NextResponse } from 'next/server';
import { getEnrichedCafes } from '../../../lib/cafe-data';
import { extractDistricts } from '../../../lib/cafeListUtils';
import { ApiError } from '../../../lib/errors';

export async function GET(): Promise<NextResponse> {
  const seoulApiKey = process.env.SEOUL_API_KEY;
  if (!seoulApiKey) {
    return NextResponse.json(
      { error: 'SEOUL_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;
  if (!kakaoRestApiKey) {
    return NextResponse.json(
      { error: 'KAKAO_REST_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    );
  }

  try {
    const cafes = await getEnrichedCafes(seoulApiKey, kakaoRestApiKey);
    const districts = extractDistricts(cafes);
    return NextResponse.json({ cafes, districts });
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[GET /api/cafes] API 오류:', { code: error.code, status: error.status, message: error.message });
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[GET /api/cafes] 처리 중 오류 발생:', error);
    return NextResponse.json(
      { error: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
