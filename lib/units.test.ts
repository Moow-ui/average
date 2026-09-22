import { describe, expect, it } from "vitest";
import {
  calculateBmi,
  cmToFeetInches,
  feetInchesToCm,
  fromPppUsd,
  kgToLb,
  lbToKg,
  manwonToWon,
  toPppUsd,
  wonToManwon,
} from "./units";

describe("키 단위", () => {
  it("1인치는 2.54cm 다", () => {
    expect(feetInchesToCm({ feet: 0, inches: 1 })).toBeCloseTo(2.54, 10);
  });

  it("6피트는 약 182.9cm 다", () => {
    expect(feetInchesToCm({ feet: 6, inches: 0 })).toBeCloseTo(182.88, 6);
  });

  it("180cm 는 약 5피트 11인치다", () => {
    const { feet, inches } = cmToFeetInches(180);
    expect(feet).toBe(5);
    expect(inches).toBeCloseTo(10.9, 1);
  });

  it("바꿨다 되돌리면 원래 값에 가깝다", () => {
    for (const cm of [150, 165.5, 172, 180, 195]) {
      const back = feetInchesToCm(cmToFeetInches(cm));
      expect(back).toBeCloseTo(cm, 0);
    }
  });

  it('5피트 12인치 같은 표기가 나오지 않는다', () => {
    // 반올림하면 12인치가 되는 값들을 확인한다.
    for (let cm = 150; cm <= 200; cm += 0.1) {
      const { inches } = cmToFeetInches(cm);
      expect(inches).toBeLessThan(12);
      expect(inches).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("몸무게 단위", () => {
  it("1파운드는 약 0.4536kg 다", () => {
    expect(lbToKg(1)).toBeCloseTo(0.45359237, 10);
  });

  it("70kg 는 약 154.3파운드다", () => {
    expect(kgToLb(70)).toBeCloseTo(154.32, 1);
  });

  it("바꿨다 되돌리면 원래 값이다", () => {
    for (const kg of [45, 60.5, 72, 88, 110]) {
      expect(lbToKg(kgToLb(kg))).toBeCloseTo(kg, 10);
    }
  });
});

describe("만원 단위", () => {
  it("1만원은 10000원이다", () => {
    expect(manwonToWon(1)).toBe(10_000);
  });

  it("4000만원은 4억이 아니라 4천만원이다", () => {
    expect(manwonToWon(4000)).toBe(40_000_000);
  });

  it("바꿨다 되돌리면 원래 값이다", () => {
    expect(wonToManwon(manwonToWon(3250))).toBe(3250);
  });
});

describe("BMI", () => {
  it("70kg · 175cm 는 약 22.9 다", () => {
    expect(calculateBmi(70, 175)).toBeCloseTo(22.86, 2);
  });

  it("키가 0 이면 에러", () => {
    expect(() => calculateBmi(70, 0)).toThrow();
  });
});

describe("PPP 환산", () => {
  it("환산계수로 나눈다", () => {
    // 1 PPP달러 = 800원 이라면, 4000만원은 50,000 PPP달러.
    expect(toPppUsd(40_000_000, 800)).toBeCloseTo(50_000, 6);
  });

  it("바꿨다 되돌리면 원래 값이다", () => {
    expect(fromPppUsd(toPppUsd(40_000_000, 861.8), 861.8)).toBeCloseTo(40_000_000, 4);
  });

  it("환산계수가 0 이면 에러", () => {
    expect(() => toPppUsd(1000, 0)).toThrow();
  });
});
