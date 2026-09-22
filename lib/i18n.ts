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

export type Translator = (key: string) => string;

/**
 * 문구를 꺼내는 함수를 만든다.
 * 사용법: const t = getTranslator("ko"); t("home.chooseMetric")
 * 해당 언어에 문구가 없으면 한국어로, 그래도 없으면 키 자체를 돌려준다.
 */
export function getTranslator(locale: Locale): Translator {
  const dict: Dictionary = dictionaries[locale];
  return (key: string) => lookup(dict, key) ?? lookup(ko, key) ?? key;
}

export function getMessages(locale: Locale): Dictionary {
  return dictionaries[locale];
}
