/**
 * 분포 곡선을 그리기 위한 점 목록을 만든다.
 * 그림은 SVG 로 직접 그린다 (차트 라이브러리를 쓰지 않아 페이지가 가볍다).
 */
import { mixturePdf, type MixtureComponent } from "./mixture";
import { normalPdf } from "./stats";

export type CurvePoint = { x: number; y: number };

export type ChartData = {
  points: CurvePoint[];
  min: number;
  max: number;
  /** 곡선 높이의 최댓값. 세로 크기를 맞출 때 쓴다. */
  peak: number;
};

const STEPS = 120;

function build(
  min: number,
  max: number,
  density: (x: number) => number,
): ChartData {
  const points: CurvePoint[] = [];
  let peak = 0;
  for (let i = 0; i <= STEPS; i += 1) {
    const x = min + ((max - min) * i) / STEPS;
    const y = density(x);
    if (y > peak) peak = y;
    points.push({ x, y });
  }
  return { points, min, max, peak: peak || 1 };
}

/** 정규분포 곡선. 평균 ±4 표준편차 구간을 그린다. */
export function normalCurve(mean: number, sd: number): ChartData {
  return build(mean - 4 * sd, mean + 4 * sd, (x) => normalPdf(x, { mean, sd }));
}

/** 혼합분포 곡선 (세계). 봉우리가 여러 개일 수 있다. */
export function mixtureCurve(components: MixtureComponent[]): ChartData {
  const means = components.map((c) => c.mean);
  const maxSd = Math.max(...components.map((c) => c.sd));
  const min = Math.min(...means) - 4 * maxSd;
  const max = Math.max(...means) + 4 * maxSd;
  return build(min, max, (x) => mixturePdf(x, components));
}

/** 곡선 점들을 SVG path 문자열로 바꾼다. */
export function toSvgPath(
  data: ChartData,
  width: number,
  height: number,
): string {
  const { points, min, max, peak } = data;
  const scaleX = (x: number) => ((x - min) / (max - min)) * width;
  const scaleY = (y: number) => height - (y / peak) * height;

  const line = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"}${scaleX(point.x).toFixed(2)},${scaleY(point.y).toFixed(2)}`,
    )
    .join(" ");

  // 아래쪽을 막아 색을 채울 수 있게 한다.
  return `${line} L${width},${height} L0,${height} Z`;
}

/** 값이 가로축에서 몇 % 위치인지 (0~100). 범위를 벗어나면 끝에 붙인다. */
export function positionRatio(data: ChartData, value: number): number {
  const ratio = (value - data.min) / (data.max - data.min);
  return Math.min(1, Math.max(0, ratio)) * 100;
}
