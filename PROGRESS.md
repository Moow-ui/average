# PROGRESS.md — 진행 상황

> 매 단계가 끝날 때마다 갱신합니다. 규칙은 `CLAUDE.md`를 보세요.

마지막 갱신: 2026-09-22 · 현재 단계: **1단계 완료**

---

## 전체 계획 (9단계)

| 단계 | 내용 | 상태 |
|---|---|---|
| 1 | 프로젝트 뼈대 (Next.js + TypeScript + Tailwind + Vitest, 다국어·다크모드 골격) | ✅ 완료 |
| 2 | `/data` JSON 5개 + 스키마 문서 + 데이터 검증 스크립트, 공식 출처 조사 | ⬜ 다음 |
| 3 | `/lib` 계산 함수 (정규분포·혼합분포·소득 보간·단위 변환) + 단위 테스트 | ⬜ |
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

## 다음에 할 일 (2단계)

1. `data/SCHEMA.md` — 각 JSON 파일의 뜻을 한국어로 설명
2. `data/countries.json`, `height.json`, `weight.json`, `income.json`, `ppp.json` 생성
3. `scripts/validate-data.ts` — 출처 없는 수치가 들어가면 빌드를 막는 검사
4. 공식 출처에서 실제 수치 조사해 채우기 (확인 못 한 값은 `null` + `todo`)

---

## 확인해야 할 데이터 목록 (TODO)

> 2단계에서 조사하며 채워 나갑니다. 확인 못 한 항목은 여기에 남습니다.

| 항목 | 필요한 값 | 출처 후보 | 상태 |
|---|---|---|---|
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
