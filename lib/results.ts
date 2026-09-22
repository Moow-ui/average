/**
 * 데이터와 계산 함수를 이어 붙여 "화면에 보여줄 결과"를 만든다.
 *
 * 규칙:
 * - 자료가 없으면 계산하지 않고 "준비 중"을 돌려준다. 절대 어림값을 만들지 않는다.
 * - 세계 결과는 반드시 세계 전용 자료(NCD-RisC / WID)로만 만든다.
 *   MVP 3개국을 합쳐서 "세계"라고 부르지 않는다.
 */
import {
  getAdultPopulation,
  getDistribution,
  getIncomeEntry,
  getPppRate,
  getWorldComponents,
  getWorldIncome,
} from "./data";
import type { CountryCode, Gender, RegionCode } from "./data-types";
import { incomePercentile, incomeAtPercentile } from "./income";
import { mixtureMean, mixturePercentile } from "./mixture";
import { normalPercentile } from "./stats";
import { toPppUsd } from "./units";

export type BodyMetric = "height" | "weight";

/** 한 지역(나라 또는 세계)에 대한 결과. */
export type RegionResult =
  | {
      region: RegionCode;
      state: "ready";
      /** 하위 백분위(0~100). */
      lowerPercentile: number;
      /** 그 지역 평균. 없으면 undefined. */
      mean?: number;
      /** 내 값에서 평균을 뺀 차이. */
      difference?: number;
    }
  | {
      region: RegionCode;
      state: "pending";
    };

function pending(region: RegionCode): RegionResult {
  return { region, state: "pending" };
}

/** 키·몸무게: 어떤 나라에서 상위 몇 %인지. */
export function bodyResultForCountry(
  metric: BodyMetric,
  country: CountryCode,
  gender: Gender,
  value: number,
): RegionResult {
  const dist = getDistribution(metric, country, gender);
  if (!dist || typeof dist.mean !== "number" || typeof dist.sd !== "number") {
    return pending(country);
  }
  return {
    region: country,
    state: "ready",
    lowerPercentile: normalPercentile(value, { mean: dist.mean, sd: dist.sd }),
    mean: dist.mean,
    difference: value - dist.mean,
  };
}

/**
 * 키·몸무게: 세계에서 상위 몇 %인지.
 * NCD-RisC 국가별 자료가 준비되기 전에는 언제나 "준비 중".
 */
export function bodyResultForWorld(
  metric: BodyMetric,
  gender: Gender,
  value: number,
): RegionResult {
  const components = getWorldComponents(metric, gender);
  if (!components) return pending("WORLD");
  return {
    region: "WORLD",
    state: "ready",
    lowerPercentile: mixturePercentile(value, components),
    mean: mixtureMean(components),
    difference: value - mixtureMean(components),
  };
}

/** 키·몸무게 결과 한 묶음 (나라들 + 세계). */
export function bodyResults(
  metric: BodyMetric,
  gender: Gender,
  value: number,
  countries: CountryCode[],
): RegionResult[] {
  return [
    ...countries.map((country) =>
      bodyResultForCountry(metric, country, gender, value),
    ),
    bodyResultForWorld(metric, gender, value),
  ];
}

/** 소득: 어떤 나라에서 상위 몇 %인지. 금액은 그 나라 통화 단위. */
export function incomeResultForCountry(
  country: CountryCode,
  amountInLocalCurrency: number,
): RegionResult {
  const entry = getIncomeEntry(country);
  if (!entry) return pending(country);

  const result = incomePercentile(amountInLocalCurrency, {
    percentiles: entry.percentiles,
    lognormal: entry.lognormal,
  });
  if (!result) return pending(country);

  const median = incomeAtPercentile(50, {
    percentiles: entry.percentiles,
    lognormal: entry.lognormal,
  });

  return {
    region: country,
    state: "ready",
    lowerPercentile: result.percentile,
    mean: median,
    difference: median === undefined ? undefined : amountInLocalCurrency - median,
  };
}

/**
 * 소득: 세계에서 상위 몇 %인지.
 * World Inequality Database 의 세계 분포와 PPP 환산이 둘 다 있어야 계산한다.
 */
export function incomeResultForWorld(
  currency: string,
  amountInLocalCurrency: number,
): RegionResult {
  const world = getWorldIncome();
  const ppp = getPppRate(currency);
  if (!world || !ppp || typeof ppp.pppConversionFactor !== "number") {
    return pending("WORLD");
  }

  const pppUsd = toPppUsd(amountInLocalCurrency, ppp.pppConversionFactor);
  const result = incomePercentile(pppUsd, { percentiles: world.percentiles });
  if (!result) return pending("WORLD");

  const median = incomeAtPercentile(50, { percentiles: world.percentiles });

  return {
    region: "WORLD",
    state: "ready",
    lowerPercentile: result.percentile,
    mean: median,
    difference: median === undefined ? undefined : pppUsd - median,
  };
}

/**
 * 지금 이 항목을 계산할 수 있는 나라 목록.
 * 하나도 없으면 화면에 "데이터 준비 중"을 보여준다.
 */
export function readyCountriesFor(
  metric: BodyMetric | "income",
  gender: Gender,
  candidates: CountryCode[],
): CountryCode[] {
  if (metric === "income") {
    return candidates.filter((code) => getIncomeEntry(code) !== undefined);
  }
  return candidates.filter(
    (code) =>
      getDistribution(metric, code, gender) !== undefined &&
      getAdultPopulation(code) !== undefined,
  );
}
