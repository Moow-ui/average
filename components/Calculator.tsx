"use client";

import { useMemo, useState } from "react";
import { useI18n } from "./I18nProvider";
import DataPending from "./DataPending";
import DistributionChart from "./DistributionChart";
import CountryCompareTable from "./CountryCompareTable";
import ShareButtons from "./ShareButtons";
import { countries, getDistribution, getWorldComponents } from "@/lib/data";
import type { CountryCode, Gender, LengthUnit, MassUnit } from "@/lib/data-types";
import { mixtureCurve, normalCurve } from "@/lib/chart";
import {
  formatBmi,
  formatHeight,
  formatIncome,
  formatWeight,
  topPercentText,
  explanationKey,
} from "@/lib/format";
import { bodyResults, incomeResultForCountry, incomeResultForWorld } from "@/lib/results";
import type { MetricId } from "@/lib/metrics";
import { metricConfigs } from "@/lib/metrics";
import {
  calculateBmi,
  feetInchesToCm,
  lbToKg,
  manwonToWon,
} from "@/lib/units";
import { SITE_URL } from "@/lib/site";

const countryCodes = countries.countries.map((c) => c.code);

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-900";
const labelClass = "block text-sm font-medium";
const chipClass =
  "rounded-lg border px-3 py-2 text-sm transition";
const chipOn =
  "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900";
const chipOff =
  "border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800";

type Committed =
  | { kind: "body"; metric: "height" | "weight"; value: number; heightCm?: number }
  | { kind: "income"; amount: number; country: CountryCode };

