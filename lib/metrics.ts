/**
 * 항목별 설정 한 곳에 모음.
 * 입력 가능한 범위와, 결과 페이지를 몇 개나 미리 만들지 정한다.
 */
export const metricIds = ["height", "weight", "income"] as const;
export type MetricId = (typeof metricIds)[number];

export type MetricConfig = {
  id: MetricId;
  /** 키·몸무게는 "body"(정규분포), 소득은 "income"(백분위 표). */
  kind: "body" | "income";
  /** 사용자가 넣을 수 있는 범위 (기본 단위 기준: cm, kg, 현지 통화). */
  inputRange: { min: number; max: number };
  /**
   * 결과 페이지를 미리 만들 범위.
   * 현실적인 구간만 만든다. 무작정 늘리지 않는다.
   */
  staticRange?: { min: number; max: number; step: number };
};

export const metricConfigs: Record<MetricId, MetricConfig> = {
  height: {
    id: "height",
    kind: "body",
    inputRange: { min: 120, max: 230 },
    staticRange: { min: 150, max: 200, step: 1 },
  },
  weight: {
    id: "weight",
    kind: "body",
    inputRange: { min: 25, max: 250 },
    staticRange: { min: 40, max: 120, step: 1 },
  },
  income: {
    id: "income",
    kind: "income",
    inputRange: { min: 0, max: 100_000_000_000 },
    // 소득 결과 페이지는 만들지 않는다.
    // 주소에 통화가 드러나지 않아 /ko/income/all/4000 이 4천만원인지 4천원인지
    // 알 수 없고, 통화를 넣으면 주소가 복잡해진다. 자료가 갖춰진 뒤 다시 본다.
  },
};

export function isMetricId(value: string): value is MetricId {
  return (metricIds as readonly string[]).includes(value);
}

/** 결과 페이지를 만들 값 목록. */
export function staticValuesFor(metric: MetricId): number[] {
  const range = metricConfigs[metric].staticRange;
  if (!range) return [];
  const values: number[] = [];
  for (let v = range.min; v <= range.max; v += range.step) {
    values.push(v);
  }
  return values;
}

/** 결과 페이지에서 "가까운 값" 링크로 보여줄 값들. */
export function neighborValuesFor(metric: MetricId, value: number): number[] {
  const range = metricConfigs[metric].staticRange;
  if (!range) return [];
  const candidates = [value - 5, value - 1, value + 1, value + 5];
  return candidates.filter(
    (v) => v >= range.min && v <= range.max && v !== value,
  );
}
