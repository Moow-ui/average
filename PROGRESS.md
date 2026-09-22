# PROGRESS.md — 진행 상황

> 매 단계가 끝날 때마다 갱신합니다. 규칙은 `CLAUDE.md`를 보세요.

마지막 갱신: 2026-09-22 · 현재 단계: **2단계 완료 (수치 채우기는 보류)**

---

## 전체 계획 (9단계)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 뼈대 (Next.js + TypeScript + Tailwind + Vitest, 다국어·다크모드 골격) | ✅ 완료 |
| 2 | `/data` JSON 5개 + 스키마 문서 + 데이터 검증 스크립트 | ⚠️ 구조 완료, 수치는 미기입 |
| 3 | `/lib` 계산 함수 (정규분포·혼합분포·소득 보간·단위 변환) + 단위 테스트 | ⬜ 다음 |
| 4 | 다국어 문구 확장, 메인 페이지 다듬기, 쿠키 동의 구조 | ⬜ |
| 5 | 계산기 페이지 (입력 폼, 단위 전환, 결과 카드, 분포 그래프) | ⬜ |
| 6 | 결과 정적 페이지 (비교표·구간 해설·인접 링크·공유 버튼) | ⬜ |
| 7 | SEO (hreflang, canonical, OG 이미지, sitemap, robots, 구조화 데이터) | ⬜ |
| 8 | 필수 페이지 5종 (소개·출처·개인정보·약관·문의) | ⬜ |
| 9 | 마감 점검 (빌드·테스트·375px·Lighthouse·체크리스트 전체) | ⬜ |

---

## 1단계에서 한 일

- Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 설치
- Vitest(테스트), ESLint(코드 검사) 설정
- 폴더 구조 생성: `app/`, `components/`, `lib/`, `messages/`, `data/`, `scripts/`
- 다국어 뼈대: `lib/i18n.ts` + `messages/ko.json`·`en.json`·`ja.json`
- `/` 로 들어오면 `/ko` 로 보내는 설정
- 페이지: 메인(`/ko`, `/en`, `/ja`), 항목별 계산기 자리
  (`/ko/height` 등 — 지금은 "데이터 준비 중"만 표시)
- 컴포넌트: `AdSlot`(광고 자리, 높이만 확보), `ThemeToggle`(다크모드),
  `LocaleSwitcher`(언어 전환)
- `CLAUDE.md`(규칙), `PROGRESS.md`(이 파일) 작성

### 1단계 체크리스트 결과
- [x] `npm run build` 성공 — 정적 페이지 12개 생성
- [x] `npm test` 통과 — 3개 (세 언어 문구 키가 서로 맞는지 검사 포함)
- [x] `npm run lint` / `npm run typecheck` 통과
- [x] `null` 데이터 대비 "데이터 준비 중" 표시 컴포넌트 문구 준비
- [x] ko/en/ja 언어 전환 동작
- [x] 입력값을 보내는 코드 없음 (아직 입력 기능 자체가 없음)
- [x] 광고 자리는 본문 맨 아래에만, 높이 고정
- [ ] 단위 전환 — 5단계에서
- [ ] `sitemap.xml` — 7단계에서

---

## 2단계에서 한 일

- `data/SCHEMA.md` — 각 JSON 파일의 뜻과 규칙을 한국어로 설명
- `data/countries.json`, `height.json`, `weight.json`, `income.json`, `ppp.json` 생성
- `lib/data-types.ts` — JSON 구조의 타입 정의
- `lib/data.ts` — 데이터 읽기 창구. **확인된 수치(`status: "ok"`)만 통과**시키므로
  값이 `null` 이어도 화면이 깨지지 않음
- `lib/validate-data.ts` + `scripts/validate-data.ts` — 데이터 검사
  - `npm run build` 실행 시 **자동으로 먼저 돌아가고, 문제가 있으면 빌드가 실패**함
- 계산기 페이지가 나라별 데이터 준비 상황을 표시하도록 연결
  (자료가 하나도 없어도 "데이터 준비 중"이 뜨고 에러가 나지 않는지 확인 완료)
- `app/icon.svg` — 사이트 아이콘 추가

### ⚠️ 수치를 채우지 못한 이유

이 작업 환경의 **네트워크 정책이 외부 통계 사이트 접속을 막고 있습니다.**
(`kosis.kr`, `e-stat.go.jp`, `cdc.gov`, `api.worldbank.org`, `ncdrisc.org` 모두 403)

프로젝트 규칙 "정확한 수치를 확실히 알지 못하면 절대 지어내지 않는다"에 따라,
**숫자는 하나도 넣지 않고 전부 `null` + `todo`로 두었습니다.**
대신 각 `todo` 메모에 **어느 기관의 어느 표를 보면 되는지 정확한 주소까지** 적어
두었으므로, 값만 옮겨 적으면 됩니다.

