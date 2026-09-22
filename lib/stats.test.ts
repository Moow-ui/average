import { describe, expect, it } from "vitest";
import {
  erf,
  normalCdf,
  normalPercentile,
  normalValueAtPercentile,
  standardNormalCdf,
  standardNormalQuantile,
} from "./stats";

describe("erf", () => {
  it("알려진 값과 맞는다", () => {
    expect(erf(0)).toBeCloseTo(0, 6);
    expect(erf(1)).toBeCloseTo(0.842700793, 6);
    expect(erf(-1)).toBeCloseTo(-0.842700793, 6);
    expect(erf(2)).toBeCloseTo(0.995322265, 6);
  });
});

describe("표준정규분포", () => {
  it("0 에서 절반이다", () => {
    // 근사식이라 소수점 아래 아주 멀리서는 미세한 오차가 있다.
    // 우리는 소수 첫째 자리까지만 쓰므로 문제가 되지 않는다.
    expect(standardNormalCdf(0)).toBeCloseTo(0.5, 8);
  });

  it("1·2·3 시그마 값이 교과서와 맞는다", () => {
    expect(standardNormalCdf(1)).toBeCloseTo(0.8413447, 6);
    expect(standardNormalCdf(2)).toBeCloseTo(0.9772499, 6);
    expect(standardNormalCdf(3)).toBeCloseTo(0.9986501, 6);
  });

  it("좌우 대칭이다", () => {
    for (const z of [0.3, 1.1, 2.4]) {
      expect(standardNormalCdf(-z)).toBeCloseTo(1 - standardNormalCdf(z), 8);
    }
  });
});

describe("standardNormalQuantile (역함수)", () => {
  it("교과서 값과 맞는다", () => {
    expect(standardNormalQuantile(0.5)).toBeCloseTo(0, 6);
    expect(standardNormalQuantile(0.975)).toBeCloseTo(1.959964, 4);
    expect(standardNormalQuantile(0.025)).toBeCloseTo(-1.959964, 4);
  });

  it("CDF 와 서로 되돌린다", () => {
    for (const p of [0.001, 0.05, 0.25, 0.5, 0.75, 0.95, 0.999]) {
      expect(standardNormalCdf(standardNormalQuantile(p))).toBeCloseTo(p, 5);
    }
  });

  it("0 이나 1 을 넣으면 에러", () => {
    expect(() => standardNormalQuantile(0)).toThrow();
    expect(() => standardNormalQuantile(1)).toThrow();
  });
});

describe("normalPercentile", () => {
  const 한국남성키 = { mean: 172.5, sd: 5.9 };

  it("평균을 넣으면 약 50% 가 나온다", () => {
    expect(normalPercentile(172.5, 한국남성키)).toBeCloseTo(50, 6);
  });

  it("평균보다 크면 50% 보다 높다", () => {
    expect(normalPercentile(180, 한국남성키)).toBeGreaterThan(50);
  });

  it("평균보다 작으면 50% 보다 낮다", () => {
    expect(normalPercentile(165, 한국남성키)).toBeLessThan(50);
  });

  it("표준편차 1개만큼 크면 약 84% 다", () => {
    expect(normalPercentile(172.5 + 5.9, 한국남성키)).toBeCloseTo(84.13, 1);
  });

  it("표준편차가 0 이면 에러", () => {
    expect(() => normalCdf(170, { mean: 170, sd: 0 })).toThrow();
  });
});

describe("normalValueAtPercentile", () => {
  it("백분위 계산과 서로 되돌린다", () => {
    const params = { mean: 172.5, sd: 5.9 };
    for (const p of [1, 10, 50, 90, 99]) {
      const value = normalValueAtPercentile(p, params);
      expect(normalPercentile(value, params)).toBeCloseTo(p, 3);
    }
  });
});
