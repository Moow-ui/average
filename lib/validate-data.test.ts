import { describe, expect, it } from "vitest";
import {
  validateAll,
  validateDistributions,
  validateIncome,
} from "./validate-data";
import { countries, heightData, incomeData, pppData, weightData } from "./data";
import type { Distribution, DistributionFile, IncomeFile } from "./data-types";

describe("실제 /data 파일", () => {
  it("검사를 통과한다 (출처 없는 수치가 없다)", () => {
    const problems = validateAll({
      countries,
      height: heightData,
      weight: weightData,
      income: incomeData,
      ppp: pppData,
    });
    expect(problems).toEqual([]);
  });
});

/** 검사가 실제로 잘못된 데이터를 잡아내는지 확인한다. */
describe("잘못된 데이터 잡아내기", () => {
  const baseCitation = {
    source: null,
    url: null,
    year: null,
    license: null,
  };

  function heightFile(overrides: Partial<Distribution>) {
    const base: Distribution = {
      country: "KR" as const,
      gender: "male" as const,
      ageGroup: "19+",
      mean: null,
      sd: null,
      sampleSize: null,
      status: "todo" as const,
      todo: "확인 필요",
      citation: baseCitation,
    };
    const rows = (["KR", "US", "JP"] as const).flatMap((country) =>
      (["male", "female"] as const).map((gender) => ({ ...base, country, gender })),
    );
    rows[0] = { ...rows[0], ...overrides };
    return {
      version: 1,
      metric: "height",
      unit: "cm",
      updatedAt: "2026-09-22",
      distributions: rows,
    } as DistributionFile;
  }

  it("출처 없이 status를 ok로 두면 걸린다", () => {
    const problems = validateDistributions(
      heightFile({ mean: 172, sd: 6, status: "ok", todo: null }),
    );
    const messages = problems.map((p) => p.message);
    expect(messages).toContain("citation.source 가 없습니다");
    expect(messages).toContain("citation.url 이 없습니다");
    expect(messages).toContain("citation.year 가 없습니다");
  });

  it("출처는 있는데 숫자가 비어 있으면 걸린다", () => {
    const problems = validateDistributions(
      heightFile({
        status: "ok",
        todo: null,
        citation: { source: "기관", url: "https://example.org", year: 2022, license: null },
      }),
    );
    const messages = problems.map((p) => p.message);
    expect(messages).toContain('status 가 "ok" 인데 mean 값이 비어 있습니다');
    expect(messages).toContain('status 가 "ok" 인데 sd 값이 비어 있습니다');
  });

  it("todo 인데 메모가 없으면 걸린다", () => {
    const problems = validateDistributions(heightFile({ todo: "" }));
    expect(problems.map((p) => p.message)).toContain(
      'status 가 "todo" 인데 무엇을 확인해야 하는지 todo 메모가 없습니다',
    );
  });

  it("표준편차가 0 이하면 걸린다", () => {
    const problems = validateDistributions(heightFile({ mean: 172, sd: 0 }));
    expect(problems.map((p) => p.message)).toContain("표준편차(sd)는 0보다 커야 합니다");
  });

  it("소득 백분위가 커지는 순서가 아니면 걸린다", () => {
    const file = {
      version: 1,
      definition: "personal_pretax_annual",
      definitionNote: "",
      updatedAt: "2026-09-22",
      entries: (["KR", "US", "JP"] as const).map((country) => ({
        country,
        currency: "KRW",
        incomeYear: null,
        percentiles:
          country === "KR"
            ? [
                { p: 50, value: 30000000 },
                { p: 90, value: 20000000 },
              ]
            : [],
        lognormal: { meanLog: null, sdLog: null },
        status: "todo" as const,
        todo: "확인 필요",
        citation: baseCitation,
      })),
    } as IncomeFile;
    expect(validateIncome(file).map((p) => p.message)).toContain(
      "백분위가 올라가는데 소득이 늘지 않습니다 (p90)",
    );
  });
});
