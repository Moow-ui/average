import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import CountryCompareTable from "@/components/CountryCompareTable";
import DataPending from "@/components/DataPending";
import DistributionChart from "@/components/DistributionChart";
import JsonLd from "@/components/JsonLd";
import ShareButtons from "@/components/ShareButtons";
import { countries, getDistribution, getWorldComponents } from "@/lib/data";
import type { Gender } from "@/lib/data-types";
import { mixtureCurve, normalCurve } from "@/lib/chart";
import {
  explanationKey,
  formatHeight,
  formatWeight,
  topPercentText,
} from "@/lib/format";
import { getTranslator, isLocale, locales } from "@/lib/i18n";
import {
  isMetricId,
  metricIds,
  neighborValuesFor,
  staticValuesFor,
} from "@/lib/metrics";
import { bodyResults } from "@/lib/results";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const genders = ["male", "female"] as const;
const countryCodes = countries.countries.map((c) => c.code);

/**
 * 결과 페이지를 미리 만든다.
 * 키 150~200cm, 몸무게 40~120kg 처럼 현실적인 범위만 만든다.
 */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    metricIds.flatMap((metric) =>
      genders.flatMap((gender) =>
        staticValuesFor(metric).map((value) => ({
          locale,
          metric,
          gender,
          value: String(value),
        })),
      ),
    ),
  );
}

/**
 * 결과 페이지는 키·몸무게만 만든다.
 * 소득은 주소에 통화가 드러나지 않아 값만으로는 뜻이 모호하기 때문이다.
 */
type ResultMetric = "height" | "weight";

function parse(metric: string, gender: string, value: string) {
  if (!isMetricId(metric)) return null;
  if (metric !== "height" && metric !== "weight") return null;
  if (!(genders as readonly string[]).includes(gender)) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  if (!staticValuesFor(metric).includes(parsed)) return null;
  return { metric: metric as ResultMetric, gender: gender as Gender, value: parsed };
}

function unitLabel(metric: ResultMetric): string {
  return metric === "height" ? "cm" : "kg";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; metric: string; gender: string; value: string }>;
}): Promise<Metadata> {
  const { locale, metric, gender, value } = await params;
  if (!isLocale(locale)) return {};
  const parsed = parse(metric, gender, value);
  if (!parsed) return {};

  const t = getTranslator(locale);
  const valueText = `${parsed.value}${unitLabel(parsed.metric)}`;
  const replacements = {
    gender: t(`form.${parsed.gender}`),
    metric: t(`metricShort.${parsed.metric}`),
    value: valueText,
  };

  return buildMetadata({
    locale,
    path: `/${parsed.metric}/${parsed.gender}/${parsed.value}`,
    title: t("seo.resultTitle", replacements),
    description: t("seo.resultDescription", replacements),
    ogImage: `${locale}-${parsed.metric}-${parsed.gender}.png`,
  });
}

export default async function ResultPage({
  params,
}: {
  params: Promise<{ locale: string; metric: string; gender: string; value: string }>;
}) {
  const { locale, metric, gender, value } = await params;
  if (!isLocale(locale)) notFound();
  const parsed = parse(metric, gender, value);
  if (!parsed) notFound();

  const t = getTranslator(locale);
  const results = bodyResults(parsed.metric, parsed.gender, parsed.value, countryCodes);
  const primary = results.find((r) => r.state === "ready");

  const formatValue = (n: number) =>
    parsed.metric === "height"
      ? formatHeight(n, "cm", locale)
      : formatWeight(n, "kg", locale);

  const worldComponents = getWorldComponents(parsed.metric, parsed.gender);
  const firstReady = countryCodes
    .map((code) => getDistribution(parsed.metric, code, parsed.gender))
    .find((d) => d && typeof d.mean === "number" && typeof d.sd === "number");

  const chart = worldComponents
    ? mixtureCurve(worldComponents)
    : firstReady && typeof firstReady.mean === "number" && typeof firstReady.sd === "number"
      ? normalCurve(firstReady.mean, firstReady.sd)
      : null;

  const valueText = `${parsed.value}${unitLabel(parsed.metric)}`;
  const heading = t("seo.resultTitle", {
    gender: t(`form.${parsed.gender}`),
    metric: t(`metricShort.${parsed.metric}`),
    value: valueText,
  });

  const neighbors = neighborValuesFor(parsed.metric, parsed.value);
  const otherGender = parsed.gender === "male" ? "female" : "male";

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">{heading}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t("seo.resultDescription", {
            gender: t(`form.${parsed.gender}`),
            metric: t(`metricShort.${parsed.metric}`),
            value: valueText,
          })}
        </p>
      </header>

      {primary && primary.state === "ready" ? (
        <section className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("result.inRegion", { region: t(`country.${primary.region}`) })}
          </p>
          <p className="mt-1 text-4xl font-bold text-sky-700 dark:text-sky-300">
            {topPercentText(primary.lowerPercentile, t, locale)}
          </p>
        </section>
      ) : (
        <DataPending t={t} />
      )}

      {chart && (
        <DistributionChart
          data={chart}
          value={parsed.value}
          label={t("result.chartLabel")}
          valueLabel={formatValue(parsed.value)}
          ariaLabel={t("result.chartAria")}
        />
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("compare.title")}</h2>
        <CountryCompareTable
          results={results}
          t={t}
          locale={locale}
          formatValue={formatValue}
        />
      </section>

      {results.some((r) => r.region === "WORLD" && r.state === "pending") && (
        <DataPending
          t={t}
          title={t("result.worldPending")}
          description={t("result.worldPendingDesc")}
        />
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{t("explain.title")}</h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {primary && primary.state === "ready"
            ? t(explanationKey(primary.lowerPercentile))
            : t("common.dataPendingDesc")}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t("explain.neutralNote")}
        </p>
        {parsed.metric === "weight" && (
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {t("bmi.disclaimer")}
          </p>
        )}
      </section>

      <ShareButtons
        url={absoluteUrl(`/${locale}/${parsed.metric}/${parsed.gender}/${parsed.value}`)}
        text={heading}
      />

      <nav aria-label={t("neighbors.title")} className="space-y-2">
        <h2 className="text-sm font-semibold">{t("neighbors.title")}</h2>
        <ul className="flex flex-wrap gap-2">
          {neighbors.map((n) => (
            <li key={n}>
              <Link
                href={`/${locale}/${parsed.metric}/${parsed.gender}/${n}`}
                className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {n}
                {unitLabel(parsed.metric)}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href={`/${locale}/${parsed.metric}/${otherGender}/${parsed.value}`}
              className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t(`form.${otherGender}`)} {valueText}
            </Link>
          </li>
          <li>
            <Link
              href={`/${locale}/${parsed.metric}`}
              className="inline-block rounded-lg border border-slate-200 px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {t(`metric.${parsed.metric}`)}
            </Link>
          </li>
        </ul>
      </nav>

      {/* 광고는 공유 버튼·링크에서 떨어진 맨 아래에만 둔다. */}
      <AdSlot id="result-bottom" label={t("ad.label")} />

      <JsonLd data={faqJsonLd(t)} />
    </div>
  );
}
