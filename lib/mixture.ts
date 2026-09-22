/**
 * 혼합분포 계산.
 *
 * "세계 상위 몇 %"를 구할 때, 세계 평균 하나로 뭉뚱그리면 안 된다.
 * 나라마다 평균과 표준편차가 다르고 인구도 다르기 때문이다.
 * 그래서 나라별 정규분포를 인구로 가중해서 하나로 합친다.
 */
import { normalCdf, normalPdf } from "./stats";

/** 나라 하나의 분포. weight 는 그 나라 성인 인구. */
export type MixtureComponent = {
  mean: number;
  sd: number;
  weight: number;
};

function totalWeight(components: MixtureComponent[]): number {
  return components.reduce((sum, c) => sum + c.weight, 0);
}

function assertUsable(components: MixtureComponent[]): void {
  if (components.length === 0) {
    throw new Error("합칠 분포가 하나도 없습니다");
  }
  for (const c of components) {
    if (!(c.sd > 0)) throw new Error("표준편차는 0보다 커야 합니다");
    if (!(c.weight > 0)) throw new Error("인구 가중치는 0보다 커야 합니다");
  }
}

/** 혼합분포에서 값 x 보다 작을 확률(0~1). */
export function mixtureCdf(x: number, components: MixtureComponent[]): number {
  assertUsable(components);
  const total = totalWeight(components);
  const sum = components.reduce(
    (acc, c) => acc + c.weight * normalCdf(x, { mean: c.mean, sd: c.sd }),
    0,
  );
  return sum / total;
}

/** 혼합분포의 확률밀도. 분포 곡선 그리기에 쓴다. */
export function mixturePdf(x: number, components: MixtureComponent[]): number {
  assertUsable(components);
  const total = totalWeight(components);
  const sum = components.reduce(
    (acc, c) => acc + c.weight * normalPdf(x, { mean: c.mean, sd: c.sd }),
    0,
  );
  return sum / total;
}

/** 하위 백분위(0~100). "나보다 작은 사람이 몇 %인가". */
export function mixturePercentile(
  x: number,
  components: MixtureComponent[],
): number {
  return mixtureCdf(x, components) * 100;
}

/** 인구 가중 평균. 화면에 "세계 평균"을 보여줄 때 쓴다. */
export function mixtureMean(components: MixtureComponent[]): number {
  assertUsable(components);
  const total = totalWeight(components);
  return components.reduce((acc, c) => acc + c.weight * c.mean, 0) / total;
}

/**
 * 하위 백분위에 해당하는 값을 찾는다.
 * 혼합분포는 역함수 공식이 없어서 이분법으로 찾는다.
 */
export function mixtureValueAtPercentile(
  percentile: number,
  components: MixtureComponent[],
): number {
  assertUsable(components);
  if (percentile <= 0 || percentile >= 100) {
    throw new Error("백분위는 0과 100 사이여야 합니다");
  }
  const target = percentile / 100;

  // 넉넉한 범위에서 시작해 절반씩 좁혀 간다.
  const means = components.map((c) => c.mean);
  const maxSd = Math.max(...components.map((c) => c.sd));
  let low = Math.min(...means) - 10 * maxSd;
  let high = Math.max(...means) + 10 * maxSd;

  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    if (mixtureCdf(mid, components) < target) {
      low = mid;
    } else {
      high = mid;
    }
    if (high - low < 1e-9) break;
  }
  return (low + high) / 2;
}
