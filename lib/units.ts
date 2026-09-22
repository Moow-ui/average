/**
 * 단위 변환 (순수 함수).
 * 사이트 안쪽 계산은 언제나 cm, kg, 각 나라 통화 단위로 한다.
 * 화면에 보여줄 때만 ft/in, lb, 만원으로 바꾼다.
 */
import type { LengthUnit, MassUnit } from "./data-types";

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;
const KG_PER_LB = 0.45359237;
/** 한국에서 소득을 말할 때 쓰는 "만원". */
const WON_PER_MANWON = 10_000;

export type FeetInches = { feet: number; inches: number };

/** cm → 피트·인치. 인치는 소수 첫째 자리까지. */
export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = cm / CM_PER_INCH;
  let feet = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round((totalInches - feet * INCHES_PER_FOOT) * 10) / 10;

  // 반올림 때문에 12인치가 되면 1피트로 올린다 (5'12" 같은 표기 방지).
  if (inches >= INCHES_PER_FOOT) {
    feet += 1;
    inches -= INCHES_PER_FOOT;
  }
  return { feet, inches };
}

export function feetInchesToCm({ feet, inches }: FeetInches): number {
  return (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

export function manwonToWon(manwon: number): number {
  return manwon * WON_PER_MANWON;
}

export function wonToManwon(won: number): number {
  return won / WON_PER_MANWON;
}

/** 화면에 보여줄 키 값으로 바꾼다 (계산은 항상 cm 로 한다). */
export function lengthFromCm(cm: number, unit: LengthUnit): number | FeetInches {
  return unit === "cm" ? cm : cmToFeetInches(cm);
}

/** 화면에 보여줄 몸무게 값으로 바꾼다 (계산은 항상 kg 로 한다). */
export function massFromKg(kg: number, unit: MassUnit): number {
  return unit === "kg" ? kg : kgToLb(kg);
}

/** 사용자가 고른 단위로 들어온 몸무게를 kg 로 되돌린다. */
export function massToKg(value: number, unit: MassUnit): number {
  return unit === "kg" ? value : lbToKg(value);
}

/**
 * BMI = 몸무게(kg) ÷ 키(m)의 제곱.
 * 이건 건강 진단이 아니라 단순 계산값이다.
 */
export function calculateBmi(weightKg: number, heightCm: number): number {
  if (!(heightCm > 0)) throw new Error("키는 0보다 커야 합니다");
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/**
 * 현지 통화 금액을 PPP 기준 국제달러로 바꾼다.
 * 세계 소득 비교는 반드시 이 값으로 해야 한다 (시장환율 아님).
 */
export function toPppUsd(amount: number, pppConversionFactor: number): number {
  if (!(pppConversionFactor > 0)) {
    throw new Error("PPP 환산계수는 0보다 커야 합니다");
  }
  return amount / pppConversionFactor;
}

/** PPP 기준 국제달러를 현지 통화로 되돌린다. */
export function fromPppUsd(pppUsd: number, pppConversionFactor: number): number {
  if (!(pppConversionFactor > 0)) {
    throw new Error("PPP 환산계수는 0보다 커야 합니다");
  }
  return pppUsd * pppConversionFactor;
}
