import type { SeoulKidsCafeRaw, KidsCafe } from '../../types/index';
import { normalizeOperatingHours } from './kidsCafeCard';

/**
 * 서울시 API URL 생성
 */
export function buildSeoulApiUrl(apiKey: string, startIndex: number, endIndex: number): string {
  return `http://openAPI.seoul.go.kr:8088/${apiKey}/json/tnFcltySttusInfo1011/${startIndex}/${endIndex}/`;
}

/**
 * 연령 텍스트를 숫자로 파싱 (예: "0세 ~ 7세" → { minAge: 0, maxAge: 7 })
 */
export function parseAgeRange(ageRangeStr: string): { minAge: number; maxAge: number } {
  if (!ageRangeStr) return { minAge: 0, maxAge: 0 };

  const parts = ageRangeStr.split('~');
  if (parts.length !== 2) return { minAge: 0, maxAge: 0 };

  const minAge = parseInt(parts[0].replace(/[^0-9]/g, ''), 10);
  const maxAge = parseInt(parts[1].replace(/[^0-9]/g, ''), 10);

  return {
    minAge: isNaN(minAge) ? 0 : minAge,
    maxAge: isNaN(maxAge) ? 0 : maxAge,
  };
}

/**
 * 서울시 원본 데이터를 KidsCafe 타입으로 변환
 */
export function parseSeoulKidsCafe(raw: SeoulKidsCafeRaw): KidsCafe {
  const lat = parseFloat(raw.Y_CRDNT_VALUE);
  const lng = parseFloat(raw.X_CRDNT_VALUE);
  const ageRange = parseAgeRange(raw.POSBL_AGRDE);

  const address = raw.DETAIL_ADRES
    ? `${raw.BASS_ADRES} ${raw.DETAIL_ADRES}`.trim()
    : raw.BASS_ADRES;

  const id = raw.FCLTY_ID || encodeURIComponent(`${raw.FCLTY_NM}|${raw.BASS_ADRES}`);

  return {
    id,
    name: raw.FCLTY_NM.replace(/^서울형\s*키즈카페\s*/i, '').trim(),
    address,
    lat: isNaN(lat) ? 0 : lat,
    lng: isNaN(lng) ? 0 : lng,
    ageRange,
    operatingHours: normalizeOperatingHours(raw.OPEN_WEEK),
    phone: raw.CTTPC,
  };
}

/**
 * 서울시 API 응답 원본 타입
 */
type SeoulApiResponse = {
  tnFcltySttusInfo1011: {
    list_total_count: number;
    RESULT: { CODE: string; MESSAGE: string };
    row: SeoulKidsCafeRaw[];
  };
};

/**
 * 서울시 키즈카페 API 호출 및 파싱
 */
export async function fetchSeoulKidsCafes(apiKey: string): Promise<KidsCafe[]> {
  const url = buildSeoulApiUrl(apiKey, 1, 1000);
  const response = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    throw new Error(`서울시 API 호출 실패: ${response.status}`);
  }

  const data: SeoulApiResponse = await response.json();
  const rows = data?.tnFcltySttusInfo1011?.row ?? [];

  return rows.map(parseSeoulKidsCafe);
}
