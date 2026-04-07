/**
 * 서울시 키즈카페 API 응답 형식을 검증한다.
 * 필수 필드가 없으면 exit 1 → GitHub Actions 실패 → 이메일 알림
 * GitHub Actions 워크플로우에서 호출된다.
 */

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
const row = data?.tnFcltySttusInfo1011?.row?.[0];

if (!row) {
  console.error('서울시 API 응답에 row 데이터가 없습니다 (API 구조 변경 가능성)');
  process.exit(1);
}

const requiredFields = [
  'FCLTY_ID',
  'FCLTY_NM',
  'BASS_ADRES',
  'Y_CRDNT_VALUE',
  'X_CRDNT_VALUE',
  'POSBL_AGRDE',
  'OPEN_WEEK',
  'CTTPC',
];

const missing = requiredFields.filter((field) => !(field in row));

if (missing.length > 0) {
  console.error(`서울시 API 형식 변경 감지! 누락된 필드: ${missing.join(', ')}`);
  console.error('파싱 코드(src/lib/seoul-api.ts)를 확인하고 업데이트가 필요합니다');
  process.exit(1);
}

console.log('서울시 API 형식 정상 — 모든 필수 필드 확인됨');
