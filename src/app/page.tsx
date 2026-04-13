import { Suspense } from 'react';
import type { Metadata } from 'next';
import HomeClient from './HomeClient';
import { getEnrichedCafes } from '../lib/cafe-data';
import { SITE_URL } from '../lib/constants';

const SITE_TITLE = '이모표 서울형 키즈카페';
const SITE_DESCRIPTION = '서울 공공 키즈카페 한눈에 찾기 — 나이·지역 필터 + 카카오맵';

type PageProps = {
  searchParams: Promise<{ cafeId?: string }>;
};

function defaultMetadata(): Metadata {
  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_TITLE,
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
    },
  };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { cafeId } = await searchParams;

  if (!cafeId) return defaultMetadata();

  const seoulApiKey = process.env.SEOUL_API_KEY;
  const kakaoRestApiKey = process.env.KAKAO_REST_API_KEY;

  if (!seoulApiKey || !kakaoRestApiKey) return defaultMetadata();

  const cafes = await getEnrichedCafes(seoulApiKey, kakaoRestApiKey);
  const cafe = cafes.find((c) => c.id === cafeId);

  if (!cafe) return defaultMetadata();

  const title = `${cafe.name} | ${SITE_TITLE}`;
  const description = [
    `📍 주소: ${cafe.address}`,
    `👶 이용 나이: ${cafe.ageRange.minAge} ~ ${cafe.ageRange.maxAge}세`,
    cafe.operatingHours ? `📅 운영 요일: ${cafe.operatingHours}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}?cafeId=${cafeId}`,
      siteName: SITE_TITLE,
      locale: 'ko_KR',
      type: 'website',
      ...(cafe.imageUrl ? { images: [{ url: cafe.imageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(cafe.imageUrl ? { images: [cafe.imageUrl] } : {}),
    },
  };
}

export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
