/**
 * 화면에 보여줄 숫자 표기.
 *
 * 문장은 /messages 에 있고, 여기서는 숫자만 다듬는다.
 */
import type { Locale } from "./i18n";
import { intlLocale } from "./i18n";
import type { LengthUnit, MassUnit } from "./data-types";
import { cmToFeetInches, kgToLb, wonToManwon } from "./units";

/** 상위 몇 %인지를 어떻게 보여줄지 정한 결과. */
export type TopPercentDisplay =
  /** "상위 12.3%" 처럼 숫자로 보여준다. */
  | { kind: "exact"; topPercent: number }
  /** 너무 위쪽이라 "상위 0.1% 미만" 으로 보여준다. */
  | { kind: "topExtreme"; threshold: number }
  /** 너무 아래쪽이라 "하위 0.1% 미만" 으로 보여준다. */
  | { kind: "bottomExtreme"; threshold: number };

/** 소수 첫째 자리까지만 쓴다. */
export const PERCENT_DECIMALS = 1;
/** 이보다 극단이면 숫자 대신 "미만" 표기를 쓴다. */
export const EXTREME_THRESHOLD = 0.1;

/**
 * 하위 백분위(0~100)를 "상위 몇 %" 표기로 바꾼다.
 * 평균(50)을 넣으면 상위 50.0% 가 된다.
 */
export function describeTopPercent(lowerPercentile: number): TopPercentDisplay {
  const clamped = Math.min(100, Math.max(0, lowerPercentile));
  const topPercent = 100 - clamped;
  const rounded =
    Math.round(topPercent * 10 ** PERCENT_DECIMALS) / 10 ** PERCENT_DECIMALS;

  if (rounded < EXTREME_THRESHOLD) {
    return { kind: "topExtreme", threshold: EXTREME_THRESHOLD };
  }
  if (rounded > 100 - EXTREME_THRESHOLD) {
    return { kind: "bottomExtreme", threshold: EXTREME_THRESHOLD };
  }
  return { kind: "exact", topPercent: rounded };
}

/** 일반 숫자. 언어마다 자릿수 구분 기호가 다르므로 Intl 에 맡긴다. */
export function formatNumber(
  value: number,
  locale: Locale,
  options: Intl.NumberFormatOptions = {},
): string {
  return new Intl.NumberFormat(intlLocale[locale], options).format(value);
}

/** 백분율 숫자 부분 (예: "12.3"). % 기호와 문장은 messages 에서 붙인다. */
export function formatPercentValue(value: number, locale: Locale): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: PERCENT_DECIMALS,
    maximumFractionDigits: PERCENT_DECIMALS,
  });
}

/** 키 표기. cm 는 "172.5 cm", 미국 단위는 5' 10.9" 형태. */
export function formatHeight(
  cm: number,
  unit: LengthUnit,
  locale: Locale,
): string {
  if (unit === "cm") {
    return `${formatNumber(cm, locale, { maximumFractionDigits: 1 })} cm`;
  }
  const { feet, inches } = cmToFeetInches(cm);
  const inchText = formatNumber(inches, locale, { maximumFractionDigits: 1 });
  return `${feet}′ ${inchText}″`;
}

/** 몸무게 표기. "70.5 kg" 또는 "155.4 lb". */
export function formatWeight(
  kg: number,
  unit: MassUnit,
  locale: Locale,
): string {
  const value = unit === "kg" ? kg : kgToLb(kg);
  const suffix = unit === "kg" ? "kg" : "lb";
  return `${formatNumber(value, locale, { maximumFractionDigits: 1 })} ${suffix}`;
}

/** BMI 표기. 소수 첫째 자리까지. */
export function formatBmi(bmi: number, locale: Locale): string {
  return formatNumber(bmi, locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/**
 * 소득 표기.
 * 한국어 화면에서 원화는 "3,500만원" 처럼 만원 단위로 보여주는 게 자연스럽다.
 */
export function formatIncome(
  amount: number,
  currency: string,
  locale: Locale,
): string {
  if (locale === "ko" && currency === "KRW") {
    const manwon = Math.round(wonToManwon(amount));
    return `${formatNumber(manwon, locale, { maximumFractionDigits: 0 })}만원`;
  }
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** 평균과의 차이. 항상 부호를 붙인다 (예: "+7.5", "-2.0"). */
export function formatSignedDifference(
  difference: number,
  locale: Locale,
  maximumFractionDigits = 1,
): string {
  return formatNumber(difference, locale, {
    maximumFractionDigits,
    signDisplay: "exceptZero",
  });
}

/**
 * "상위 12.3%" 같은 최종 문장을 만든다.
 * 극단값은 "상위 0.1% 미만" 으로 바꿔서 과장되게 보이지 않게 한다.
 */
export function topPercentText(
  lowerPercentile: number,
  t: (key: string, params?: Record<string, string | number>) => string,
  locale: Locale,
): string {
  const display = describeTopPercent(lowerPercentile);
  switch (display.kind) {
    case "exact":
      return t("result.topPercent", {
        percent: formatPercentValue(display.topPercent, locale),
      });
    case "topExtreme":
      return t("result.topExtreme", {
        threshold: formatNumber(display.threshold, locale, {
          maximumFractionDigits: 1,
        }),
      });
    case "bottomExtreme":
      return t("result.bottomExtreme", {
        threshold: formatNumber(display.threshold, locale, {
          maximumFractionDigits: 1,
        }),
      });
  }
}

/**
 * 백분위가 어느 구간인지 골라 해설 문구 키를 돌려준다.
 * 평가하거나 놀리는 표현을 쓰지 않도록 문구는 /messages 에서 관리한다.
 */
export function explanationKey(lowerPercentile: number): string {
  const topPercent = 100 - lowerPercentile;
  if (topPercent <= 5) return "explain.veryHigh";
  if (topPercent <= 25) return "explain.high";
  if (topPercent < 75) return "explain.middle";
  if (topPercent < 95) return "explain.low";
  return "explain.veryLow";
}
