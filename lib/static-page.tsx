import type { Metadata } from "next";
import type { Locale } from "./i18n";
import { getTranslator, isLocale } from "./i18n";
import { buildMetadata } from "./seo";

/** 소개·약관처럼 글만 있는 페이지의 공통 틀. */
export function staticPageMetadata(
  locale: string,
  slug: string,
  titleKey: string,
  descriptionKey: string,
): Metadata {
  if (!isLocale(locale)) return {};
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: `/${slug}`,
    title: t(titleKey),
    description: t(descriptionKey),
    ogImage: `${locale}-home.png`,
  });
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      <div className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {children}
      </div>
    </section>
  );
}

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        {intro && (
          <p className="leading-relaxed text-slate-600 dark:text-slate-300">
            {intro}
          </p>
        )}
      </header>
      {children}
    </article>
  );
}

export type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function assertLocale(locale: string): asserts locale is Locale {
  if (!isLocale(locale)) {
    throw new Error("지원하지 않는 언어입니다");
  }
}
