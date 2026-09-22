import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslator, isLocale, locales } from "@/lib/i18n";

/** MVP 대상 항목. 이 목록에 없는 주소는 404. */
export const metrics = ["height", "weight", "income"] as const;
export type Metric = (typeof metrics)[number];

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    metrics.map((metric) => ({ locale, metric })),
  );
}

function isMetric(value: string): value is Metric {
  return (metrics as readonly string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}): Promise<Metadata> {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetric(metric)) return {};
  const t = getTranslator(locale);
  return { title: t(`metric.${metric}`), description: t(`metricDesc.${metric}`) };
}

/**
 * 계산기 화면. 5단계에서 입력 폼과 결과 그래프를 채운다.
 * 지금은 통계 데이터가 아직 없으므로 "데이터 준비 중"만 보여준다.
 */
export default async function MetricPage({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}) {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetric(metric)) notFound();
  const t = getTranslator(locale);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{t(`metric.${metric}`)}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(`metricDesc.${metric}`)}
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
        <p className="font-semibold">{t("common.dataPending")}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {t("common.dataPendingDesc")}
        </p>
      </div>
    </div>
  );
}