export default function Calculator({ metric }: { metric: MetricId }) {
  const { t, locale } = useI18n();

  const [gender, setGender] = useState<Gender>("male");
  const [lengthUnit, setLengthUnit] = useState<LengthUnit>(
    locale === "en" ? "ftin" : "cm",
  );
  const [massUnit, setMassUnit] = useState<MassUnit>(
    locale === "en" ? "lb" : "kg",
  );

  const [cmText, setCmText] = useState("");
  const [feetText, setFeetText] = useState("");
  const [inchText, setInchText] = useState("");
  const [massText, setMassText] = useState("");
  const [bmiHeightText, setBmiHeightText] = useState("");

  const [incomeCountry, setIncomeCountry] = useState<CountryCode>(
    locale === "en" ? "US" : locale === "ja" ? "JP" : "KR",
  );
  const [incomeText, setIncomeText] = useState("");

  const [committed, setCommitted] = useState<Committed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currency =
    countries.countries.find((c) => c.code === incomeCountry)?.currency ?? "USD";
  /** 한국어 화면에서 원화는 "만원" 단위로 입력받는 게 자연스럽다. */
  const useManwon = locale === "ko" && currency === "KRW";

  function readHeightCm(): number | null {
    if (lengthUnit === "cm") {
      const value = Number(cmText);
      return Number.isFinite(value) && cmText.trim() !== "" ? value : null;
    }
    const feet = Number(feetText || "0");
    const inches = Number(inchText || "0");
    if (!Number.isFinite(feet) || !Number.isFinite(inches)) return null;
    if (feetText.trim() === "" && inchText.trim() === "") return null;
    return feetInchesToCm({ feet, inches });
  }

  function readMassKg(): number | null {
    const value = Number(massText);
    if (!Number.isFinite(value) || massText.trim() === "") return null;
    return massUnit === "kg" ? value : lbToKg(value);
  }

  function readBmiHeightCm(): number | null {
    const value = Number(bmiHeightText);
    if (!Number.isFinite(value) || bmiHeightText.trim() === "") return null;
    return lengthUnit === "cm" ? value : value * 2.54;
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (metric === "income") {
      const raw = Number(incomeText);
      if (!Number.isFinite(raw) || incomeText.trim() === "") {
        setError(t("form.enterValue"));
        return;
      }
      const amount = useManwon ? manwonToWon(raw) : raw;
      const { min, max } = metricConfigs.income.inputRange;
      if (amount < min || amount > max) {
        setError(t("form.outOfRange"));
        return;
      }
      setCommitted({ kind: "income", amount, country: incomeCountry });
      return;
    }

    const value = metric === "height" ? readHeightCm() : readMassKg();
    if (value === null) {
      setError(t("form.enterValue"));
      return;
    }
    const { min, max } = metricConfigs[metric].inputRange;
    if (value < min || value > max) {
      setError(t("form.outOfRange"));
      return;
    }
    setCommitted({
      kind: "body",
      metric,
      value,
      heightCm: metric === "weight" ? (readBmiHeightCm() ?? undefined) : undefined,
    });
  }

  const results = useMemo(() => {
    if (!committed) return null;
    if (committed.kind === "income") {
      return [
        ...countryCodes.map((code) =>
          incomeResultForCountry(code, committed.amount),
        ),
        incomeResultForWorld(currency, committed.amount),
      ];
    }
    return bodyResults(committed.metric, gender, committed.value, countryCodes);
  }, [committed, gender, currency]);

  /** 그래프는 자료가 있는 곳 중 세계 → 첫 나라 순으로 하나만 그린다. */
  const chart = useMemo(() => {
    if (!committed || committed.kind !== "body") return null;
    const worldComponents = getWorldComponents(committed.metric, gender);
    if (worldComponents) {
      return { data: mixtureCurve(worldComponents), region: "WORLD" as const };
    }
    for (const code of countryCodes) {
      const dist = getDistribution(committed.metric, code, gender);
      if (dist && typeof dist.mean === "number" && typeof dist.sd === "number") {
        return { data: normalCurve(dist.mean, dist.sd), region: code };
      }
    }
    return null;
  }, [committed, gender]);

  const formatValue = (value: number) =>
    metric === "height"
      ? formatHeight(value, lengthUnit, locale)
      : metric === "weight"
        ? formatWeight(value, massUnit, locale)
        : formatIncome(value, currency, locale);

  const primary = results?.find((r) => r.state === "ready");
  const anyReady = primary !== undefined;

  const shareUrl =
    committed?.kind === "body" && metricConfigs[metric].staticRange
      ? `${SITE_URL}/${locale}/${metric}/${gender}/${Math.round(committed.value)}`
      : `${SITE_URL}/${locale}/${metric}`;

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="space-y-5">
        {metric !== "income" && (
          <fieldset className="space-y-2">
            <legend className={labelClass}>{t("form.gender")}</legend>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setGender(option)}
                  aria-pressed={gender === option}
                  className={`${chipClass} ${gender === option ? chipOn : chipOff}`}
                >
                  {t(`form.${option}`)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("form.genderNote")}
            </p>
          </fieldset>
        )}

        {metric === "height" && (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="height-input" className={labelClass}>
                {t("form.height")}
              </label>
              <button
                type="button"
                onClick={() => setLengthUnit(lengthUnit === "cm" ? "ftin" : "cm")}
                className="text-xs text-sky-700 underline underline-offset-2 dark:text-sky-300"
              >
                {t("form.unitToggle")} ·{" "}
                {lengthUnit === "cm" ? t("unit.ftin") : t("unit.cm")}
              </button>
            </div>
            {lengthUnit === "cm" ? (
              <div className="flex items-center gap-2">
                <input
                  id="height-input"
                  className={inputClass}
                  inputMode="decimal"
                  value={cmText}
                  onChange={(e) => setCmText(e.target.value)}
                  placeholder="172"
                />
                <span className="text-sm text-slate-500">{t("unit.cm")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  id="height-input"
                  className={inputClass}
                  inputMode="numeric"
                  value={feetText}
                  onChange={(e) => setFeetText(e.target.value)}
                  placeholder="5"
                  aria-label={t("form.feet")}
                />
                <span className="text-sm text-slate-500">{t("form.feet")}</span>
                <input
                  className={inputClass}
                  inputMode="decimal"
                  value={inchText}
                  onChange={(e) => setInchText(e.target.value)}
                  placeholder="10"
                  aria-label={t("form.inches")}
                />
                <span className="text-sm text-slate-500">{t("form.inches")}</span>
              </div>
            )}
          </div>
        )}

        {metric === "weight" && (
          <>
            <div className="space-y-2">
              <div className="flex items-end justify-between gap-3">
                <label htmlFor="weight-input" className={labelClass}>
                  {t("form.weight")}
                </label>
                <button
                  type="button"
                  onClick={() => setMassUnit(massUnit === "kg" ? "lb" : "kg")}
                  className="text-xs text-sky-700 underline underline-offset-2 dark:text-sky-300"
                >
                  {t("form.unitToggle")} ·{" "}
                  {massUnit === "kg" ? t("unit.lb") : t("unit.kg")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="weight-input"
                  className={inputClass}
                  inputMode="decimal"
                  value={massText}
                  onChange={(e) => setMassText(e.target.value)}
                  placeholder={massUnit === "kg" ? "65" : "145"}
                />
                <span className="text-sm text-slate-500">
                  {massUnit === "kg" ? t("unit.kg") : t("unit.lb")}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bmi-height" className={labelClass}>
                {t("form.height")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="bmi-height"
                  className={inputClass}
                  inputMode="decimal"
                  value={bmiHeightText}
                  onChange={(e) => setBmiHeightText(e.target.value)}
                  placeholder={lengthUnit === "cm" ? "172" : "68"}
                />
                <span className="text-sm text-slate-500">
                  {lengthUnit === "cm" ? t("unit.cm") : t("form.inches")}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("bmi.needHeight")}
              </p>
            </div>
          </>
        )}

        {metric === "income" && (
          <>
            <div className="space-y-2">
              <span className={labelClass}>{t("form.country")}</span>
              <div className="flex flex-wrap gap-2">
                {countryCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setIncomeCountry(code)}
                    aria-pressed={incomeCountry === code}
                    className={`${chipClass} ${incomeCountry === code ? chipOn : chipOff}`}
                  >
                    {t(`country.${code}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="income-input" className={labelClass}>
                {t("income.definition")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="income-input"
                  className={inputClass}
                  inputMode="numeric"
                  value={incomeText}
                  onChange={(e) => setIncomeText(e.target.value)}
                  placeholder={useManwon ? "4000" : "60000"}
                />
                <span className="text-sm whitespace-nowrap text-slate-500">
                  {useManwon ? t("unit.manwon") : currency}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("income.definitionNote")}
              </p>
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {t("form.calculate")}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {committed && results && (
        <section className="space-y-6">
          <h2 className="sr-only">{t("result.title")}</h2>

          {!anyReady && <DataPending t={t} />}

          {primary && primary.state === "ready" && (
            <div className="rounded-2xl border border-slate-200 p-5 text-center dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t("result.inRegion", { region: t(`country.${primary.region}`) })}
              </p>
              <p className="mt-1 text-4xl font-bold text-sky-700 dark:text-sky-300">
                {topPercentText(primary.lowerPercentile, t, locale)}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {t(explanationKey(primary.lowerPercentile))}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t("explain.neutralNote")}
              </p>
            </div>
          )}

          {chart && committed.kind === "body" && (
            <DistributionChart
              data={chart.data}
              value={committed.value}
              label={t("result.chartLabel")}
              valueLabel={formatValue(committed.value)}
              ariaLabel={t("result.chartAria")}
            />
          )}

          <CountryCompareTable
            results={results}
            t={t}
            locale={locale}
            formatValue={formatValue}
          />

          {results.some((r) => r.region === "WORLD" && r.state === "pending") && (
            <DataPending
              t={t}
              title={t("result.worldPending")}
              description={t("result.worldPendingDesc")}
            />
          )}

          {metric === "weight" && committed.kind === "body" && (
            <section className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h3 className="text-sm font-semibold">{t("bmi.title")}</h3>
              {committed.heightCm ? (
                <p className="text-2xl font-bold">
                  {formatBmi(calculateBmi(committed.value, committed.heightCm), locale)}
                </p>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("bmi.needHeight")}
                </p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("bmi.formula")}
              </p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {t("bmi.disclaimer")}
              </p>
            </section>
          )}

          {metric === "income" && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("income.pppNote")}
            </p>
          )}

          <ShareButtons
            url={shareUrl}
            text={`${t("site.name")} — ${t(`metric.${metric}`)}`}
          />
        </section>
      )}
    </div>
  );
}
