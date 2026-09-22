import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collectCitations, collectPendingItems } from "@/lib/data";
import { getTranslator, isLocale, locales } from "@/lib/i18n";
import { PageShell, staticPageMetadata } from "@/lib/static-page";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(
    locale,
    "sources",
    "pages.sources.title",
    "pages.sources.intro",
  );
}

/**
 * 데이터 출처 페이지.
 * 확인이 끝난 자료와, 아직 확인 중인 자료를 모두 보여준다.
 */
export default async function SourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  const citations = collectCitations();
  const pending = collectPendingItems();

  return (
    <PageShell title={t("pages.sources.title")} intro={t("pages.sources.intro")}>
      {citations.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {t("pages.sources.empty")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  {t("pages.sources.source")}
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  {t("pages.sources.year")}
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  {t("pages.sources.license")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {citations.map((citation) => (
                <tr key={`${citation.source}-${citation.year}`}>
                  <td className="px-3 py-3">
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 underline underline-offset-2 dark:text-sky-300"
                    >
                      {citation.source}
                    </a>
                  </td>
                  <td className="px-3 py-3">{citation.year}</td>
                  <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                    {citation.license ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pending.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">
            {t("pages.sources.pendingTitle")}
          </h2>
          <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
            {pending.map((item) => (
              <li key={item.where} className="flex flex-wrap gap-x-2">
                <span className="font-mono text-xs text-slate-500">
                  {item.where}
                </span>
                <span>{t("dataStatus.pending")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
