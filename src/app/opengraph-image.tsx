import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '이모표 서울형 키즈카페';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 120 }}>👶</div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: '#1E3A5F',
            textAlign: 'center',
          }}
        >
          이모표 서울형 키즈카페
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#3B82F6',
            textAlign: 'center',
          }}
        >
          서울 공공 키즈카페 한눈에 찾기
        </div>
      </div>
    ),
    { ...size }
  );
}
