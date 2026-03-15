import { NextResponse } from 'next/server'
import { fetchSeoulKidsCafes } from '../../../lib/seoul-api'
import { enrichCafeWithNaverData } from '../../../lib/naver-api'
import type { KidsCafe } from '../../../../types/index'

export async function GET(): Promise<NextResponse> {
  const seoulApiKey = process.env.SEOUL_API_KEY
  if (!seoulApiKey) {
    return NextResponse.json(
      { error: 'SEOUL_API_KEY 환경변수가 설정되지 않았습니다.' },
      { status: 500 }
    )
  }

  const naverClientId = process.env.NAVER_CLIENT_ID
  const naverClientSecret = process.env.NAVER_CLIENT_SECRET

  try {
    const cafes = await fetchSeoulKidsCafes(seoulApiKey)

    if (!naverClientId || !naverClientSecret) {
      return NextResponse.json(cafes)
    }

    const results = await Promise.allSettled(
      cafes.map((cafe) =>
        enrichCafeWithNaverData(cafe, {
          clientId: naverClientId,
          clientSecret: naverClientSecret,
        })
      )
    )

    const enrichedCafes: KidsCafe[] = results.map((result, index) =>
      result.status === 'fulfilled' ? result.value : cafes[index]
    )

    return NextResponse.json(enrichedCafes)
  } catch (error) {
    console.error('[GET /api/cafes] 처리 중 오류 발생:', error)
    return NextResponse.json(
      { error: '데이터를 불러오는 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
