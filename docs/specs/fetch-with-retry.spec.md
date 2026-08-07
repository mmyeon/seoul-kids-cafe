# 스펙: 서울시 API 네트워크 재시도

> 대상 이슈: `Scrape Umppa Daily` 워크플로우 만성 실패
> 브랜치: `fix/network-retry-for-seoul-apis`

## 1. 배경

`Scrape Umppa Daily`의 최근 실패 6건을 전수 확인한 결과 원인이 전부 동일했다.

| run | 실패 job | 대상 호스트 | 에러 |
| --- | --- | --- | --- |
| 30651399822 (7/31) | 서울시 API 검증 | `openapi.seoul.go.kr:8088` | `UND_ERR_CONNECT_TIMEOUT` |
| 29353772772 (7/14) | 서울시 API 검증 | `openapi.seoul.go.kr:8088` | `UND_ERR_CONNECT_TIMEOUT` |
| 29271154807 (7/13) | umppa 스크래핑 | `umppa.seoul.go.kr:443` | `UND_ERR_CONNECT_TIMEOUT` |
| 29111355004 (7/10) | umppa 스크래핑 | `umppa.seoul.go.kr:443` | `UND_ERR_CONNECT_TIMEOUT` |
| 28296384078 (6/27) | 서울시 API 검증 | `openapi.seoul.go.kr:8088` | `UND_ERR_CONNECT_TIMEOUT` |
| 27974549645 (6/22) | umppa 스크래핑 | `umppa.seoul.go.kr:443` | `UND_ERR_CONNECT_TIMEOUT` |

6/20(27878605441)은 `UND_ERR_HEADERS_TIMEOUT` — 연결은 됐으나 응답 헤더 미수신. 같은 계열.
스케줄 실행 기준 누적 약 20건 실패, 실패율 대략 15%.

**원인은 코드 버그도 API 스펙 변경도 아니다.** 서울시 인프라로의 연결이 undici 기본
connect timeout 10초 안에 안 맺어지는 것이고, 두 스크립트 어디에도 재시도가 없다.

### 현재 코드의 문제 3가지

1. **재시도 없음** — `check-seoul-api-format.mjs:14`, `scrape-umppa.mjs:14` 모두 맨 `fetch` 한 방.
2. **네트워크 장애와 API 형식 변경이 구분되지 않음** — job 이름이 "서울시 API 형식 변경 감지"인데
   실제로는 접속 실패인 알림이 오므로, 매번 형식이 바뀐 건지 확인하러 가야 한다.
3. **`scrape-umppa.mjs`의 조용한 데이터 손실** — `fetchPage`는 `!res.ok`면 `null`을 반환하고
   (`scrape-umppa.mjs:20`), `scrapeAllPages`는 이를 "중단"으로 처리해 루프를 빠져나온다
   (`scrape-umppa.mjs:83-86`). 즉 **5xx가 나면 job은 성공(exit 0)한 채로 잘린 데이터가 커밋된다.**
   지금까지의 실패는 fetch가 throw한 경우라 드러났을 뿐, 이 경로는 소리 없이 지나간다.

### 범위

- **포함**: `scripts/check-seoul-api-format.mjs`, `scripts/scrape-umppa.mjs`
- **제외**: `src/lib/seoul-api.ts:75`의 맨 `fetch` — 앱 런타임 경로라 성격이 다르므로 별도 이슈

---

## 2. 설계 결정

### 유틸 배치와 테스트 러너

`scripts/`는 `.mjs`(ESM)이고 jest는 `ts-jest` preset에 `transform: ^.+\.tsx?$`뿐이라
**현재 설정으로는 `.mjs`를 테스트할 수 없다.** `.mjs`는 `.ts`를 import할 수도 없다.

→ 유틸을 `scripts/lib/fetch-with-retry.mjs`에 두고 **Node 내장 테스트 러너**로 검증한다.
jest 설정은 건드리지 않는다.

