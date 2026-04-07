import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = 'https://seoul-kids-cafe.vercel.app';

export const metadata: Metadata = {
  title: '이모표 서울형 키즈카페',
  description: '다둥이 조카들과 갈 키즈카페를 찾다가 이모가 직접 만든 서울 공공 키즈카페 찾기',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: '이모표 서울형 키즈카페',
    description: '서울 공공 키즈카페 한눈에 찾기 — 나이·지역 필터 + 카카오맵',
    url: SITE_URL,
    siteName: '이모표 서울형 키즈카페',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '이모표 서울형 키즈카페',
    description: '서울 공공 키즈카페 한눈에 찾기',
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👶</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
