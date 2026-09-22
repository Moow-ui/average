/**
 * /data 폴더 JSON 파일의 타입 정의.
 * 구조 설명은 data/SCHEMA.md 를 보세요.
 */

export const countryCodes = ["KR", "US", "JP"] as const;
export type CountryCode = (typeof countryCodes)[number];

/** 계산 대상 지역. WORLD 는 나라별 분포를 인구 가중으로 합친 것. */
export type RegionCode = CountryCode | "WORLD";

export type Gender = "male" | "female";

export type LengthUnit = "cm" | "ftin";
export type MassUnit = "kg" | "lb";

export type Citation = {
  source: string | null;
  url: string | null;
  year: number | null;
  license: string | null;
  note?: string | null;
};

/** 확인된 수치인지("ok"), 아직 조사 중인지("todo"). */
export type DataStatus = "ok" | "todo";

/** p 는 하위 백분위(0~100). p:90 이면 "하위 90% 지점 = 상위 10%". */
export type PercentilePoint = { p: number; value: number };

type Sourced = {
  status: DataStatus;
  todo: string | null;
  citation: Citation;
};

export type PopulationEntry = Sourced & {
  value: number | null;
};

export type CountryEntry = {
  code: CountryCode;
  currency: string;
  defaultUnits: { length: LengthUnit; mass: MassUnit };
  adultPopulation: PopulationEntry;
};

/**
 * 세계 자료 한 줄. 나라 코드는 NCD-RisC 표기(ISO 3166-1 alpha-3, 예: "KOR").
 * MVP 3개국(CountryCode)과 달리 200개국까지 들어올 수 있어 string 으로 둔다.
 */
export type WorldCountryDistribution = {
  country: string;
  gender: Gender;
  mean: number | null;
  sd: number | null;
  /** 그 나라 성인 인구. 세계 분포를 합칠 때 가중치로 쓴다. */
  adultPopulation: number | null;
};

/**
 * 세계 키·몸무게 분포 (NCD-RisC 국가별 자료).
 * MVP 3개국을 합쳐서 "세계"라고 부르지 않는다. 이 파일이 비어 있으면
 * 화면에는 "세계 데이터 준비 중"이 뜬다.
 */
export type WorldDistributionFile = {
  version: number;
  metric: "height" | "weight";
  unit: "cm" | "kg";
  updatedAt: string;
  scope: "global";
  status: DataStatus;
  todo: string | null;
  citation: Citation;
  /** 이 숫자 이상 나라가 있어야 "세계"라고 부를 수 있다. */
  minCountries: number;
  distributions: WorldCountryDistribution[];
};

/** 세계 소득 분포 (World Inequality Database). 금액은 PPP 기준 국제달러. */
export type WorldIncomeFile = {
  version: number;
  updatedAt: string;
  scope: "global";
  definition: "personal_pretax_annual";
  definitionNote: string;
  currency: "PPP_USD";
  incomeYear: number | null;
  status: DataStatus;
  todo: string | null;
  citation: Citation;
  percentiles: PercentilePoint[];
};

/** "세계" 백분위가 지금 몇 개 나라를 덮고 있는지 기록해 두는 곳. */
export type WorldCoverage = {
  note: string;
  /** "partial" 이면 아직 진짜 '세계'가 아니라는 뜻. */
  coverageStatus: "partial" | "global";
  todo: string | null;
};

export type CountriesFile = {
  version: number;
  updatedAt: string;
  countries: CountryEntry[];
  world: WorldCoverage;
};

export type Distribution = Sourced & {
  country: CountryCode;
  gender: Gender;
  /** "19+" 는 성인 전체. "19-29" 처럼 연령대를 좁힌 줄도 들어올 수 있다. */
  ageGroup: string;
  mean: number | null;
  sd: number | null;
  sampleSize: number | null;
};

export type DistributionFile = {
  version: number;
  metric: "height" | "weight";
  unit: "cm" | "kg";
  updatedAt: string;
  distributions: Distribution[];
};

export type IncomeEntry = Sourced & {
  country: CountryCode;
  currency: string;
  incomeYear: number | null;
  percentiles: PercentilePoint[];
  lognormal: { meanLog: number | null; sdLog: number | null };
};

export type IncomeFile = {
  version: number;
  definition: "personal_pretax_annual";
  definitionNote: string;
  updatedAt: string;
  entries: IncomeEntry[];
};

export type PppRate = Sourced & {
  currency: string;
  year: number | null;
  /** 1 PPP달러를 사는 데 필요한 현지 통화 금액. */
  pppConversionFactor: number | null;
  /** 참고용 시장환율 (1달러당 현지 통화). */
  marketRate: number | null;
};

export type PppFile = {
  version: number;
  baseCurrency: "USD";
  updatedAt: string;
  rates: PppRate[];
};
