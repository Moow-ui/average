import { describe, expect, it } from "vitest";
import { getTranslator, isLocale, locales } from "./i18n";
import ko from "@/messages/ko.json";
import en from "@/messages/en.json";
import ja from "@/messages/ja.json";

/** 중첩 객체를 "a.b.c" 형태의 키 목록으로 펼친다. */
function flatten(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([key, value]) =>
    flatten(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n", () => {
  it("세 언어 모두 로케일로 인식된다", () => {
    for (const locale of locales) {
      expect(isLocale(locale)).toBe(true);
    }
    expect(isLocale("fr")).toBe(false);
  });

  it("영어·일본어 문구 파일에 한국어와 같은 키가 모두 있다", () => {
    const koKeys = flatten(ko).sort();
    expect(flatten(en).sort()).toEqual(koKeys);
    expect(flatten(ja).sort()).toEqual(koKeys);
  });

  it("없는 키를 요청하면 키 자체를 돌려준다", () => {
    const t = getTranslator("en");
    expect(t("does.not.exist")).toBe("does.not.exist");
    expect(t("nav.home")).toBe("Home");
  });
});
