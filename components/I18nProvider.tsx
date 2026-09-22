"use client";

import { createContext, useContext, useMemo } from "react";
import ko from "@/messages/ko.json";
import en from "@/messages/en.json";
import ja from "@/messages/ja.json";
import type { Locale, TranslationParams, Translator } from "@/lib/i18n";

/**
 * 문구 묶음은 이 파일에서 직접 불러온다.
 *
 * 서버에서 props 로 내려주면 페이지 HTML 마다 문구 전체(약 16KB)가 복사되는데,
 * 결과 페이지가 800쪽이 넘어서 그만큼 용량이 커진다.
 * 여기서 불러오면 한 번 내려받아 캐시되므로 훨씬 가볍다.
 */
const dictionaries = { ko, en, ja } as const;

type I18nValue = {
  locale: Locale;
  t: Translator;
};

const I18nContext = createContext<I18nValue | null>(null);

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

function fill(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/**
 * 화면 안쪽(브라우저에서 움직이는 부분)에서도 문구를 쓸 수 있게 해준다.
 * 서버가 현재 언어의 문구 묶음만 내려주므로, 세 언어를 전부 받아오지 않는다.
 */
export default function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: (key, params) =>
        fill(lookup(dictionaries[locale], key) ?? lookup(ko, key) ?? key, params),
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("I18nProvider 안에서만 쓸 수 있습니다");
  }
  return value;
}
