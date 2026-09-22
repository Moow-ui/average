"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale, TranslationParams, Translator } from "@/lib/i18n";

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
  messages,
  children,
}: {
  locale: Locale;
  messages: unknown;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      t: (key, params) => fill(lookup(messages, key) ?? key, params),
    }),
    [locale, messages],
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
