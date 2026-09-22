"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

/** 좁은 화면에서도 한 줄에 들어가도록 짧은 표시를 쓴다. */
const shortLabels: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
  ja: "JA",
};

/** 화면 낭독기와 마우스 올렸을 때 보여줄 정식 이름. */
const fullLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

/** 지금 보고 있는 페이지 그대로 언어만 바꾼다. */
export default function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? `/${current}`;
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav
      aria-label="Language"
      className="flex shrink-0 items-center rounded-md border border-slate-200 p-0.5 text-xs font-medium dark:border-slate-700"
    >
      {locales.map((locale) => {
        const href = rest ? `/${locale}/${rest}` : `/${locale}`;
        const isCurrent = locale === current;
        return (
          <Link
            key={locale}
            href={href}
            hrefLang={locale}
            lang={locale}
            title={fullLabels[locale]}
            aria-label={fullLabels[locale]}
            aria-current={isCurrent ? "true" : undefined}
            className={[
              "rounded px-2 py-1 whitespace-nowrap transition",
              isCurrent
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
            ].join(" ")}
          >
            {shortLabels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