```
scripts/lib/fetch-with-retry.mjs        구현
scripts/lib/fetch-with-retry.test.mjs   테스트

package.json
  "test:scripts": "node --test scripts/**/*.test.mjs"
  "test": "jest && npm run test:scripts"
```

### 의존성 주입

테스트가 실제 네트워크와 실제 타이머에 의존하면 느리고 불안정하다.
`fetchImpl`과 `sleep`을 주입 가능하게 만들어 **네트워크 없이, 즉시** 검증한다.

```js
fetchWithRetry(url, options = {}, retryOptions = {})

// retryOptions 기본값
{
  maxAttempts: 3,
  baseDelayMs: 2000,      // 지수 백오프: 2s → 4s
  timeoutMs: 20000,       // undici 기본 10s보다 여유롭게
  fetchImpl: globalThis.fetch,
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  logger: console,
}
```

### 재시도 판단 기준

| 상황 | 재시도 | 근거 |
| --- | --- | --- |
| fetch throw (연결/헤더 타임아웃, ECONNRESET) | O | 일시적. 다시 하면 될 수 있다 |
| 5xx 응답 | O | 서버 측 일시 장애 가능 |
| 4xx 응답 | X | 인증키 오류 등. 재시도해도 결과가 안 바뀐다 |
| 2xx/3xx 응답 | X | 성공 |

**유틸은 4xx/5xx에 대해 throw하지 않고 응답 객체를 그대로 반환한다.**
상태 코드 해석은 호출자 책임 — 기존 스크립트들이 이미 `res.ok`로 분기하고 있어 호환된다.

---

## 3. 테스트 스펙 — `fetchWithRetry`

### A. 성공 경로

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| A1 | 첫 시도에 200 응답 | 응답 그대로 반환, `fetchImpl` 1회 호출 |
| A2 | 첫 시도 성공 | `sleep` 0회 호출 (불필요한 지연 없음) |
| A3 | `options.headers` 전달 | `fetchImpl`이 받은 인자에 해당 headers 그대로 포함 |
| A4 | 호출자가 넘긴 `options` 객체 | 호출 후에도 원본 객체 불변 (signal 주입이 원본을 오염시키지 않음) |

A4는 프로젝트 불변성 규칙에 대한 테스트다. 유틸은 `options`를 수정하지 않고 새 객체를 만들어 넘긴다.

### B. 네트워크 오류 재시도

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| B1 | 1회 `UND_ERR_CONNECT_TIMEOUT` 후 200 | 성공 응답 반환, `fetchImpl` 2회 |
| B2 | 2회 실패 후 200 | 성공 응답 반환, `fetchImpl` 3회 |
| B3 | 3회 연속 실패 | throw, `fetchImpl` **정확히 3회** (초과 호출 없음) |
| B4 | 3회 연속 실패 | throw된 에러의 `cause`에 마지막 원인 에러 보존 |
| B5 | `UND_ERR_HEADERS_TIMEOUT` | 재시도 대상 (6/20 실패 케이스) |
| B6 | 타임아웃 `AbortError` | 재시도 대상 |

B3의 "정확히 3회"가 핵심이다. off-by-one으로 4회 호출되면 워크플로우 시간이 늘어난다.

### C. HTTP 상태 코드 분기

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| C1 | 500 → 200 | 재시도 후 200 응답 반환, `fetchImpl` 2회 |
| C2 | 503 3회 연속 | 마지막 503 응답 반환 (throw 아님), `fetchImpl` 3회 |
| C3 | 404 | 즉시 404 응답 반환, `fetchImpl` **1회** (재시도 없음) |
| C4 | 401 / 403 | 즉시 반환, `fetchImpl` 1회 |
| C5 | 200 | 즉시 반환, `fetchImpl` 1회 |

C3/C4가 중요하다. 잘못된 API 키로 4xx가 나는데 3회 재시도하면 실패를 늦게 알게 된다.

