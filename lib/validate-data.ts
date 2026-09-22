/**
 * /data JSON 파일 검사 규칙.
 *
 * 핵심: "출처 없는 숫자"가 사이트에 들어가지 못하게 막는다.
 * - status "ok"  → 숫자와 source/url/year 가 모두 있어야 한다
 * - status "todo" → 무엇을 확인해야 하는지 todo 메모가 있어야 한다
 *
 * 이 함수는 순수 함수라서 테스트(lib/validate-data.test.ts)와
 * 빌드 전 검사(scripts/validate-data.ts) 양쪽에서 같이 쓴다.
 */
import type {
  Citation,
  CountriesFile,
  CountryCode,
  DataStatus,
  DistributionFile,
  IncomeFile,
  PppFile,
} from "./data-types";
import { countryCodes } from "./data-types";

export type Problem = { where: string; message: string };

type SourcedLike = {
  status: DataStatus;
  todo: string | null;
  citation: Citation;
};

/**
 * status 와 출처, 그리고 "ok 라면 반드시 있어야 하는 숫자들"을 함께 검사한다.
 * requiredWhenOk: [필드이름, 값] 쌍의 목록.
 */
function checkSourced(
  where: string,
  entry: SourcedLike,
  requiredWhenOk: [string, number | null | undefined][],
  problems: Problem[],
): void {
  if (entry.status !== "ok" && entry.status !== "todo") {
    problems.push({
      where,
      message: `status 는 "ok" 또는 "todo" 여야 합니다 (지금: ${JSON.stringify(entry.status)})`,
    });
    return;
  }

  if (entry.status === "todo") {
    if (!entry.todo || entry.todo.trim() === "") {
      problems.push({
        where,
        message: 'status 가 "todo" 인데 무엇을 확인해야 하는지 todo 메모가 없습니다',
      });
    }
    return;
  }

  // 여기부터는 status === "ok"
  const { source, url, year } = entry.citation;
  if (!source) problems.push({ where, message: "citation.source 가 없습니다" });
  if (!url) problems.push({ where, message: "citation.url 이 없습니다" });
  if (typeof year !== "number") {
    problems.push({ where, message: "citation.year 가 없습니다" });
  }

  for (const [field, value] of requiredWhenOk) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      problems.push({
        where,
        message: `status 가 "ok" 인데 ${field} 값이 비어 있습니다`,
      });
    }
  }
}

function isKnownCountry(code: string): code is CountryCode {
  return (countryCodes as readonly string[]).includes(code);
}

export function validateCountries(file: CountriesFile): Problem[] {
  const problems: Problem[] = [];
  const seen = new Set<string>();

  for (const country of file.countries) {
    const where = `countries.json / ${country.code}`;
    if (!isKnownCountry(country.code)) {
      problems.push({ where, message: `알 수 없는 나라 코드입니다` });
    }
    if (seen.has(country.code)) {
      problems.push({ where, message: "같은 나라가 두 번 들어 있습니다" });
    }
    seen.add(country.code);

    checkSourced(
      `${where} / adultPopulation`,
      country.adultPopulation,
      [["value", country.adultPopulation.value]],
      problems,
    );

    const pop = country.adultPopulation.value;
    if (typeof pop === "number" && pop <= 0) {
      problems.push({ where, message: "성인 인구는 0보다 커야 합니다" });
    }
  }

  for (const code of countryCodes) {
    if (!seen.has(code)) {
      problems.push({
        where: "countries.json",
        message: `${code} 항목이 빠져 있습니다`,
      });
    }
  }

  return problems;
}

export function validateDistributions(file: DistributionFile): Problem[] {
  const problems: Problem[] = [];
  const fileName = `${file.metric}.json`;
  const seen = new Set<string>();

  for (const dist of file.distributions) {
    const where = `${fileName} / ${dist.country} ${dist.gender} ${dist.ageGroup}`;
    const key = `${dist.country}|${dist.gender}|${dist.ageGroup}`;

    if (!isKnownCountry(dist.country)) {
      problems.push({ where, message: "알 수 없는 나라 코드입니다" });
    }
    if (dist.gender !== "male" && dist.gender !== "female") {
      problems.push({ where, message: 'gender 는 "male" 또는 "female" 이어야 합니다' });
    }
    if (seen.has(key)) {
      problems.push({ where, message: "같은 조합이 두 번 들어 있습니다" });
    }
    seen.add(key);

    checkSourced(where, dist, [["mean", dist.mean], ["sd", dist.sd]], problems);

    if (typeof dist.mean === "number" && dist.mean <= 0) {
      problems.push({ where, message: "평균(mean)은 0보다 커야 합니다" });
    }
    if (typeof dist.sd === "number" && dist.sd <= 0) {
      problems.push({ where, message: "표준편차(sd)는 0보다 커야 합니다" });
    }
  }

  // 나라·성별마다 성인 전체("19+") 줄은 반드시 있어야 한다.
  for (const code of countryCodes) {
    for (const gender of ["male", "female"] as const) {
      if (!seen.has(`${code}|${gender}|19+`)) {
        problems.push({
          where: fileName,
          message: `${code} ${gender} 의 "19+" 줄이 빠져 있습니다`,
        });
      }
    }
  }

  return problems;
}

