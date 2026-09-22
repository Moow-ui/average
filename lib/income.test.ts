import { describe, expect, it } from "vitest";
import {
  incomeAtPercentile,
  incomePercentile,
  percentileFromLognormal,
  percentileFromTable,
} from "./income";

/** 설명용 가상의 표. 실제 수치가 아니다. */
const 표 = [
  { p: 10, value: 10_000_000 },
  { p: 25, value: 20_000_000 },
  { p: 50, value: 35_000_000 },
  { p: 75, value: 60_000_000 },
  { p: 90, value: 95_000_000 },
  { p: 99, value: 250_000_000 },
];

describe("percentileFromTable", () => {
  it("표에 있는 값을 넣으면 그 백분위가 그대로 나온다", () => {
    for (const point of 표) {
      const result = percentileFromTable(point.value, 표);
      expect(result?.percentile).toBeCloseTo(point.p, 6);
    }
  });

  it("중간값은 두 점 사이에 들어간다", () => {
    const result = percentileFromTable(27_000_000, 표);
    expect(result?.method).toBe("table");
    expect(result!.percentile).toBeGreaterThan(25);
    expect(result!.percentile).toBeLessThan(50);
  });

  it("소득이 오르면 백분위도 오른다", () => {
    let previous = -1;
    for (const income of [5_000_000, 15_000_000, 35_000_000, 80_000_000, 500_000_000]) {
      const result = percentileFromTable(income, 표);
      expect(result!.percentile).toBeGreaterThanOrEqual(previous);
      previous = result!.percentile;
    }
  });

  it("표보다 높은 소득은 상위 꼬리로 추정한다", () => {
    const result = percentileFromTable(1_000_000_000, 표);
    expect(result?.method).toBe("paretoTail");
    expect(result!.percentile).toBeGreaterThan(99);
    expect(result!.percentile).toBeLessThan(100);
  });

  it("표보다 낮은 소득은 표의 맨 아래로 묶는다", () => {
    const result = percentileFromTable(1_000_000, 표);
    expect(result?.method).toBe("belowTable");
    expect(result!.percentile).toBe(10);
  });

  it("표가 부족하거나 소득이 0 이하면 계산하지 않는다", () => {
    expect(percentileFromTable(30_000_000, [{ p: 50, value: 1 }])).toBeUndefined();
    expect(percentileFromTable(0, 표)).toBeUndefined();
    expect(percentileFromTable(-100, 표)).toBeUndefined();
  });
});

describe("percentileFromLognormal", () => {
  it("중앙값을 넣으면 약 50% 가 나온다", () => {
    const meanLog = Math.log(35_000_000);
    const result = percentileFromLognormal(35_000_000, { meanLog, sdLog: 0.8 });
    expect(result?.percentile).toBeCloseTo(50, 6);
  });

  it("중앙값보다 높으면 50% 보다 높다", () => {
    const meanLog = Math.log(35_000_000);
    const result = percentileFromLognormal(70_000_000, { meanLog, sdLog: 0.8 });
    expect(result!.percentile).toBeGreaterThan(50);
  });

  it("소득이 0 이하거나 sdLog 가 0 이면 계산하지 않는다", () => {
    expect(percentileFromLognormal(0, { meanLog: 17, sdLog: 0.8 })).toBeUndefined();
    expect(percentileFromLognormal(100, { meanLog: 17, sdLog: 0 })).toBeUndefined();
  });
});

describe("incomePercentile", () => {
  it("표가 있으면 표를 먼저 쓴다", () => {
    const result = incomePercentile(35_000_000, {
      percentiles: 표,
      lognormal: { meanLog: 1, sdLog: 1 },
    });
    expect(result?.method).toBe("table");
  });

  it("표가 없으면 로그정규분포로 넘어간다", () => {
    const result = incomePercentile(35_000_000, {
      percentiles: [],
      lognormal: { meanLog: Math.log(35_000_000), sdLog: 0.8 },
    });
    expect(result?.method).toBe("lognormal");
    expect(result!.percentile).toBeCloseTo(50, 6);
  });

  it("둘 다 없으면 계산하지 않는다 (데이터 준비 중)", () => {
    expect(
      incomePercentile(35_000_000, {
        percentiles: [],
        lognormal: { meanLog: null, sdLog: null },
      }),
    ).toBeUndefined();
  });
});

describe("incomeAtPercentile", () => {
  it("백분위 → 금액 → 백분위로 되돌아온다", () => {
    for (const p of [25, 50, 75, 90]) {
      const value = incomeAtPercentile(p, { percentiles: 표 })!;
      expect(incomePercentile(value, { percentiles: 표 })!.percentile).toBeCloseTo(p, 4);
    }
  });

  it("표 밖이면 로그정규분포로 넘어가고, 그것도 없으면 계산하지 않는다", () => {
    expect(incomeAtPercentile(99.9, { percentiles: 표 })).toBeUndefined();
  });
});