### 2단계 체크리스트 결과
- [x] `npm run build` 성공 (데이터 검사 포함, 정적 페이지 15개)
- [x] `npm test` 통과 — 9개 (검사 규칙이 잘못된 데이터를 실제로 잡아내는지 포함)
- [x] `/data`의 모든 수치가 `null` + `status: "todo"` + `todo` 메모
- [x] `null` 데이터여도 페이지가 깨지지 않음 (브라우저 콘솔 오류 0건)
- [x] `npm run lint` / `npm run typecheck` 통과

---

## 다음에 할 일 (3단계)

1. `lib/stats.ts` — 정규분포 CDF와 백분위 계산
2. `lib/mixture.ts` — 나라별 분포를 인구 가중으로 합친 세계 백분위
3. `lib/income.ts` — 백분위표 보간, 없으면 로그정규분포
4. `lib/units.ts` — cm↔ft·in, kg↔lb, 만원↔원, PPP 환산
5. `lib/format.ts` — "상위 12.3%", "상위 0.1% 미만" 표기
6. 각 함수의 단위 테스트 (평균값 입력 시 약 50%가 나오는지 포함)

> 계산 함수는 데이터가 없어도 만들고 테스트할 수 있습니다.
> 테스트는 실제 `/data` 값이 아니라 테스트용 숫자로 검증합니다.

---

## 확인해야 할 데이터 목록 (TODO)

> 아래 값들은 아직 비어 있습니다(`null` + `todo`). 값을 넣기 전까지 해당 항목은
> 사이트에서 "데이터 준비 중"으로 표시됩니다.

| 항목 | 넣을 곳 | 어디서 찾나 |
|---|---|---|
| 한국 키·몸무게 | `data/height.json`, `weight.json` | KOSIS 평균 신장 `DT_35007_N130` / 평균 체중 `DT_35007_N132`. 표준편차는 질병관리청 국민건강영양조사 원시자료 |
| 일본 키·몸무게 | 〃 | e-Stat 국민건강·영양조사 **표14** `sid=0003224177` 의 **20歳以上(再掲)** 줄 (1歳以上 줄 아님) |
| 미국 키·몸무게 | 〃 | CDC NCHS *Anthropometric Reference Data* (Series 3). 표준편차는 (95백분위−5백분위)÷3.29 로 어림 |
| 한국 소득 | `data/income.json` | 국세청 국세통계 통합소득 100분위, 또는 통계청 임금근로일자리 소득 |
| 미국 소득 | 〃 | US Census **PINC-01** (전체 성인) 또는 SSA Wage Statistics (급여소득자만) |
| 일본 소득 | 〃 | 국세청 民間給与実態統計調査 (급여소득자만) |
| PPP·환율 | `data/ppp.json` | World Bank `PA.NUS.PPP` (PPP), `PA.NUS.FCRF` (시장환율) — 두 값의 연도를 맞출 것 |
| 성인 인구 | `data/countries.json` | KOSIS 주민등록인구 / US Census NC-EST / 総務省 人口推計 (또는 UN WPP) |

> 자세한 주소는 각 JSON 파일의 `todo` 필드에 그대로 적혀 있습니다.
> 값을 넣은 뒤 `status` 를 `"ok"` 로 바꾸고 `citation` 을 채운 다음
> `npm run validate:data` 를 돌려보세요.

### ⚠️ "세계" 범위 문제 (결정 필요)

지금 구조로는 "세계" = **한·미·일 3개국을 인구 가중으로 합친 것**입니다.
이건 진짜 세계가 아닙니다. `data/countries.json` 의 `world.coverageStatus` 가
`"partial"` 로 표시돼 있습니다. 두 가지 중 하나를 골라야 합니다.

1. 화면에 **"한·미·일 3개국 기준"** 이라고 정확히 표시한다 (당장 가능)
2. NCD-RisC 국가별 자료로 **나라 수를 크게 늘린다** (작업량 많음, 진짜 "세계")

---|---|---|---|
| 키 | KR/US/JP 성인 남녀 평균·표준편차 | NCD-RisC, 국민건강영양조사, NHANES, e-Stat | ⬜ 미조사 |
| 몸무게 | KR/US/JP 성인 남녀 평균·표준편차 | 위와 동일 | ⬜ 미조사 |
| 소득 | KR/US/JP 개인 세전 연소득 백분위표 | 국세청, US Census, 일본 국세청 민간급여실태조사, WID | ⬜ 미조사 |
| PPP | KRW/JPY 대비 USD PPP 환산계수·시장환율 | World Bank ICP | ⬜ 미조사 |
| 인구 | KR/US/JP 및 세계 만 19세 이상 성인 인구 | UN World Population Prospects | ⬜ 미조사 |

---

## 나중에 사용자가 직접 해야 하는 일

- Google AdSense 계정 승인 → `components/AdSlot.tsx` 에 광고 코드 넣기
- Vercel에 GitHub 저장소 연결해서 배포
- 실제 도메인 연결 (SEO의 `canonical` 주소에 필요)
