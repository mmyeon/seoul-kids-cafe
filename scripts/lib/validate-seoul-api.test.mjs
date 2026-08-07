/**
 * validateSeoulApiResponse 유닛 테스트
 * 스펙: docs/specs/fetch-with-retry.spec.md (G 그룹)
 *
 * 기존 check-seoul-api-format.mjs의 검증 동작을 그대로 고정하는 회귀 테스트다.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { validateSeoulApiResponse, REQUIRED_FIELDS } from './validate-seoul-api.mjs';

/** 필수 필드를 모두 갖춘 정상 row */
function validRow(overrides = {}) {
  const row = Object.fromEntries(REQUIRED_FIELDS.map((field) => [field, '값']));
  return { ...row, ...overrides };
}

/** 서울시 API 응답 봉투로 감싼다 */
function responseWith(...rows) {
  return { tnFcltySttusInfo1011: { row: rows } };
}

describe('G. validateSeoulApiResponse', () => {
  test('G1: 필수 필드가 모두 있으면 ok', () => {
    const result = validateSeoulApiResponse(responseWith(validRow()));

    assert.deepEqual(result, { ok: true });
  });

  test('G2: row가 없으면 NO_ROW', () => {
    const result = validateSeoulApiResponse({ tnFcltySttusInfo1011: {} });

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'NO_ROW');
  });

  test('G3: row가 빈 배열이면 NO_ROW', () => {
    const result = validateSeoulApiResponse(responseWith());

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'NO_ROW');
  });

  test('G4: 응답이 null/undefined여도 throw하지 않고 NO_ROW', () => {
    for (const input of [null, undefined, {}]) {
      const result = validateSeoulApiResponse(input);

      assert.equal(result.ok, false);
      assert.equal(result.reason, 'NO_ROW');
    }
  });

  test('G5: FCLTY_NM이 누락되면 MISSING_FIELDS로 해당 필드를 알려준다', () => {
    const row = validRow();
    delete row.FCLTY_NM;

    const result = validateSeoulApiResponse(responseWith(row));

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'MISSING_FIELDS');
    assert.deepEqual(result.missing, ['FCLTY_NM']);
  });

  test('G6: 여러 필드가 누락되면 전부 나열한다', () => {
    const row = validRow();
    delete row.FCLTY_ID;
    delete row.X_CRDNT_VALUE;
    delete row.CTTPC;

    const result = validateSeoulApiResponse(responseWith(row));

    assert.equal(result.reason, 'MISSING_FIELDS');
    assert.deepEqual(result.missing.sort(), ['CTTPC', 'FCLTY_ID', 'X_CRDNT_VALUE']);
  });

  test('G7: 필드가 있으나 값이 빈 문자열이면 ok (존재 여부만 검사)', () => {
    const result = validateSeoulApiResponse(responseWith(validRow({ CTTPC: '' })));

    assert.deepEqual(result, { ok: true });
  });

  test('G8: 필수 외 필드가 추가돼도 ok (API 필드 증가는 정상)', () => {
    const result = validateSeoulApiResponse(responseWith(validRow({ NEW_FIELD: '신규' })));

    assert.deepEqual(result, { ok: true });
  });

  test('REQUIRED_FIELDS는 기존 스크립트의 8개 필드를 유지한다', () => {
    assert.deepEqual(REQUIRED_FIELDS, [
      'FCLTY_ID',
      'FCLTY_NM',
      'BASS_ADRES',
      'Y_CRDNT_VALUE',
      'X_CRDNT_VALUE',
      'POSBL_AGRDE',
      'OPEN_WEEK',
      'CTTPC',
    ]);
  });
});
