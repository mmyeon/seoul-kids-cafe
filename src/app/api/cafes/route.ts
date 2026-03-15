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

    const enrichedCafes: KidsCafe[] = await Promise.all(
      cafes.map((cafe) =>
        enrichCafeWithNaverData(cafe, {
          clientId: naverClientId,
          clientSecret: naverClientSecret,
        })
      )
    )

    return NextResponse.json(enrichedCafes)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
