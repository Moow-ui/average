import Link from "next/link";
import type { Locale, Translator } from "@/lib/i18n";

const pages = ["about", "sources", "privacy", "terms", "contact"] as const;

export default function SiteFooter({
  locale,
  t,
}: {
  locale: Locale;
  t: Translator;
}) {
  return (
    <footer className="mt-auto border-t border-slate-200 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <nav aria-label={t("nav.menu")}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {pages.map((page) => (
              <li key={page}>
                <Link
                  href={`/${locale}/${page}`}
                  className="underline-offset-2 hover:underline"
                >
                  {t(`nav.${page}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>{t("home.privacyNote")}</p>
        <p>{t("footer.disclaimer")}</p>
      </div>
    </footer>
  );
}
