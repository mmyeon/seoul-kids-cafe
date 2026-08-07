/**
 * fetchWithRetry 유닛 테스트
 * 스펙: docs/specs/fetch-with-retry.spec.md (A~F 그룹)
 *
 * fetchImpl과 sleep을 주입해 실제 네트워크/타이머 없이 검증한다.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { fetchWithRetry } from './fetch-with-retry.mjs';

/** 상태 코드만 가진 최소 응답 객체 (유틸은 status만 읽는다) */
function response(status) {
  return { status, ok: status >= 200 && status < 300 };
}

/** undici 네트워크 오류 재현 */
function networkError(code = 'UND_ERR_CONNECT_TIMEOUT') {
  const err = new TypeError('fetch failed');
  err.cause = Object.assign(new Error('Connect Timeout Error'), { code });
  return err;
}

/**
 * 미리 정해둔 결과를 순서대로 반환하는 fetch 스텁.
 * Error 인스턴스면 throw, 아니면 반환한다.
 */
function stubFetch(...results) {
  const calls = [];
  const fn = async (url, options) => {
    calls.push({ url, options });
    const result = results[calls.length - 1] ?? results[results.length - 1];
    if (result instanceof Error) throw result;
    return result;
  };
  fn.calls = calls;
  return fn;
}

/** sleep 호출 인자를 기록하는 스텁 (실제로 지연하지 않는다) */
function stubSleep() {
  const delays = [];
  const fn = async (ms) => {
    delays.push(ms);
  };
  fn.delays = delays;
  return fn;
}

function silentLogger() {
  const warnings = [];
  return { warn: (...args) => warnings.push(args.join(' ')), warnings };
}

/** 테스트 기본값: 로그 조용히, 지연 없이 */
function options(overrides = {}) {
  return { sleep: stubSleep(), logger: silentLogger(), ...overrides };
}

describe('A. 성공 경로', () => {
  test('A1: 첫 시도에 200이면 응답을 그대로 반환하고 1회만 호출한다', async () => {
    const fetchImpl = stubFetch(response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 1);
  });

  test('A2: 첫 시도에 성공하면 지연하지 않는다', async () => {
    const sleep = stubSleep();

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl: stubFetch(response(200)), sleep }));

    assert.deepEqual(sleep.delays, []);
  });

  test('A3: 호출자가 준 headers를 fetch에 그대로 전달한다', async () => {
    const fetchImpl = stubFetch(response(200));
    const headers = { 'User-Agent': 'SeoulKidsCafeApp/1.0' };

    await fetchWithRetry('https://example.com', { headers }, options({ fetchImpl }));

    assert.deepEqual(fetchImpl.calls[0].options.headers, headers);
  });

  test('A4: 호출자가 준 options 객체를 변형하지 않는다', async () => {
    const original = { headers: { Accept: 'text/html' } };
    const snapshot = structuredClone(original);

    await fetchWithRetry('https://example.com', original, options({ fetchImpl: stubFetch(response(200)) }));

    assert.deepEqual(original, snapshot);
    assert.equal('signal' in original, false);
  });
});

describe('B. 네트워크 오류 재시도', () => {
  test('B1: 1회 실패 후 성공하면 성공 응답을 반환한다 (2회 호출)', async () => {
    const fetchImpl = stubFetch(networkError(), response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 2);
  });

  test('B2: 2회 실패 후 성공하면 성공 응답을 반환한다 (3회 호출)', async () => {
    const fetchImpl = stubFetch(networkError(), networkError(), response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 3);
  });

  test('B3: 3회 연속 실패하면 throw하고 정확히 3회만 호출한다', async () => {
    const fetchImpl = stubFetch(networkError());

    await assert.rejects(() => fetchWithRetry('https://example.com', {}, options({ fetchImpl })));

    assert.equal(fetchImpl.calls.length, 3);
  });

  test('B4: 최종 throw 에러가 마지막 원인을 cause로 보존한다', async () => {
    const lastError = networkError();
    const fetchImpl = stubFetch(networkError(), networkError(), lastError);

    await assert.rejects(
      () => fetchWithRetry('https://example.com', {}, options({ fetchImpl })),
      (err) => {
        assert.equal(err.cause, lastError);
        return true;
      }
    );
  });

  test('B5: UND_ERR_HEADERS_TIMEOUT도 재시도한다', async () => {
    const fetchImpl = stubFetch(networkError('UND_ERR_HEADERS_TIMEOUT'), response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 2);
  });

  test('B6: AbortError(타임아웃)도 재시도한다', async () => {
    const abortError = Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
    const fetchImpl = stubFetch(abortError, response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 2);
  });
});

