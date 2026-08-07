/**
 * 네트워크 오류에 재시도하는 fetch 래퍼.
 *
 * 서울시 인프라(openapi.seoul.go.kr, umppa.seoul.go.kr)는 연결 타임아웃이 잦아
 * 단발 fetch로는 스케줄 작업이 간헐적으로 실패한다. 스펙: docs/specs/fetch-with-retry.spec.md
 *
 * 상태 코드 해석은 호출자 책임이다. 4xx/5xx에 throw하지 않고 응답을 그대로 반환한다.
 */

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_BASE_DELAY_MS = 2000;

/** undici 기본 connect timeout(10s)보다 여유를 둔다 */
const DEFAULT_TIMEOUT_MS = 20000;

const SERVER_ERROR_STATUS = 500;

const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** 재시도 사유를 로그에 남길 수 있게 사람이 읽는 문자열로 만든다 */
function describeError(error) {
  const code = error?.cause?.code ?? error?.code ?? error?.name;
  return code ? `${code}: ${error.message}` : error.message;
}

/**
 * 재시도와 명시적 타임아웃을 적용해 fetch한다.
 *
 * 재시도 대상: fetch가 throw한 경우(연결/헤더 타임아웃 등)와 5xx 응답.
 * 4xx는 재시도해도 결과가 바뀌지 않으므로 즉시 반환한다.
 *
 * @param {string} url
 * @param {RequestInit} options fetch 옵션. 이 객체는 변형되지 않는다.
 * @param {object} retryOptions
 * @returns {Promise<Response>} 마지막 응답 (5xx일 수 있음)
 * @throws 모든 시도가 네트워크 오류로 실패한 경우
 */
export async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    baseDelayMs = DEFAULT_BASE_DELAY_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    fetchImpl = globalThis.fetch,
    sleep = defaultSleep,
    logger = console,
  } = retryOptions;

  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLastAttempt = attempt === maxAttempts;

    try {
      // 원본 options를 변형하지 않고 새 객체로 signal을 얹는다
      const response = await fetchImpl(url, {
        ...options,
        signal: options.signal ?? AbortSignal.timeout(timeoutMs),
      });

      if (response.status < SERVER_ERROR_STATUS || isLastAttempt) {
        return response;
      }

      logger.warn(`요청 실패 (${attempt}/${maxAttempts}) — HTTP ${response.status}, 재시도합니다: ${url}`);
    } catch (error) {
      lastError = error;

      if (isLastAttempt) break;

      logger.warn(`요청 실패 (${attempt}/${maxAttempts}) — ${describeError(error)}, 재시도합니다: ${url}`);
    }

    await sleep(baseDelayMs * 2 ** (attempt - 1));
  }

  throw new Error(`${maxAttempts}회 시도 후에도 요청에 실패했습니다: ${url}`, { cause: lastError });
}
