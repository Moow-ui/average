# PROGRESS.md — 진행 상황

> 매 단계가 끝날 때마다 갱신합니다. 규칙은 `CLAUDE.md`를 보세요.

마지막 갱신: 2026-09-22 · 현재 상태: **1~9단계 코드 완료 / 통계 수치만 비어 있음**

---

## 전체 계획

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 뼈대 (Next.js + TypeScript + Tailwind + Vitest) | ✅ |
| 2 | `/data` JSON + 스키마 문서 + 데이터 검증 스크립트 | ✅ (수치는 비어 있음) |
| 3 | `/lib` 계산 함수 + 단위 테스트 | ✅ |
| 4 | 다국어 문구(ko/en/ja), 레이아웃, 쿠키 동의 구조 | ✅ |
| 5 | 계산기 페이지 (입력·단위 전환·결과 카드·분포 그래프) | ✅ |
| 6 | 결과 정적 페이지 (비교표·해설·인접 링크·공유) | ✅ |
| 7 | SEO (hreflang, canonical, OG 이미지, sitemap, robots, 구조화 데이터) | ✅ |
| 8 | 필수 페이지 5종 (소개·출처·개인정보·약관·문의) | ✅ |
| 9 | 마감 점검 (빌드·테스트·375px·Lighthouse) | ✅ |
| — | **통계 수치 채우기** | ⬜ **남은 일 (Cowork로 조사 예정)** |

---

## 최종 점검 결과 (9단계)

| 항목 | 결과 |
|---|---|
| `npm run build` | ✅ 성공 — HTML 822쪽, `out/` 폴더 |
| `npm test` | ✅ 91개 통과 |
| `npm run lint` / `npm run typecheck` | ✅ 통과 |
| `/data` 출처 검사 | ✅ 통과 (지어낸 수치 0개) |
| null 데이터에서 페이지 깨짐 | ✅ 없음 (콘솔 오류 0건) |
| ko/en/ja + 단위 전환 | ✅ 동작 |
| 375px 모바일 | ✅ 가로 스크롤 없음 |
| 입력값 네트워크 전송 | ✅ 0건 (입력·계산 후 요청 없음) |
| 광고 위치 / 화면 밀림 | ✅ 본문 맨 아래만, CLS 0 |
| sitemap + hreflang | ✅ 819개 주소, ko/en/ja/x-default |

### Lighthouse (모바일, gzip 적용 기준)

| 페이지 | 성능 | 접근성 | 권장사례 | SEO |
|---|---|---|---|---|
| `/ko` | 99 | 100 | 100 | 100 |
| `/ko/height` | 99 | 100 | 100 | 100 |
| `/en/income` | 99 | 100 | 100 | 100 |
| `/ko/height/male/180` | 99 | 100 | 100 | 100 |
| `/ja/sources` | 98 | 100 | 100 | 100 |

---

## 스스로 정한 것들과 그 이유

사용자에게 묻지 않고 "가장 무난한 쪽"으로 정한 사항입니다. 바꾸고 싶으면 말씀해 주세요.

| 정한 것 | 이유 |
|---|---|
| **"세계"는 전용 자료로만 계산** (`world-*.json`) | 한·미·일 3개국을 합쳐 "세계"라고 부르면 사실과 다릅니다. 자료가 없으면 계산하지 않고 "세계 데이터 준비 중"을 표시합니다. |
| **세계 자료 최소 80개국** (`minCountries`) | 이보다 적으면 `status: "ok"` 로 둘 수 없게 검사에서 막습니다. |
| **결과 정적 페이지는 키·몸무게만** | 소득은 주소에 통화가 드러나지 않아 `/ko/income/all/4000` 이 4천만원인지 알 수 없습니다. 자료가 갖춰진 뒤 다시 봅니다. |
| **결과 페이지 범위**: 키 150~200cm, 몸무게 40~120kg (1단위) | 현실적인 범위만. 822쪽으로 관리 가능한 수준입니다. |
| **BMI 범주(저체중/정상/과체중) 표시 안 함** | "체형을 평가·비하하지 않는다" 규칙에 따라 숫자와 면책 문구만 보여줍니다. |
| **소득 상위 구간은 파레토 꼬리로 추정** | 공개 표의 맨 윗구간을 넘는 소득도 답을 줄 수 있고, 어떻게 구했는지 화면에 밝힙니다. |
| **OG 이미지는 24장** (언어×항목×성별) | 값마다 만들면 800장이 넘는데, 지금은 수치가 없어 이미지에 넣을 숫자도 없습니다. 자료가 들어오면 값별로 늘릴 수 있습니다. |
| **문구를 클라이언트 번들에 포함** | 서버에서 props 로 내리면 페이지마다 16KB씩 붙습니다. HTML이 44KB → 33KB 로 줄었습니다. |
| **차트 라이브러리 미사용** (SVG 직접) | 페이지를 가볍게 유지해 Lighthouse 성능 99를 확보했습니다. |
| **사이트 주소 기본값 `https://average.pages.dev`** | 실제 주소가 정해지면 `NEXT_PUBLIC_SITE_URL` 환경변수로 바꿉니다. |
| **계산은 "계산하기" 버튼을 눌러야 실행** | 타이핑 중에 결과가 계속 흔들리지 않게 했습니다. |

