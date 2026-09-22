import type { Translator } from "@/lib/i18n";

/**
 * 자료가 아직 없을 때 보여주는 안내.
 * 값을 지어내지 않고 준비 중임을 분명히 밝힌다.
 */
export default function DataPending({
  t,
  title,
  description,
}: {
  t: Translator;
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="font-semibold">{title ?? t("common.dataPending")}</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {description ?? t("common.dataPendingDesc")}
      </p>
    </div>
  );
}
