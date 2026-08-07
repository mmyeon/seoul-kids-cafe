/**
 * umppa 목록 페이지 HTML 파싱.
 *
 * scrape-umppa.mjs에서 추출한 순수 함수다. 로직은 그대로다.
 * 스펙: docs/specs/fetch-with-retry.spec.md (J 그룹)
 */

const IMAGE_HOST = 'https://umppa.seoul.go.kr';

/**
 * HTML에서 fcltyId → { imageUrl, birthYearYounger, birthYearOlder } 매핑 추출
 *
 * 방식:
 * - fcltyId: q_fcltyId=XXX 패턴을 순서대로 deduplicate
 * - imageUrl: /icare/upload/ 경로의 이미지를 순서대로 수집
 * - birthYear: "YYYY년생 ~ YYYY년생" 패턴을 순서대로 수집
 */
export function extractCafesFromHtml(html) {
  // 1. fcltyId 추출 (중복 제거, 순서 유지)
  const uniqueFcltyIds = [];
  const seen = new Set();
  const fcltyIdRegex = /q_fcltyId=([A-Z0-9]+)/g;
  let m;
  while ((m = fcltyIdRegex.exec(html)) !== null) {
    const id = m[1];
    if (!seen.has(id)) {
      seen.add(id);
      uniqueFcltyIds.push(id);
    }
  }

  // 2. 썸네일 이미지 URL 추출 (상대/절대 경로 모두 처리)
  const imageUrls = [];
  const imgRegex =
    /src="((?:https:\/\/umppa\.seoul\.go\.kr)?\/icare\/upload\/fcltyInfoManage\/[^"]+\.(?:jpg|jpeg|png))"/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    const rawUrl = m[1];
    imageUrls.push(rawUrl.startsWith('http') ? rawUrl : `${IMAGE_HOST}${rawUrl}`);
  }

  // 3. 출생연도 범위 추출 (예: "2022년생 ~ 2016년생")
  const birthYearPairs = [];
  const birthYearRegex = /(\d{4})년생\s*~\s*(\d{4})년생/g;
  while ((m = birthYearRegex.exec(html)) !== null) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    birthYearPairs.push({ birthYearYounger: Math.max(a, b), birthYearOlder: Math.min(a, b) });
  }

  // 4. fcltyId, imageUrl, birthYear를 순서대로 묶음
  const result = {};
  const count = Math.min(uniqueFcltyIds.length, imageUrls.length);
  for (let i = 0; i < count; i++) {
    result[uniqueFcltyIds[i]] = {
      imageUrl: imageUrls[i],
      ...(birthYearPairs[i] ?? {}),
    };
  }
  return result;
}
