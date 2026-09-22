import { describe, expect, it } from "vitest";
import {
  mixtureCdf,
  mixtureMean,
  mixturePercentile,
  mixtureValueAtPercentile,
  type MixtureComponent,
} from "./mixture";
import { normalPercentile } from "./stats";

describe("mixture", () => {
  it("나라가 하나뿐이면 그냥 정규분포와 같다", () => {
    const one: MixtureComponent[] = [{ mean: 172.5, sd: 5.9, weight: 1000 }];
    for (const x of [160, 170, 172.5, 185]) {
      expect(mixturePercentile(x, one)).toBeCloseTo(
        normalPercentile(x, { mean: 172.5, sd: 5.9 }),
        8,
      );
    }
  });

  it("가중치 크기 자체는 결과를 바꾸지 않는다 (비율만 중요)", () => {
    const small: MixtureComponent[] = [
      { mean: 170, sd: 6, weight: 1 },
      { mean: 160, sd: 6, weight: 3 },
    ];
    const big: MixtureComponent[] = [
      { mean: 170, sd: 6, weight: 1_000_000 },
      { mean: 160, sd: 6, weight: 3_000_000 },
    ];
    expect(mixturePercentile(165, small)).toBeCloseTo(
      mixturePercentile(165, big),
      10,
    );
  });

  it("인구가 많은 쪽으로 결과가 끌려간다", () => {
    const 큰나라가큼: MixtureComponent[] = [
      { mean: 180, sd: 6, weight: 90 },
      { mean: 160, sd: 6, weight: 10 },
    ];
    const 큰나라가작음: MixtureComponent[] = [
      { mean: 180, sd: 6, weight: 10 },
      { mean: 160, sd: 6, weight: 90 },
    ];
    // 키 큰 나라 인구가 많으면, 같은 170cm 라도 상대적으로 덜 크다.
    expect(mixturePercentile(170, 큰나라가큼)).toBeLessThan(
      mixturePercentile(170, 큰나라가작음),
    );
  });

  it("세계 평균 하나로 뭉뚱그린 것과 결과가 다르다", () => {
    const components: MixtureComponent[] = [
      { mean: 180, sd: 5, weight: 50 },
      { mean: 160, sd: 5, weight: 50 },
    ];
    const 뭉뚱그린평균 = mixtureMean(components); // 170
    expect(뭉뚱그린평균).toBeCloseTo(170, 10);

    // 같은 170cm 인데, 혼합분포와 "평균 170·표준편차 5" 는 다른 답을 준다.
    const 혼합 = mixturePercentile(170, components);
    const 뭉뚱그림 = normalPercentile(170, { mean: 170, sd: 5 });
    expect(혼합).toBeCloseTo(50, 6); // 대칭이라 50%
    expect(뭉뚱그림).toBeCloseTo(50, 6);

    // 175cm 에서는 확실히 갈린다.
    expect(Math.abs(mixturePercentile(175, components) -
      normalPercentile(175, { mean: 170, sd: 5 }))).toBeGreaterThan(5);
  });

  it("누적확률은 0과 1 사이이고 값이 커지면 같이 커진다", () => {
    const components: MixtureComponent[] = [
      { mean: 175, sd: 7, weight: 30 },
      { mean: 163, sd: 6, weight: 70 },
    ];
    let previous = -1;
    for (const x of [140, 150, 160, 170, 180, 190, 200]) {
      const cdf = mixtureCdf(x, components);
      expect(cdf).toBeGreaterThanOrEqual(0);
      expect(cdf).toBeLessThanOrEqual(1);
      expect(cdf).toBeGreaterThan(previous);
      previous = cdf;
    }
  });

  it("백분위 → 값 → 백분위로 되돌아온다", () => {
    const components: MixtureComponent[] = [
      { mean: 175, sd: 7, weight: 30 },
      { mean: 163, sd: 6, weight: 70 },
    ];
    for (const p of [1, 25, 50, 75, 99]) {
      const value = mixtureValueAtPercentile(p, components);
      expect(mixturePercentile(value, components)).toBeCloseTo(p, 4);
    }
  });

  it("합칠 분포가 없으면 에러", () => {
    expect(() => mixturePercentile(170, [])).toThrow();
  });
});
