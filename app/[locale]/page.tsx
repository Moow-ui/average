import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { getTranslator, isLocale } from "@/lib/i18n";
import { metricIds } from "@/lib/metrics";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: "/",
    title: t("site.tagline"),
    description: t("site.description"),
    ogImage: `${locale}-home.png`,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("site.tagline")}</h1>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          {t("site.description")}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t("home.adultsOnly")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("home.chooseMetric")}</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {metricIds.map((metric) => (
            <li key={metric}>
              <Link
                href={`/${locale}/${metric}`}
                className="block h-full rounded-xl border border-slate-200 p-4 transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-900"
              >
                <span className="block font-semibold">
                  {t(`metric.${metric}`)}
                </span>
                <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">
                  {t(`metricDesc.${metric}`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t("home.howItWorks")}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("home.howItWorksBody")}
        </p>
        <Link
          href={`/${locale}/sources`}
          className="inline-block text-sm text-sky-700 underline underline-offset-2 dark:text-sky-300"
        >
          {t("nav.sources")}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("faq.q1")}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("faq.a1")}
        </p>
        <h2 className="text-lg font-semibold">{t("faq.q2")}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("faq.a2")}
        </p>
        <h2 className="text-lg font-semibold">{t("faq.q3")}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {t("faq.a3")}
        </p>
      </section>

      {/* 광고는 입력·버튼에서 충분히 떨어진 본문 맨 아래에만 둔다. */}
      <AdSlot id="home-bottom" label={t("ad.label")} />

      <JsonLd data={faqJsonLd(t)} />
    </div>
  );
}
