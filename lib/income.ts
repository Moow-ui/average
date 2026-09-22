/**
 * 소득 백분위 계산.
 *
 * 소득은 키·몸무게와 달리 한쪽으로 길게 늘어진 모양이라 정규분포가 맞지 않다.
 * 그래서 두 가지 방법을 쓴다.
 *   1순위: 실제 백분위 표가 있으면 그 표를 보간한다 (가장 정확)
 *   2순위: 표가 없으면 로그정규분포로 어림한다
 */
import { standardNormalCdf, standardNormalQuantile } from "./stats";
import type { PercentilePoint } from "./data-types";

export type IncomePercentileResult = {
  /** 하위 백분위(0~100). */
  percentile: number;
  /**
   * 어떻게 구했는지.
   * - "table": 표 안쪽이라 보간함 (가장 믿을 만함)
   * - "paretoTail": 표보다 높은 소득이라 상위 꼬리를 늘려 추정함
   * - "belowTable": 표보다 낮은 소득이라 표의 맨 아래로 묶음
   * - "lognormal": 표가 없어 로그정규분포로 어림함
   */
  method: "table" | "paretoTail" | "belowTable" | "lognormal";
};

/** 표를 p 오름차순으로 정리하고, 0 이하 금액은 계산에서 뺀다. */
function normalize(points: PercentilePoint[]): PercentilePoint[] {
  return points
    .filter((point) => point.value > 0 && point.p > 0 && point.p < 100)
    .slice()
    .sort((a, b) => a.p - b.p);
}

/**
 * 백분위 표를 보간해서 소득의 백분위를 구한다.
 *
 * 소득은 금액 자체보다 "몇 배 차이"가 자연스러우므로 로그 값으로 보간한다.
 * (예: 2천만원과 4천만원 사이의 가운데는 3천만원이 아니라 약 2천8백만원)
 */
export function percentileFromTable(
  income: number,
  points: PercentilePoint[],
): IncomePercentileResult | undefined {
  const table = normalize(points);
  if (table.length < 2 || !(income > 0)) return undefined;

  const first = table[0];
  const last = table[table.length - 1];

  if (income <= first.value) {
    return { percentile: first.p, method: "belowTable" };
  }

  // 표 안쪽: 로그 금액 기준 선형 보간
  for (let i = 0; i < table.length - 1; i += 1) {
    const lower = table[i];
    const upper = table[i + 1];
    if (income <= upper.value) {
      const ratio =
        (Math.log(income) - Math.log(lower.value)) /
        (Math.log(upper.value) - Math.log(lower.value));
      return {
        percentile: lower.p + ratio * (upper.p - lower.p),
        method: "table",
      };
    }
  }

  // 표보다 높은 소득: 파레토 분포로 상위 꼬리를 늘린다.
  // 고소득 구간이 "몇 배 오르면 인원이 몇 분의 일로 준다" 형태를 따른다는 성질을 쓴다.
  const secondLast = table[table.length - 2];
  const survivalLast = 1 - last.p / 100;
  const survivalSecondLast = 1 - secondLast.p / 100;

  if (survivalLast > 0 && survivalSecondLast > survivalLast) {
    const alpha =
      Math.log(survivalSecondLast / survivalLast) /
      Math.log(last.value / secondLast.value);
    if (alpha > 0 && Number.isFinite(alpha)) {
      const survival = survivalLast * Math.pow(income / last.value, -alpha);
      return {
        percentile: Math.min(99.999, (1 - survival) * 100),
        method: "paretoTail",
      };
    }
  }

  return { percentile: last.p, method: "paretoTail" };
}

export type LognormalParams = { meanLog: number; sdLog: number };

/** 로그정규분포로 소득 백분위를 어림한다 (표가 없을 때). */
export function percentileFromLognormal(
  income: number,
  { meanLog, sdLog }: LognormalParams,
): IncomePercentileResult | undefined {
  if (!(income > 0) || !(sdLog > 0)) return undefined;
  const z = (Math.log(income) - meanLog) / sdLog;
  return { percentile: standardNormalCdf(z) * 100, method: "lognormal" };
}

/**
 * 소득 백분위를 구한다. 표가 있으면 표를, 없으면 로그정규분포를 쓴다.
 * 둘 다 없으면 undefined (화면에는 "데이터 준비 중").
 */
export function incomePercentile(
  income: number,
  source: {
    percentiles?: PercentilePoint[];
    lognormal?: { meanLog: number | null; sdLog: number | null };
  },
): IncomePercentileResult | undefined {
  const fromTable = source.percentiles
    ? percentileFromTable(income, source.percentiles)
    : undefined;
  if (fromTable) return fromTable;

  const { meanLog, sdLog } = source.lognormal ?? {};
  if (typeof meanLog === "number" && typeof sdLog === "number") {
    return percentileFromLognormal(income, { meanLog, sdLog });
  }
  return undefined;
}

/** 백분위에 해당하는 소득 금액. 비교표와 그래프 눈금에 쓴다. */
export function incomeAtPercentile(
  percentile: number,
  source: {
    percentiles?: PercentilePoint[];
    lognormal?: { meanLog: number | null; sdLog: number | null };
  },
): number | undefined {
  const table = normalize(source.percentiles ?? []);
  if (table.length >= 2 && percentile >= table[0].p && percentile <= table[table.length - 1].p) {
    for (let i = 0; i < table.length - 1; i += 1) {
      const lower = table[i];
      const upper = table[i + 1];
      if (percentile <= upper.p) {
        const ratio = (percentile - lower.p) / (upper.p - lower.p);
        return Math.exp(
          Math.log(lower.value) +
            ratio * (Math.log(upper.value) - Math.log(lower.value)),
        );
      }
    }
  }

  const { meanLog, sdLog } = source.lognormal ?? {};
  if (typeof meanLog === "number" && typeof sdLog === "number" && sdLog > 0) {
    return Math.exp(meanLog + sdLog * standardNormalQuantile(percentile / 100));
  }
  return undefined;
}