describe('C. HTTP 상태 코드 분기', () => {
  test('C1: 500 다음 200이면 재시도해서 200을 반환한다', async () => {
    const fetchImpl = stubFetch(response(500), response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 2);
  });

  test('C2: 503이 3회 연속이면 throw하지 않고 마지막 503 응답을 반환한다', async () => {
    const fetchImpl = stubFetch(response(503));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 503);
    assert.equal(fetchImpl.calls.length, 3);
  });

  test('C3: 404는 재시도하지 않고 즉시 반환한다', async () => {
    const fetchImpl = stubFetch(response(404));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 404);
    assert.equal(fetchImpl.calls.length, 1);
  });

  test('C4: 401/403은 재시도하지 않고 즉시 반환한다', async () => {
    for (const status of [401, 403]) {
      const fetchImpl = stubFetch(response(status));

      const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

      assert.equal(res.status, status);
      assert.equal(fetchImpl.calls.length, 1);
    }
  });

  test('C5: 200은 즉시 반환한다', async () => {
    const fetchImpl = stubFetch(response(200));

    const res = await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.equal(res.status, 200);
    assert.equal(fetchImpl.calls.length, 1);
  });
});

describe('D. 백오프', () => {
  test('D1: 재시도 사이 지연이 지수적으로 늘어난다 (2s → 4s)', async () => {
    const sleep = stubSleep();
    const fetchImpl = stubFetch(networkError(), networkError(), response(200));

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl, sleep }));

    assert.deepEqual(sleep.delays, [2000, 4000]);
  });

  test('D2: baseDelayMs를 지정하면 그 값 기준으로 늘어난다', async () => {
    const sleep = stubSleep();
    const fetchImpl = stubFetch(networkError(), networkError(), response(200));

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl, sleep, baseDelayMs: 100 }));

    assert.deepEqual(sleep.delays, [100, 200]);
  });

  test('D3: maxAttempts가 1이면 재시도하지 않는다', async () => {
    const sleep = stubSleep();
    const fetchImpl = stubFetch(networkError());

    await assert.rejects(() =>
      fetchWithRetry('https://example.com', {}, options({ fetchImpl, sleep, maxAttempts: 1 }))
    );

    assert.equal(fetchImpl.calls.length, 1);
    assert.deepEqual(sleep.delays, []);
  });

  test('D4: 마지막 시도 실패 후에는 불필요하게 지연하지 않는다', async () => {
    const sleep = stubSleep();
    const fetchImpl = stubFetch(networkError());

    await assert.rejects(() => fetchWithRetry('https://example.com', {}, options({ fetchImpl, sleep })));

    // 시도 3회 → 지연은 그 사이 2회뿐
    assert.equal(sleep.delays.length, fetchImpl.calls.length - 1);
  });
});

describe('E. 타임아웃', () => {
  test('E1: 기본 호출 시 AbortSignal이 전달된다', async () => {
    const fetchImpl = stubFetch(response(200));

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl }));

    assert.ok(fetchImpl.calls[0].options.signal instanceof AbortSignal);
  });

  test('E2: timeoutMs가 지나면 전달된 signal이 abort된다', async () => {
    let captured;
    const fetchImpl = async (url, opts) => {
      captured = opts.signal;
      return response(200);
    };

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl, timeoutMs: 10 }));

    assert.equal(captured.aborted, false);
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(captured.aborted, true);
  });

  test('E3: 호출자가 signal을 직접 주면 그것을 우선한다', async () => {
    const controller = new AbortController();
    const fetchImpl = stubFetch(response(200));

    await fetchWithRetry('https://example.com', { signal: controller.signal }, options({ fetchImpl }));

    assert.equal(fetchImpl.calls[0].options.signal, controller.signal);
  });
});

describe('F. 로깅', () => {
  test('F1: 재시도할 때 시도 횟수와 사유를 warn으로 남긴다', async () => {
    const logger = silentLogger();
    const fetchImpl = stubFetch(networkError(), response(200));

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl, logger }));

    assert.equal(logger.warnings.length, 1);
    assert.match(logger.warnings[0], /1\/3/);
    assert.match(logger.warnings[0], /UND_ERR_CONNECT_TIMEOUT/);
  });

  test('F2: 첫 시도에 성공하면 warn하지 않는다', async () => {
    const logger = silentLogger();

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl: stubFetch(response(200)), logger }));

    assert.deepEqual(logger.warnings, []);
  });

  test('F3: 5xx로 재시도할 때도 상태 코드를 warn으로 남긴다', async () => {
    const logger = silentLogger();
    const fetchImpl = stubFetch(response(503), response(200));

    await fetchWithRetry('https://example.com', {}, options({ fetchImpl, logger }));

    assert.equal(logger.warnings.length, 1);
    assert.match(logger.warnings[0], /503/);
  });
});
