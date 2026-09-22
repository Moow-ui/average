import { describe, expect, it } from "vitest";
import { getTranslator } from "./i18n";
import {
  describeTopPercent,
  explanationKey,
  topPercentText,
  formatBmi,
  formatHeight,
  formatIncome,
  formatNumber,
  formatPercentValue,
  formatSignedDifference,
  formatWeight,
} from "./format";

describe("describeTopPercent", () => {
  it("평균(하위 50%)은 상위 50.0% 다", () => {
    expect(describeTopPercent(50)).toEqual({ kind: "exact", topPercent: 50 });
  });

  it("소수 첫째 자리까지 반올림한다", () => {
    expect(describeTopPercent(87.6543)).toEqual({ kind: "exact", topPercent: 12.3 });
  });

  it("너무 위쪽이면 '상위 0.1% 미만' 으로 바꾼다", () => {
    expect(describeTopPercent(99.99).kind).toBe("topExtreme");
    expect(describeTopPercent(100).kind).toBe("topExtreme");
  });

  it("너무 아래쪽이면 '하위 0.1% 미만' 으로 바꾼다", () => {
    expect(describeTopPercent(0.01).kind).toBe("bottomExtreme");
    expect(describeTopPercent(0).kind).toBe("bottomExtreme");
  });

  it("경계값 0.1% 는 아직 숫자로 보여준다", () => {
    expect(describeTopPercent(99.9)).toEqual({ kind: "exact", topPercent: 0.1 });
  });

  it("범위를 벗어난 값도 에러 없이 처리한다", () => {
    expect(describeTopPercent(120).kind).toBe("topExtreme");
    expect(describeTopPercent(-5).kind).toBe("bottomExtreme");
  });
});

describe("숫자 표기", () => {
  it("언어별 자릿수 구분이 적용된다", () => {
    expect(formatNumber(1234567, "en")).toBe("1,234,567");
    expect(formatNumber(1234567, "ko")).toBe("1,234,567");
    expect(formatNumber(1234567, "ja")).toBe("1,234,567");
  });

  it("백분율은 항상 소수 첫째 자리까지 쓴다", () => {
    expect(formatPercentValue(12, "ko")).toBe("12.0");
    expect(formatPercentValue(0.1, "en")).toBe("0.1");
  });

  it("차이에는 부호를 붙인다", () => {
    expect(formatSignedDifference(7.5, "ko")).toBe("+7.5");
    expect(formatSignedDifference(-2, "ko")).toBe("-2");
    expect(formatSignedDifference(0, "ko")).toBe("0");
  });
});

describe("키·몸무게 표기", () => {
  it("cm 와 피트·인치를 모두 보여준다", () => {
    expect(formatHeight(172.5, "cm", "ko")).toBe("172.5 cm");
    expect(formatHeight(180, "ftin", "en")).toBe("5′ 10.9″");
  });

  it("kg 와 lb 를 모두 보여준다", () => {
    expect(formatWeight(70, "kg", "ko")).toBe("70 kg");
    expect(formatWeight(70, "lb", "en")).toBe("154.3 lb");
  });

  it("BMI 는 소수 첫째 자리까지", () => {
    expect(formatBmi(22.857, "ko")).toBe("22.9");
  });
});

describe("소득 표기", () => {
  it("한국어 원화는 만원 단위로 보여준다", () => {
    expect(formatIncome(40_000_000, "KRW", "ko")).toBe("4,000만원");
  });

  it("영어 화면에서는 통화 기호를 쓴다", () => {
    expect(formatIncome(60_000, "USD", "en")).toContain("60,000");
    expect(formatIncome(60_000, "USD", "en")).toContain("$");
  });

  it("일본어 화면에서는 엔 표기를 쓴다", () => {
    expect(formatIncome(4_500_000, "JPY", "ja")).toContain("4,500,000");
  });
});

describe("topPercentText", () => {
  const t = getTranslator("ko");

  it("평균은 '상위 50.0%' 로 나온다", () => {
    expect(topPercentText(50, t, "ko")).toBe("상위 50.0%");
  });

  it("극단값은 '미만' 표현으로 바뀐다", () => {
    expect(topPercentText(99.999, t, "ko")).toBe("상위 0.1% 미만");
    expect(topPercentText(0.001, t, "ko")).toBe("하위 0.1% 미만");
  });

  it("영어·일본어도 각각의 문장으로 나온다", () => {
    expect(topPercentText(87.7, getTranslator("en"), "en")).toBe("Top 12.3%");
    expect(topPercentText(87.7, getTranslator("ja"), "ja")).toBe("上位12.3％");
  });
});

describe("explanationKey", () => {
  it("구간마다 다른 해설을 고른다", () => {
    expect(explanationKey(99)).toBe("explain.veryHigh");
    expect(explanationKey(85)).toBe("explain.high");
    expect(explanationKey(50)).toBe("explain.middle");
    expect(explanationKey(15)).toBe("explain.low");
    expect(explanationKey(2)).toBe("explain.veryLow");
  });
});
