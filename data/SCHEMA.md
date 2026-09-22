# /data 폴더 안내

이 폴더의 JSON 파일에는 **사이트가 쓰는 모든 통계 수치**가 들어 있습니다.
코드(`.ts`, `.tsx`)에는 통계 숫자를 절대 적지 않습니다. 숫자를 고치고 싶으면
여기 JSON만 고치면 됩니다.

## 파일 목록

| 파일 | 내용 |
|---|---|
| `countries.json` | 나라 목록, 기본 단위, 통화, 만 19세 이상 성인 인구 |
| `height.json` | 나라·성별·연령대별 키 평균과 표준편차 |
| `weight.json` | 나라·성별·연령대별 몸무게 평균과 표준편차 |
| `income.json` | 나라별 개인 세전 연소득 백분위표 또는 로그정규 파라미터 |
| `ppp.json` | 통화별 PPP(구매력평가) 환산계수와 시장환율 |

---

## 공통 규칙

### 1. `citation` (출처) — 모든 수치 묶음에 필수

```json
"citation": {
  "source": "기관 이름",
  "url": "자료를 볼 수 있는 주소",
  "year": 2022,
  "license": "이용 조건 (모르면 null)",
  "note": "보충 설명 (없어도 됨)"
}
```

### 2. `status` — 이 수치를 믿고 써도 되는지

| 값 | 뜻 | 화면에서 |
|---|---|---|
| `"ok"` | 출처를 확인한 실제 수치 | 정상 계산 |
| `"todo"` | 아직 확인하지 못함 | **"데이터 준비 중"** 표시, 계산 건너뜀 |

### 3. `todo` — 무엇을 확인해야 하는지 적는 메모

`status`가 `"todo"`일 때 **반드시** 채웁니다.
예: `"국민건강영양조사 만19세 이상 남성 평균 신장·표준편차 확인 필요"`

### 4. 검증 (`npm run validate:data`)

`npm run build` 를 하면 자동으로 먼저 돌아갑니다. 아래를 어기면 **빌드가 실패**합니다.

- `status: "ok"` 인데 `source` / `url` / `year` 중 하나라도 비어 있음
- `status: "ok"` 인데 숫자 값이 `null`
- `status: "todo"` 인데 `todo` 메모가 비어 있음
- 표준편차(`sd`)가 0 이하, 평균(`mean`)이 0 이하
- 소득 백분위표의 값이 커지는 순서가 아님
- `countries.json`에 없는 나라 코드를 씀

즉, **출처 없는 숫자는 구조적으로 들어갈 수 없습니다.**

---

## countries.json

```json
{
  "version": 1,
  "updatedAt": "2026-09-22",
  "countries": [
    {
      "code": "KR",                       // KR | US | JP | WORLD
      "currency": "KRW",                  // WORLD 는 "USD"
      "defaultUnits": { "length": "cm", "mass": "kg" },
      "adultPopulation": {                // 만 19세 이상 인구 (명)
        "value": 44000000,
        "status": "ok",
        "todo": null,
        "citation": { "source": "...", "url": "...", "year": 2024, "license": "..." }
      }
    }
  ]
}
```

`adultPopulation`은 **세계 백분위를 계산할 때 나라별 가중치**로 쓰입니다.
(세계 = 나라별 분포를 성인 인구로 가중해 합친 혼합분포)

---

## height.json / weight.json

두 파일의 구조는 같습니다. `metric`과 `unit`만 다릅니다.

```json
{
  "version": 1,
  "metric": "height",                     // "height" | "weight"
  "unit": "cm",                           // "cm" | "kg"
  "updatedAt": "2026-09-22",
  "distributions": [
    {
      "country": "KR",
      "gender": "male",                   // "male" | "female"
      "ageGroup": "19+",                  // "19+" 가 기본. "19-29" 등 추가 가능
      "mean": 172.5,
      "sd": 5.9,
      "sampleSize": 1234,                 // 모르면 null (계산에는 안 씀)
      "status": "ok",
      "todo": null,
      "citation": { "source": "...", "url": "...", "year": 2022, "license": "..." }
    }
  ]
}
```

- **`19+`(성인 전체)는 나라·성별마다 반드시 한 줄씩 있어야 합니다.**
  연령대별 자료(`19-29`, `30-39` …)는 있으면 추가로 넣고, 없으면 `19+`로 계산합니다.
- 키·몸무게는 평균과 표준편차만으로 **정규분포**를 만들어 백분위를 구합니다.
- BMI는 몸무게와 키에서 직접 계산하므로 별도 파일이 없습니다.

---

## income.json

```json
{
  "version": 1,
  "definition": "personal_pretax_annual",
  "definitionNote": "개인 세전 연소득. 가구소득이 아님.",
  "updatedAt": "2026-09-22",
  "entries": [
    {
      "country": "KR",
      "currency": "KRW",
      "incomeYear": 2023,                 // 소득의 기준 연도
      "percentiles": [                    // 있으면 이걸 우선 사용 (보간)
        { "p": 10, "value": 12000000 },
        { "p": 50, "value": 32000000 },
        { "p": 90, "value": 78000000 }
      ],
      "lognormal": { "meanLog": null, "sdLog": null },   // 백분위표가 없을 때 대안
      "status": "ok",
      "todo": null,
      "citation": { "source": "...", "url": "...", "year": 2024, "license": "..." }
    }
  ]
}
```

- `percentiles`의 `p`는 **하위 백분위**입니다. `p: 90`이면 "하위 90% 지점 = 상위 10%".
- `percentiles`가 2개 이상 있으면 보간해서 씁니다.
- 없으면 `lognormal`(로그정규분포)을 씁니다. 둘 다 비어 있으면 "데이터 준비 중".
- 세계 비교는 각 나라 값을 `ppp.json`으로 **PPP 기준 달러**로 환산한 뒤 합칩니다.

---

## ppp.json

```json
{
  "version": 1,
  "baseCurrency": "USD",
  "updatedAt": "2026-09-22",
  "rates": [
    {
      "currency": "KRW",
      "year": 2023,
      "pppConversionFactor": 861.8,       // 1 PPP달러 = 861.8원 (예시)
      "marketRate": 1305.4,               // 1 달러 = 1305.4원 (예시)
      "status": "ok",
      "todo": null,
      "citation": { "source": "...", "url": "...", "year": 2024, "license": "..." }
    }
  ]
}
```

- `pppConversionFactor`: **1 PPP달러를 사려면 그 나라 돈이 얼마 필요한가**.
  세계 소득 비교는 반드시 이 값으로 환산합니다 (시장환율 아님).
- `marketRate`: 참고용 시장환율. 화면에 "참고" 표시로만 씁니다.
- `USD`는 기준 통화이므로 두 값 모두 `1`입니다.

---

## countries.json 의 `world` 블록

```json
"world": {
  "note": "세계 백분위는 자료가 준비된 나라만 성인 인구로 가중해 합친 값입니다.",
  "coverageStatus": "partial",     // "partial" | "global"
  "todo": "지금은 KR/US/JP 3개국만 ..."
}
```

`coverageStatus`가 `"partial"`이면 **아직 진짜 "세계"가 아닙니다.**
이 경우 화면에는 "세계"가 아니라 **"한·미·일 3개국 기준"** 처럼
몇 개 나라를 합친 것인지 정확히 밝혀야 합니다.
나라 수를 늘려 전 세계를 덮게 되면 `"global"`로 바꿉니다.