---

## Cloudflare 배포 설정

| 항목 | 값 |
|---|---|
| Framework preset | **Next.js (Static HTML Export)** |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node 버전 | **22** (환경변수 `NODE_VERSION=22`) |
| 환경변수(선택) | `NEXT_PUBLIC_SITE_URL=https://실제주소` |

- Workers Builds(`npx wrangler deploy`)로 배포하는 경우 `wrangler.jsonc` 가 `out/` 을 올립니다.
  이때 **Build command 를 `npm run build` 로 반드시 채워야** 합니다 (지금 `None` 이면 빈 폴더가 올라갑니다).
- 방문자 통계는 Cloudflare 대시보드 → Web Analytics 에서 켭니다. 코드로 넣지 않습니다.

---

## 남은 일: 통계 수치 채우기

`/data` 의 모든 수치가 `null` + `status: "todo"` 입니다.
값을 넣고 `status` 를 `"ok"` 로 바꾼 뒤 `npm run validate:data` 를 돌리면 검사됩니다.

### 나라별 (한국·미국·일본)

| 항목 | 파일 | 어디서 |
|---|---|---|
| 키 평균·표준편차 | `data/height.json` | 한국: KOSIS `DT_35007_N130` / 일본: e-Stat 표14 `sid=0003224177` 의 **20歳以上** 줄 / 미국: CDC NCHS *Anthropometric Reference Data* (Series 3) |
| 몸무게 평균·표준편차 | `data/weight.json` | 한국: KOSIS `DT_35007_N132` / 일본·미국 위와 동일 |
| 개인 세전 연소득 백분위 | `data/income.json` | 한국: 국세청 통합소득 100분위 / 미국: US Census PINC-01 / 일본: 국세청 民間給与実態統計調査 |
| PPP 환산계수·시장환율 | `data/ppp.json` | World Bank `PA.NUS.PPP`, `PA.NUS.FCRF` (연도 일치 필요) |
| 만 19세 이상 인구 | `data/countries.json` | KOSIS 주민등록인구 / US Census NC-EST / 総務省 人口推計 (또는 UN WPP) |

### 세계 (이게 없으면 "세계 데이터 준비 중"으로 표시됨)

| 항목 | 파일 | 어디서 |
|---|---|---|
| 200여 개국 키 평균·표준편차 + 성인 인구 | `data/world-height.json` | NCD-RisC 국가별 CSV + UN World Population Prospects |
| 200여 개국 몸무게 평균·표준편차 + 성인 인구 | `data/world-weight.json` | 위와 동일 (몸무게·BMI는 adiposity 자료) |
| 세계 소득 백분위 (PPP 국제달러) | `data/world-income.json` | World Inequality Database — World, Pre-tax national income, adults |

> 각 JSON 의 `todo` 필드에 정확한 주소와 어느 줄을 봐야 하는지 적혀 있습니다.

---

## 나중에 사용자가 직접 해야 하는 일

- Google AdSense 승인 → `components/AdSlot.tsx` 에 광고 코드 넣기
  (광고를 켤 때 `components/CookieConsent.tsx` 의 `ADS_ENABLED` 를 `true` 로)
- Cloudflare 대시보드에서 Build command 를 `npm run build` 로, 출력 폴더를 `out` 으로 설정
- 실제 도메인 연결 후 `NEXT_PUBLIC_SITE_URL` 환경변수 설정
- 문의용 이메일 주소 결정 → `messages/*.json` 의 `pages.contact.emailPending` 교체
