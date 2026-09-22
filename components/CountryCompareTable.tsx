import type { Locale, Translator } from "@/lib/i18n";
import { topPercentText } from "@/lib/format";
import type { RegionResult } from "@/lib/results";

/**
 * 한·미·일·세계를 한 표에서 비교한다.
 * 결과 페이지마다 숫자만 바뀌지 않도록 하는 핵심 내용이기도 하다.
 */
export default function CountryCompareTable({
  results,
  t,
  locale,
  formatValue,
}: {
  results: RegionResult[];
  t: Translator;
  locale: Locale;
  /** 평균·차이를 그 항목에 맞는 단위로 바꿔주는 함수. */
  formatValue: (value: number) => string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-sm">
        <caption className="sr-only">{t("compare.title")}</caption>
        <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">
              {t("compare.region")}
            </th>
            <th scope="col" className="px-3 py-2 font-medium">
              {t("compare.rank")}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              {t("compare.average")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {results.map((result) => (
            <tr key={result.region}>
              <th scope="row" className="px-3 py-3 text-left font-medium">
                {t(`country.${result.region}`)}
              </th>
              {result.state === "ready" ? (
                <>
                  <td className="px-3 py-3 font-semibold text-sky-700 dark:text-sky-300">
                    {topPercentText(result.lowerPercentile, t, locale)}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-400">
                    {result.mean === undefined ? "—" : formatValue(result.mean)}
                  </td>
                </>
              ) : (
                <td
                  colSpan={2}
                  className="px-3 py-3 text-right text-slate-500 dark:text-slate-400"
                >
                  {t("compare.pending")}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