export function validateIncome(file: IncomeFile): Problem[] {
  const problems: Problem[] = [];
  const seen = new Set<string>();

  for (const entry of file.entries) {
    const where = `income.json / ${entry.country}`;
    if (!isKnownCountry(entry.country)) {
      problems.push({ where, message: "알 수 없는 나라 코드입니다" });
    }
    if (seen.has(entry.country)) {
      problems.push({ where, message: "같은 나라가 두 번 들어 있습니다" });
    }
    seen.add(entry.country);

    const hasTable = entry.percentiles.length >= 2;
    const hasLognormal =
      typeof entry.lognormal.meanLog === "number" &&
      typeof entry.lognormal.sdLog === "number";

    checkSourced(where, entry, [["incomeYear", entry.incomeYear]], problems);

    if (entry.status === "ok" && !hasTable && !hasLognormal) {
      problems.push({
        where,
        message:
          'status 가 "ok" 인데 백분위표(2개 이상)도 로그정규 파라미터도 없습니다',
      });
    }

    let previousP = -1;
    let previousValue = -Infinity;
    for (const point of entry.percentiles) {
      if (point.p <= 0 || point.p >= 100) {
        problems.push({ where, message: `백분위 p 는 0과 100 사이여야 합니다 (${point.p})` });
      }
      if (point.p <= previousP) {
        problems.push({ where, message: `백분위 p 가 커지는 순서가 아닙니다 (${point.p})` });
      }
      if (point.value <= previousValue) {
        problems.push({
          where,
          message: `백분위가 올라가는데 소득이 늘지 않습니다 (p${point.p})`,
        });
      }
      if (point.value < 0) {
        problems.push({ where, message: `소득 값이 음수입니다 (p${point.p})` });
      }
      previousP = point.p;
      previousValue = point.value;
    }

    if (typeof entry.lognormal.sdLog === "number" && entry.lognormal.sdLog <= 0) {
      problems.push({ where, message: "lognormal.sdLog 는 0보다 커야 합니다" });
    }
  }

  for (const code of countryCodes) {
    if (!seen.has(code)) {
      problems.push({ where: "income.json", message: `${code} 항목이 빠져 있습니다` });
    }
  }

  return problems;
}

export function validatePpp(file: PppFile, requiredCurrencies: string[]): Problem[] {
  const problems: Problem[] = [];
  const seen = new Set<string>();

  for (const rate of file.rates) {
    const where = `ppp.json / ${rate.currency}`;
    if (seen.has(rate.currency)) {
      problems.push({ where, message: "같은 통화가 두 번 들어 있습니다" });
    }
    seen.add(rate.currency);

    checkSourced(
      where,
      rate,
      [["pppConversionFactor", rate.pppConversionFactor]],
      problems,
    );

    if (
      typeof rate.pppConversionFactor === "number" &&
      rate.pppConversionFactor <= 0
    ) {
      problems.push({ where, message: "PPP 환산계수는 0보다 커야 합니다" });
    }
    if (typeof rate.marketRate === "number" && rate.marketRate <= 0) {
      problems.push({ where, message: "시장환율은 0보다 커야 합니다" });
    }
  }

  for (const currency of requiredCurrencies) {
    if (!seen.has(currency)) {
      problems.push({ where: "ppp.json", message: `${currency} 항목이 빠져 있습니다` });
    }
  }

  return problems;
}

export function validateAll(files: {
  countries: CountriesFile;
  height: DistributionFile;
  weight: DistributionFile;
  income: IncomeFile;
  ppp: PppFile;
}): Problem[] {
  const currencies = files.countries.countries.map((c) => c.currency);
  return [
    ...validateCountries(files.countries),
    ...validateDistributions(files.height),
    ...validateDistributions(files.weight),
    ...validateIncome(files.income),
    ...validatePpp(files.ppp, [files.ppp.baseCurrency, ...currencies]),
  ];
}
