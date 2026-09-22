import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../globals.css";
import CookieConsent from "@/components/CookieConsent";
import I18nProvider from "@/components/I18nProvider";
import JsonLd from "@/components/JsonLd";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import SiteFooter from "@/components/SiteFooter";
import ThemeToggle from "@/components/ThemeToggle";
import {
  getTranslator,
  htmlLang,
  isLocale,
  locales,
} from "@/lib/i18n";
import { webSiteJsonLd } from "@/lib/seo";

/** 세 언어 페이지를 미리 만들어 둔다 (정적 생성). */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getTranslator(locale);
  return {
    title: { default: t("site.name"), template: `%s | ${t("site.name")}` },
    description: t("site.description"),
    applicationName: t("site.name"),
  };
}

/**
 * 화면이 그려지기 전에 저장된 테마를 적용해서, 새로고침할 때
 * 흰 화면이 번쩍이는 현상을 막는다.
 */
const themeScript = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = getTranslator(locale);

  return (
    <html lang={htmlLang[locale]} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <I18nProvider locale={locale}>
          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
              <Link
                href={`/${locale}`}
                className="truncate text-sm font-semibold sm:text-base"
              >
                {t("site.name")}
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <LocaleSwitcher current={locale} />
                <ThemeToggle label={t("theme.toggle")} />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
            {children}
          </main>

          <SiteFooter locale={locale} t={t} />
          <CookieConsent />
        </I18nProvider>

        <JsonLd data={webSiteJsonLd(t("site.name"), t("site.description"))} />
      </body>
    </html>
  );
}