### D. 백오프

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| D1 | 2회 실패 후 성공 | `sleep`이 `2000`, `4000` 순서로 호출됨 (지수) |
| D2 | `baseDelayMs: 100` 지정 | `sleep`이 `100`, `200`으로 호출됨 |
| D3 | `maxAttempts: 1` | 실패해도 재시도 없음, `sleep` 0회, `fetchImpl` 1회 |
| D4 | 마지막 시도 실패 후 | 불필요한 `sleep` 없음 (총 sleep 호출 = 시도수 - 1) |

### E. 타임아웃

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| E1 | 기본 호출 | `fetchImpl`이 받은 options에 `AbortSignal` 존재 |
| E2 | `timeoutMs` 지정 | 지정한 값 기준의 signal이 전달됨 |

### F. 로깅

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| F1 | 재시도 발생 | `logger.warn`에 시도 횟수와 사유가 포함된 메시지 출력 |
| F2 | 첫 시도 성공 | `logger.warn` 호출 없음 |

F1의 목적은 다음 실패 때 **Actions 로그만 보고 판단 가능하게** 하는 것이다.

---

## 4. 테스트 스펙 — `check-seoul-api-format.mjs`

### 구조 변경 선행 (Tidy First)

현재 이 스크립트는 top-level await로 즉시 실행되어 **유닛 테스트가 불가능하다.**
검증 로직을 순수 함수로 분리한다. 동작 변경 없는 구조 변경이므로 별도 커밋으로 처리한다.

```
scripts/lib/validate-seoul-api.mjs
  validateSeoulApiResponse(data) → { ok: true } | { ok: false, reason, missing }

  reason: 'NO_ROW' | 'MISSING_FIELDS'
```

### G. `validateSeoulApiResponse` 유닛 테스트

| ID | 입력 | 기대 |
| --- | --- | --- |
| G1 | 필수 8개 필드 모두 있는 row | `{ ok: true }` |
| G2 | `row`가 없는 응답 | `{ ok: false, reason: 'NO_ROW' }` |
| G3 | `row`가 빈 배열 | `{ ok: false, reason: 'NO_ROW' }` |
| G4 | 응답이 `null`/`undefined` | `{ ok: false, reason: 'NO_ROW' }` (throw 안 함) |
| G5 | `FCLTY_NM` 누락 | `{ ok: false, reason: 'MISSING_FIELDS', missing: ['FCLTY_NM'] }` |
| G6 | 여러 필드 누락 | `missing`에 누락된 필드가 전부 포함 |
| G7 | 필드가 존재하나 값이 빈 문자열 | `{ ok: true }` — 존재 여부만 검사 (기존 `in` 연산자 동작 유지) |
| G8 | 필수 외 필드가 추가된 row | `{ ok: true }` — API에 필드가 늘어나는 건 정상 |

G7/G8은 기존 동작을 고정하는 회귀 테스트다. 값 검증까지 하면 오탐이 늘어난다.

### H. 스크립트 종단 동작 (수동 검증)

`node --test`로 프로세스를 띄워 stdout/exit code를 확인하거나, 수동 실행으로 검증한다.

| ID | 조건 | exit | 출력 요구사항 |
| --- | --- | --- | --- |
| H1 | `SEOUL_API_KEY` 없음 | 1 | 기존 메시지 유지 |
| H2 | 네트워크 3회 실패 | 1 | **"형식 변경 아님"이 명시**되고, "형식 변경 감지" 문구는 **출력되지 않을 것** |
| H3 | 4xx 응답 | 1 | 상태 코드 표시, 재시도 로그 없음 |
| H4 | row 없음 | 1 | 구조 변경 가능성 메시지 |
| H5 | 필수 필드 누락 | 1 | 누락 필드 나열 + `src/lib/seoul-api.ts` 확인 안내 (기존 문구 유지) |
| H6 | 정상 응답 | 0 | 기존 성공 메시지 |

