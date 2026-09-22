import { describe, expect, it } from "vitest";
import { mixtureCurve, normalCurve, positionRatio, toSvgPath } from "./chart";

describe("분포 곡선", () => {
  it("정규분포 곡선의 봉우리는 평균 근처다", () => {
    const data = normalCurve(172.5, 5.9);
    const top = data.points.reduce((a, b) => (b.y > a.y ? b : a));
    expect(top.x).toBeCloseTo(172.5, 0);
  });

  it("곡선은 평균 ±4 표준편차를 덮는다", () => {
    const data = normalCurve(172.5, 5.9);
    expect(data.min).toBeCloseTo(172.5 - 4 * 5.9, 6);
    expect(data.max).toBeCloseTo(172.5 + 4 * 5.9, 6);
  });

  it("혼합분포 곡선은 봉우리가 둘일 수 있다", () => {
    const data = mixtureCurve([
      { mean: 160, sd: 4, weight: 50 },
      { mean: 185, sd: 4, weight: 50 },
    ]);
    // 가운데(172.5)가 양쪽 봉우리보다 낮아야 한다.
    const at = (x: number) =>
      data.points.reduce((a, b) => (Math.abs(b.x - x) < Math.abs(a.x - x) ? b : a)).y;
    expect(at(172.5)).toBeLessThan(at(160));
    expect(at(172.5)).toBeLessThan(at(185));
  });

  it("SVG path 문자열이 만들어진다", () => {
    const path = toSvgPath(normalCurve(172.5, 5.9), 300, 100);
    expect(path.startsWith("M")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
  });

  it("위치 비율은 0~100 안에 들어온다", () => {
    const data = normalCurve(172.5, 5.9);
    expect(positionRatio(data, 172.5)).toBeCloseTo(50, 0);
    expect(positionRatio(data, 0)).toBe(0);
    expect(positionRatio(data, 999)).toBe(100);
  });
});
