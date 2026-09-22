/**
 * /data JSON 파일을 읽어오는 곳.
 *
 * 다른 코드는 JSON 파일을 직접 import 하지 않고 반드시 이 파일을 거친다.
 * 여기서 "확인된 수치(ok)"만 골라주므로, null 값 때문에 화면이 깨지지 않는다.
 */
import countriesJson from "@/data/countries.json";
import heightJson from "@/data/height.json";
import weightJson from "@/data/weight.json";
import incomeJson from "@/data/income.json";
import pppJson from "@/data/ppp.json";
import worldHeightJson from "@/data/world-height.json";
import worldWeightJson from "@/data/world-weight.json";
import worldIncomeJson from "@/data/world-income.json";

import type {
  CountriesFile,
  CountryCode,
  CountryEntry,
  Distribution,
  DistributionFile,
  Gender,
  IncomeEntry,
  IncomeFile,
  PppFile,
  PppRate,
  WorldDistributionFile,
  WorldIncomeFile,
} from "./data-types";

export const countries = countriesJson as CountriesFile;
export const heightData = heightJson as DistributionFile;
export const weightData = weightJson as DistributionFile;
export const incomeData = incomeJson as IncomeFile;
export const pppData = pppJson as PppFile;
export const worldHeightData = worldHeightJson as WorldDistributionFile;
export const worldWeightData = worldWeightJson as WorldDistributionFile;
export const worldIncomeData = worldIncomeJson as WorldIncomeFile;

/** 확인된 수치만 통과시킨다. 확인 전(todo)이면 undefined. */
function onlyOk<T extends { status: string }>(entry: T | undefined): T | undefined {
  return entry && entry.status === "ok" ? entry : undefined;
}

export function getCountry(code: CountryCode): CountryEntry | undefined {
  return countries.countries.find((c) => c.code === code);
}

/** 세계 백분위 계산에 쓸 성인 인구. 확인 안 된 나라는 빠진다. */
export function getAdultPopulation(code: CountryCode): number | undefined {
  const entry = onlyOk(getCountry(code)?.adultPopulation);
  return entry?.value ?? undefined;
}

/** 세계 관련 설명 문구와 상태. */
export function getWorldCoverage() {
  return countries.world;
}

/**
 * 세계 키·몸무게 분포 (NCD-RisC 국가별 자료).
 *
 * 중요: MVP 3개국(KR/US/JP)을 합쳐서 "세계"라고 부르지 않는다.
 * 이 자료가 준비되기 전에는 undefined 를 돌려주고, 화면에는
 * "세계 데이터 준비 중"이 뜬다.
 */
export function getWorldDistributionFile(
  metric: "height" | "weight",
): WorldDistributionFile | undefined {
  const file = metric === "height" ? worldHeightData : worldWeightData;
  return onlyOk(file);
}

/** 세계 분포를 인구 가중 혼합분포로 쓸 수 있게 성별로 추려낸다. */
export function getWorldComponents(
  metric: "height" | "weight",
  gender: Gender,
): { mean: number; sd: number; weight: number }[] | undefined {
  const file = getWorldDistributionFile(metric);
  if (!file) return undefined;

  const components = file.distributions
    .filter((row) => row.gender === gender)
    .flatMap((row) =>
      typeof row.mean === "number" &&
      typeof row.sd === "number" &&
      typeof row.adultPopulation === "number" &&
      row.sd > 0 &&
      row.adultPopulation > 0
        ? [{ mean: row.mean, sd: row.sd, weight: row.adultPopulation }]
        : [],
    );

  return components.length > 0 ? components : undefined;
}

/** 세계 소득 분포 (World Inequality Database). 금액은 PPP 기준 국제달러. */
export function getWorldIncome(): WorldIncomeFile | undefined {
  const file = onlyOk(worldIncomeData);
  return file && file.percentiles.length >= 2 ? file : undefined;
}

export function getDistributionFile(metric: "height" | "weight"): DistributionFile {
  return metric === "height" ? heightData : weightData;
}

/**
 * 키·몸무게 분포를 찾는다.
 * 요청한 연령대 자료가 없으면 성인 전체("19+")로 대신한다.
 */
export function getDistribution(
  metric: "height" | "weight",
  country: CountryCode,
  gender: Gender,
  ageGroup = "19+",
): Distribution | undefined {
  const { distributions } = getDistributionFile(metric);
  const exact = distributions.find(
    (d) => d.country === country && d.gender === gender && d.ageGroup === ageGroup,
  );
  const fallback =
    ageGroup === "19+"
      ? undefined
      : distributions.find(
          (d) => d.country === country && d.gender === gender && d.ageGroup === "19+",
        );
  return onlyOk(exact) ?? onlyOk(fallback);
}

export function getIncomeEntry(country: CountryCode): IncomeEntry | undefined {
  return onlyOk(incomeData.entries.find((e) => e.country === country));
}

export function getPppRate(currency: string): PppRate | undefined {
  return onlyOk(pppData.rates.find((r) => r.currency === currency));
}

/**
 * 어떤 나라들의 자료가 준비됐는지 알려준다.
 * "세계" 계산과 "데이터 준비 중" 표시를 판단할 때 쓴다.
 */
export function getReadyCountries(
  metric: "height" | "weight",
  gender: Gender,
): CountryCode[] {
  return countries.countries
    .map((c) => c.code)
    .filter(
      (code) =>
        getDistribution(metric, code, gender) !== undefined &&
        getAdultPopulation(code) !== undefined,
    );
}

/** 화면 하단 "데이터 출처"에 보여줄 목록을 모은다 (중복 제거). */
export function collectCitations(): {
  source: string;
  url: string;
  year: number;
  license: string | null;
}[] {
  const all = [
    ...countries.countries.map((c) => c.adultPopulation),
    ...heightData.distributions,
    ...weightData.distributions,
    ...incomeData.entries,
    ...pppData.rates,
    worldHeightData,
    worldWeightData,
    worldIncomeData,
  ];

  const map = new Map<string, { source: string; url: string; year: number; license: string | null }>();
  for (const entry of all) {
    if (entry.status !== "ok") continue;
    const { source, url, year, license } = entry.citation;
    if (!source || !url || typeof year !== "number") continue;
    map.set(`${source}|${url}|${year}`, { source, url, year, license: license ?? null });
  }
  return [...map.values()].sort((a, b) => a.source.localeCompare(b.source));
}

/** 아직 확인하지 못한 자료 목록. "데이터 출처" 페이지에 솔직하게 보여준다. */
export function collectPendingItems(): { where: string; todo: string }[] {
  const items: { where: string; todo: string }[] = [];

  const push = (where: string, entry: { status: string; todo: string | null }) => {
    if (entry.status !== "ok" && entry.todo) {
      items.push({ where, todo: entry.todo });
    }
  };

  for (const country of countries.countries) {
    push(`${country.code} · population`, country.adultPopulation);
  }
  for (const dist of heightData.distributions) {
    push(`${dist.country} · height · ${dist.gender}`, dist);
  }
  for (const dist of weightData.distributions) {
    push(`${dist.country} · weight · ${dist.gender}`, dist);
  }
  for (const entry of incomeData.entries) {
    push(`${entry.country} · income`, entry);
  }
  for (const rate of pppData.rates) {
    push(`${rate.currency} · PPP`, rate);
  }
  push("WORLD · height", worldHeightData);
  push("WORLD · weight", worldWeightData);
  push("WORLD · income", worldIncomeData);

  return items;
}
