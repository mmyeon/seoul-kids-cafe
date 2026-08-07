/**
 * 서울시 키즈카페 API 응답 형식을 검증한다.
 * 필수 필드가 없으면 exit 1 → GitHub Actions 실패 → 이메일 알림
 * GitHub Actions 워크플로우에서 호출된다.
 */

import { validateSeoulApiResponse } from './lib/validate-seoul-api.mjs';

const apiKey = process.env.SEOUL_API_KEY;
if (!apiKey) {
  console.error('SEOUL_API_KEY 환경변수가 없습니다');
  process.exit(1);
}

const url = `http://openAPI.seoul.go.kr:8088/${apiKey}/json/tnFcltySttusInfo1011/1/1/`;
const res = await fetch(url);

if (!res.ok) {
  console.error(`서울시 API 호출 실패: ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const result = validateSeoulApiResponse(data);

if (!result.ok && result.reason === 'NO_ROW') {
  console.error('서울시 API 응답에 row 데이터가 없습니다 (API 구조 변경 가능성)');
  process.exit(1);
}

if (!result.ok) {
  console.error(`서울시 API 형식 변경 감지! 누락된 필드: ${result.missing.join(', ')}`);
  console.error('파싱 코드(src/lib/seoul-api.ts)를 확인하고 업데이트가 필요합니다');
  process.exit(1);
}

console.log('서울시 API 형식 정상 — 모든 필수 필드 확인됨');
