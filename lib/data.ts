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
} from "./data-types";

export const countries = countriesJson as CountriesFile;
export const heightData = heightJson as DistributionFile;
export const weightData = weightJson as DistributionFile;
export const incomeData = incomeJson as IncomeFile;
export const pppData = pppJson as PppFile;

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

/**
 * "세계" 계산이 지금 몇 개 나라를 덮는지 알려준다.
 * coverageStatus 가 "partial" 이면 화면에 '몇 개국 기준'인지 밝혀야 한다.
 */
export function getWorldCoverage() {
  return countries.world;
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