**H2가 이 작업의 핵심 수용 기준이다.** 네트워크 실패 알림을 받았을 때 코드를 열어보지 않고도
"형식 변경이 아니다"를 알 수 있어야 한다.

---

## 5. 테스트 스펙 — `scrape-umppa.mjs`

### I. 동작 요구사항

| ID | 시나리오 | 기대 |
| --- | --- | --- |
| I1 | `fetchPage` 네트워크 1회 실패 후 성공 | 재시도로 정상 진행, 데이터 손실 없음 |
| I2 | 네트워크 3회 실패 | 에러 전파 → `main().catch` → exit 1 (기존 동작 유지) |
| I3 | **5xx 3회 실패** | **exit 1로 실패해야 함** — 현재는 `null` 반환 → break → 부분 데이터로 exit 0 |
| I4 | 404 응답 | 기존대로 `null` 반환 후 중단 (페이지 끝일 수 있으므로 실패 아님) |
| I5 | 정상 응답 | 기존 파싱 결과와 동일 |

**I3이 이번에 고치는 숨은 결함이다.** 5xx로 잘린 데이터가 조용히 커밋되는 걸 막는다.
`fetchPage`는 5xx일 때 `null`이 아니라 throw하도록 바꾼다.

### J. 회귀 방지

`extractCafesFromHtml`은 이번 변경 대상이 아니지만 네트워크 계층 변경의 영향을 받지 않음을
보장해야 한다. 순수 함수이므로 고정 HTML 샘플로 유닛 테스트를 추가한다.

| ID | 입력 | 기대 |
| --- | --- | --- |
| J1 | fcltyId·이미지·출생연도가 모두 있는 HTML | 기존과 동일한 매핑 반환 |
| J2 | 이미지가 fcltyId보다 적은 HTML | `Math.min` 기준으로 잘린 결과 (기존 동작) |
| J3 | 빈 HTML | `{}` |

---

## 6. 워크플로우 변경

`.github/workflows/scrape-umppa.yml`

- 두 job에 `timeout-minutes: 10` 추가 (재시도로 길어질 수 있으므로 상한 명시)
- `node-version: '20'` → `'22'` — 모든 run에 뜨는 `Node.js 20 is deprecated` 경고 제거.
  실패 원인은 아니지만 같이 정리. 두 job 동일하게 맞춘다.
- **cron은 이번에 바꾸지 않는다.** 스케줄이 `0 17 * * *` = KST 02:00이고 서울시 서버의
  야간 배치/점검 창과 겹칠 가능성이 있으나 **로그로 증명된 게 아니라 정황 추론**이다.
  재시도 적용 후 2~3주 관찰해서 실패가 이어지면 그때 별도 이슈로 시각 조정을 검토한다.

---

## 7. 수용 기준

- [ ] A~F 유닛 테스트 전부 통과 (`npm run test:scripts`)
- [ ] G, J 유닛 테스트 전부 통과
- [ ] 기존 jest 테스트 전부 통과 (`npm test`) — 회귀 없음
- [ ] H2 수동 검증: 네트워크 실패 시 "형식 변경 아님" 메시지 확인
- [ ] I3 수동 검증: 5xx 시 exit 1
- [ ] 수동 워크플로우 실행 시 두 job 초록불 + deprecation 경고 사라짐

## 8. 커밋 분리 (Tidy First)

| # | 유형 | 내용 |
| --- | --- | --- |
| 1 | 구조 | `scripts/lib/fetch-with-retry.mjs` + 테스트 신설 (아직 아무도 사용 안 함) |
| 2 | 구조 | `validateSeoulApiResponse` 순수 함수 추출 + 테스트 (동작 동일) |
| 3 | 구조 | `extractCafesFromHtml` 회귀 테스트 추가 (코드 변경 없음) |
| 4 | 동작 | 두 스크립트에 재시도 적용 + 에러 메시지 분리 + 5xx throw |
| 5 | 구조 | 워크플로우 `node-version` 상향, `timeout-minutes` 추가 |
