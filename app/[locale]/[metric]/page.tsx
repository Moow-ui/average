import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import Calculator from "@/components/Calculator";
import JsonLd from "@/components/JsonLd";
import { getTranslator, isLocale, locales } from "@/lib/i18n";
import { isMetricId, metricIds, staticValuesFor } from "@/lib/metrics";
import { buildMetadata, faqJsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    metricIds.map((metric) => ({ locale, metric })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}): Promise<Metadata> {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetricId(metric)) return {};
  const t = getTranslator(locale);
  return buildMetadata({
    locale,
    path: `/${metric}`,
    title: t(`metric.${metric}`),
    description: t(`metricDesc.${metric}`),
    ogImage: `${locale}-${metric}.png`,
  });
}

/** 계산기 화면. 입력하면 바로 아래에 결과가 나온다. */
export default async function MetricPage({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}) {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetricId(metric)) notFound();
  const t = getTranslator(locale);

  // 결과 페이지가 있는 항목이면, 대표적인 값 몇 개를 링크로 걸어 둔다.
  const sampleValues = staticValuesFor(metric).filter((v) => v % 10 === 0);

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{t(`metric.${metric}`)}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(`metricDesc.${metric}`)}
        </p>
      </header>

      <Calculator metric={metric} />

      {sampleValues.length > 0 && (
        <nav aria-label={t("common.seeAlso")} className="space-y-2">
          <h2 className="text-sm font-semibold">{t("common.seeAlso")}</h2>
          <ul className="flex flex-wrap gap-2">
            {sampleValues.map((value) => (
              <li key={value}>
                <Link
                  href={`/${locale}/${metric}/male/${value}`}
                  className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {t("form.male")} {value}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* 광고는 입력창·계산 버튼에서 멀리 떨어진 맨 아래에만 둔다. */}
      <AdSlot id={`${metric}-bottom`} label={t("ad.label")} />

      <JsonLd data={faqJsonLd(t)} />
    </div>
  );
}
