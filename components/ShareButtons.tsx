"use client";

import { useState } from "react";
import { useI18n } from "./I18nProvider";

/**
 * 결과 공유 버튼.
 *
 * 공유 링크에는 사용자가 넣은 수치만 담기고 개인정보는 들어가지 않는다.
 * 어떤 값도 우리 서버로 보내지 않는다 (보낼 서버 자체가 없다).
 */
export default function ShareButtons({
  url,
  text,
}: {
  url: string;
  text: string;
}) {
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // 클립보드를 막아둔 브라우저에서는 주소창에서 직접 복사하면 된다.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const links: { key: string; href: string; label: string }[] = [
    {
      key: "x",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      label: t("share.x"),
    },
  ];
  if (locale === "ko") {
    links.push({
      key: "kakao",
      href: `https://story.kakao.com/share?url=${encodedUrl}`,
      label: t("share.kakao"),
    });
  }
  if (locale === "ja") {
    links.push({
      key: "line",
      href: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
      label: t("share.line"),
    });
  }

  const buttonClass =
    "rounded-lg border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800";

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">{t("share.title")}</h2>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copy} className={buttonClass}>
          {copied ? t("share.copied") : t("share.copy")}
        </button>
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            {link.label}
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t("share.note")}
      </p>
    </section>
  );
}
