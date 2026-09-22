import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslator, isLocale, locales } from "@/lib/i18n";
import { countries, getDistribution, getIncomeEntry } from "@/lib/data";
import type { CountryCode } from "@/lib/data-types";

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

/** 그 나라 자료가 계산에 쓸 수 있는 상태인지 확인한다. */
function isCountryReady(metric: Metric, country: CountryCode): boolean {
  if (metric === "income") return getIncomeEntry(country) !== undefined;
  return (
    getDistribution(metric, country, "male") !== undefined &&
    getDistribution(metric, country, "female") !== undefined
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}): Promise<Metadata> {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetric(metric)) return {};
  const t = getTranslator(locale);
  return {
    title: t(`metric.${metric}`),
    description: t(`metricDesc.${metric}`),
  };
}

/**
 * 계산기 화면. 5단계에서 입력 폼과 결과 그래프를 채운다.
 * 지금은 어떤 나라 자료가 준비됐는지만 보여준다.
 * 자료가 하나도 없어도 에러 없이 "데이터 준비 중"이 뜨는지 확인하는 역할도 한다.
 */
export default async function MetricPage({
  params,
}: {
  params: Promise<{ locale: string; metric: string }>;
}) {
  const { locale, metric } = await params;
  if (!isLocale(locale) || !isMetric(metric)) notFound();
  const t = getTranslator(locale);

  const rows = countries.countries.map((country) => ({
    code: country.code,
    ready: isCountryReady(metric, country.code),
  }));
  const anyReady = rows.some((row) => row.ready);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{t(`metric.${metric}`)}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t(`metricDesc.${metric}`)}
        </p>
      </header>

      {!anyReady && (
        <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800">
          <p className="font-semibold">{t("common.dataPending")}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {t("common.dataPendingDesc")}
          </p>
        </div>
      )}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {t("dataStatus.title")}
        </h2>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {rows.map((row) => (
            <li
              key={row.code}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>{t(`country.${row.code}`)}</span>
              <span
                className={
                  row.ready
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400"
                }
              >
                {row.ready ? t("dataStatus.ready") : t("dataStatus.pending")}
              </span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("dataStatus.note")}
        </p>
      </section>
    </div>
  );
}
