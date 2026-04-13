# <div align="center"> [이모가 만든 서울형 키즈카페](https://seoul-kids-cafe.vercel.app)</div>

<div align="center">다둥이가 갈 수 있는 키즈카페를 찾아서</div>

</br>

<p align="center"><img width="508" height="684" alt="image" src="https://github.com/user-attachments/assets/c7d75677-a24d-4b1b-953e-b0729dfb2fa6" /></p>

---

## 서비스를 만든 계기

**"3세 첫째 조카와 1세 쌍둥이 조카, 함께 갈 수 있는 서울형 키즈카페 찾기가 왜 이렇게 힘들까?"**

조카 셋을 데리고 키즈카페 한 곳을 가기 위해 거쳐야 했던 4단계의 번거로움을 해결하고 싶었습니다.

1. 나이 확인: 지점마다 다른 이용 연령 제한 확인
2. 시설 확인: 첫째가 놀기에 적당한지 이미지 체크
3. 정보 확인: 위치와 휴무일 정보를 일일이 검색
4. 공유: 가족들과 갈 만한 곳을 추려 링크 전달

이 모든 과정을 아이 나이 입력 한 번으로 끝낼 수 있도록 만들었습니다.

---

## 핵심 기능

- **나이 필터** — 0 ~ 13세까지 나이 여러 개 선택시 함꼐 이용 가능한 키즈카페 목록 제공
- **GPS 기반 거리 정렬** — 위치 허용 시 가까운 키즈 카페 순으로 정렬
- **지역 필터** — 위치 비허용시 서울 25개 자치구 선택 가능
- **Kakao Map 연동** — 지도 위 마커 선택시 키즈카페 상세 정보 제공
- **URL 상태 동기화** — 원하는 키즈카페 링크 복사 및 카카오톡 공유 가능

---

## 기술 스택

| 분류      | 기술                            |
| --------- | ------------------------------- |
| Framework | Next.js 16 (App Router)         |
| Runtime   | React 19, TypeScript 5 (strict) |
| Styling   | Tailwind CSS v4                 |
| Map       | Kakao Maps JavaScript SDK       |
| Test      | Jest                            |
| CI        | GitHub Actions + Lighthouse CI  |
| Deploy    | Vercel                          |

---

## 아키텍처 고려사항

### 데이터 파이프라인

외부 API 3개를 조합해 단일 `KidsCafe` 데이터 모델을 구성합니다. 빌드/요청 시점 캐싱으로 런타임 API 호출을 최소화합니다.

```
서울 열린데이터광장 API(키즈카페 기본 정보)  umppa.seoul.go.kr (이미지·상세URL·출생연도 범위)
        │                              │
        ▼                              ▼ 스크래핑 (GitHub Actions cron, 매일 02:00 KST)
  parseSeoulKidsCafe            scrape-umppa.mjs
        │                              │
        └──────────────┬───────────────┘
                       ▼
            enrichKidsCafeWithKakaoData
              (Kakao 맵 Local Search API)
                       │
                       ▼
                 cafe-data.ts
              (`use cache` 적용)
                       │
                       ▼
                 /api/cafes 응답
```

### 캐싱 전략

서울시 공공 데이터는 자주 바뀌지 않습니다. 두 가지 캐싱 레이어를 적용해 불필요한 외부 API 호출과 Vercel Image Optimization 비용을 줄였습니다.

- **`use cache` (Next.js 16)** — `cafe-data.ts`의 데이터 집계 함수에 적용. 배포 사이클 단위로 캐싱되어 외부 API는 1회만 호출됩니다.
- **Image Cache TTL `86400`s** — `next.config.ts`에 24시간 설정. umppa 스크래핑 주기(매일)와 일치시켜 캐시 무효화 빈도를 최소화합니다.

### Kakao API 3단계 폴백 검색

서울시 공공 API의 주소·상호명 포맷이 일관되지 않아 Kakao Place 매칭 실패가 잦았습니다. 검색 전략을 단계적으로 내려가도록 설계해 매칭률을 높였습니다.

```
1단계: 전화번호로 검색 (정확도 최고)
    ↓ 실패 시
2단계: 주소로 검색 (반경 300m)
    ↓ 실패 시
3단계: 상호명만으로 검색 (최후 수단)
```

---

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local

# 개발 서버
npm run dev

# 테스트
npm test

# umppa 데이터 수동 스크래핑
npm run scrape
```
