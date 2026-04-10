import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    qualities: [60],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'umppa.seoul.go.kr',
      },
    ],
    minimumCacheTTL: 86400, // 24시간 (스크래핑 주기와 일치)
  },
};

export default nextConfig;
