import { describe, expect, it } from "vitest";
import {
  bodyResultForCountry,
  bodyResultForWorld,
  bodyResults,
  incomeResultForCountry,
  incomeResultForWorld,
} from "./results";

/**
 * 지금은 /data 가 전부 비어 있다 (수치 조사 전).
 * 그래도 에러 없이 "준비 중"이 나와야 한다.
 */
describe("데이터가 비어 있을 때", () => {
  it("나라 키 결과가 에러 없이 '준비 중' 이다", () => {
    expect(bodyResultForCountry("height", "KR", "male", 180)).toEqual({
      region: "KR",
      state: "pending",
    });
  });

  it("세계 키 결과가 '준비 중' 이다 (3개국으로 대신 계산하지 않는다)", () => {
    expect(bodyResultForWorld("height", "male", 180)).toEqual({
      region: "WORLD",
      state: "pending",
    });
  });

  it("세계 몸무게 결과도 '준비 중' 이다", () => {
    expect(bodyResultForWorld("weight", "female", 55)).toEqual({
      region: "WORLD",
      state: "pending",
    });
  });

  it("나라 소득 결과가 '준비 중' 이다", () => {
    expect(incomeResultForCountry("KR", 40_000_000)).toEqual({
      region: "KR",
      state: "pending",
    });
  });

  it("세계 소득 결과가 '준비 중' 이다", () => {
    expect(incomeResultForWorld("KRW", 40_000_000)).toEqual({
      region: "WORLD",
      state: "pending",
    });
  });

  it("결과 묶음은 나라 수 + 세계 만큼 나온다", () => {
    const results = bodyResults("height", "male", 180, ["KR", "US", "JP"]);
    expect(results).toHaveLength(4);
    expect(results.at(-1)!.region).toBe("WORLD");
    expect(results.every((r) => r.state === "pending")).toBe(true);
  });
});
