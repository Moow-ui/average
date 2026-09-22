import ko from "@/messages/ko.json";
import en from "@/messages/en.json";
import ja from "@/messages/ja.json";

export const locales = ["ko", "en", "ja"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ko";

/** <html lang="..."> 에 넣을 값 */
export const htmlLang: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en",
  ja: "ja-JP",
};

/** Intl.NumberFormat 등 숫자·날짜 표기에 쓸 로케일 */
export const intlLocale: Record<Locale, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

const dictionaries = { ko, en, ja } as const;

/** 한국어 파일을 기준으로 키 목록을 만든다 (번역 누락 시 한국어로 대체). */
type Dictionary = typeof ko;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

function lookup(dict: unknown, path: string): string | undefined {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      dict,
    );
  return typeof value === "string" ? value : undefined;
}

/** 문구 안의 {이름} 자리에 넣을 값들. */
export type TranslationParams = Record<string, string | number>;

export type Translator = (key: string, params?: TranslationParams) => string;

/** "상위 {percent}%" 의 {percent} 를 실제 값으로 바꾼다. */
function fill(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * 문구를 꺼내는 함수를 만든다.
 * 사용법: const t = getTranslator("ko"); t("result.topPercent", { percent: "12.3" })
 * 해당 언어에 문구가 없으면 한국어로, 그래도 없으면 키 자체를 돌려준다.
 */
export function getTranslator(locale: Locale): Translator {
  const dict: Dictionary = dictionaries[locale];
  return (key: string, params?: TranslationParams) =>
    fill(lookup(dict, key) ?? lookup(ko, key) ?? key, params);
}
