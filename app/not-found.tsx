import Link from "next/link";
import "./globals.css";
import { defaultLocale, getTranslator } from "@/lib/i18n";

/**
 * 없는 주소로 들어왔을 때 보여줄 화면.
 * 정적 배포에서는 out/404.html 로 만들어지고 Cloudflare 가 이걸 띄운다.
 *
 * 이 페이지는 언어를 알 수 없으므로 기본 언어(한국어)로 보여주고,
 * 세 언어 홈으로 가는 링크를 모두 둔다.
 */
export default function NotFound() {
  const t = getTranslator(defaultLocale);

  return (
    <html lang="ko">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-white p-6 text-center text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="space-y-2">
          <p className="text-5xl font-bold">404</p>
          <h1 className="text-lg font-semibold">{t("notFound.title")}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t("notFound.description")}
          </p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/ko"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            한국어
          </Link>
          <Link
            href="/en"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            English
          </Link>
          <Link
            href="/ja"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            日本語
          </Link>
        </nav>
      </body>
    </html>
  );
}
