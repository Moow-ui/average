/**
 * 정규분포 계산 (순수 함수).
 *
 * 키·몸무게는 "평균 주변에 종 모양으로 모여 있다"고 보고 계산한다.
 * 평균과 표준편차만 있으면 "내 값보다 작은 사람이 몇 %인지" 알 수 있다.
 */

/**
 * 오차함수 erf(x).
 * Abramowitz & Stegun 7.1.26 근사식 (오차 1.5e-7 이하).
 * 우리는 소수 첫째 자리까지만 쓰므로 충분히 정밀하다.
 */
export function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * ax);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);

  return sign * y;
}

/** 표준정규분포의 누적분포함수. z 보다 작을 확률(0~1). */
export function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/** 표준정규분포의 확률밀도. 분포 곡선을 그릴 때 쓴다. */
export function standardNormalPdf(z: number): number {
  return Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
}

/**
 * 표준정규분포의 역함수 (백분위 → z값).
 * Peter Acklam 근사식. 정규분포 곡선에 눈금을 찍을 때 쓴다.
 */
export function standardNormalQuantile(probability: number): number {
  if (probability <= 0 || probability >= 1) {
    throw new Error("확률은 0과 1 사이여야 합니다");
  }

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  if (probability < pLow) {
    const q = Math.sqrt(-2 * Math.log(probability));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
  if (probability > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - probability));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }

  const q = probability - 0.5;
  const r = q * q;
  return (
    ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
  );
}

export type NormalParams = { mean: number; sd: number };

/** 정규분포에서 값 x 보다 작을 확률(0~1). */
export function normalCdf(x: number, { mean, sd }: NormalParams): number {
  if (!(sd > 0)) throw new Error("표준편차는 0보다 커야 합니다");
  return standardNormalCdf((x - mean) / sd);
}

/** 정규분포의 확률밀도. 분포 곡선 그리기에 쓴다. */
export function normalPdf(x: number, { mean, sd }: NormalParams): number {
  if (!(sd > 0)) throw new Error("표준편차는 0보다 커야 합니다");
  return standardNormalPdf((x - mean) / sd) / sd;
}

/**
 * 하위 백분위(0~100). "나보다 작은 사람이 몇 %인가".
 * 평균을 넣으면 50 이 나온다.
 */
export function normalPercentile(x: number, params: NormalParams): number {
  return normalCdf(x, params) * 100;
}

/** 하위 백분위(0~100) 에 해당하는 값. 그래프 눈금용. */
export function normalValueAtPercentile(
  percentile: number,
  { mean, sd }: NormalParams,
): number {
  return mean + sd * standardNormalQuantile(percentile / 100);
}
