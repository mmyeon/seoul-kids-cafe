/**
 * 서울시 키즈카페 API 응답의 형식 검증.
 *
 * check-seoul-api-format.mjs에서 추출한 순수 함수다.
 * 스크립트가 top-level await로 즉시 실행되어 테스트할 수 없었기 때문에 분리했다.
 * 스펙: docs/specs/fetch-with-retry.spec.md (G 그룹)
 */

/** 파싱 코드(src/lib/seoul-api.ts)가 의존하는 필드들 */
export const REQUIRED_FIELDS = [
  'FCLTY_ID',
  'FCLTY_NM',
  'BASS_ADRES',
  'Y_CRDNT_VALUE',
  'X_CRDNT_VALUE',
  'POSBL_AGRDE',
  'OPEN_WEEK',
  'CTTPC',
];

/**
 * 응답에 파싱에 필요한 필드가 모두 있는지 검사한다.
 *
 * 값이 아니라 필드의 존재 여부만 본다. 값까지 검증하면
 * 실제로는 정상인 빈 값 때문에 오탐이 늘어난다.
 *
 * @param {unknown} data 서울시 API JSON 응답
 * @returns {{ ok: true } | { ok: false, reason: 'NO_ROW' } | { ok: false, reason: 'MISSING_FIELDS', missing: string[] }}
 */
export function validateSeoulApiResponse(data) {
  const row = data?.tnFcltySttusInfo1011?.row?.[0];

  if (!row) {
    return { ok: false, reason: 'NO_ROW' };
  }

  const missing = REQUIRED_FIELDS.filter((field) => !(field in row));

  if (missing.length > 0) {
    return { ok: false, reason: 'MISSING_FIELDS', missing };
  }

  return { ok: true };
}
