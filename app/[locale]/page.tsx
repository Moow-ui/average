import Link from "next/link";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
import { getTranslator, isLocale } from "@/lib/i18n";

const metrics = ["height", "weight", "income"] as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("site.tagline")}</h1>
        <p className="text-slate-600 dark:text-slate-300">
          {t("site.description")}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("home.chooseMetric")}</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
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

      {/* 광고는 입력·버튼에서 충분히 떨어진 본문 아래쪽에만 둔다. */}
      <AdSlot id="home-bottom" />
    </div>
  );
}
