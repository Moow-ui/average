"use client";

import { useState, useSyncExternalStore } from "react";
import { useI18n } from "./I18nProvider";

const STORAGE_KEY = "cookie-consent";

/**
 * 광고를 붙이기 전까지는 쿠키를 하나도 쓰지 않으므로 배너를 띄우지 않는다.
 * 광고를 켤 때 이 값을 "유럽·영국에서 접속했는가" 판별 결과로 바꾸면 된다.
 */
const ADS_ENABLED = false;

/** 이 브라우저가 이미 답을 했는지 읽는다. 저장이 막혀 있으면 묻지 않는다. */
function hasDecided(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return true;
  }
}

const noopSubscribe = () => () => {};

/**
 * 유럽·영국 방문자용 쿠키 동의 배너의 "틀".
 * 동의 여부는 이 브라우저에만 저장되고 어디로도 전송되지 않는다.
 */
export default function CookieConsent() {
  const { t } = useI18n();
  const [dismissed, setDismissed] = useState(false);

  // 서버에서 만든 HTML 에서는 배너를 숨긴 상태로 두고, 브라우저에서만 판단한다.
  const decided = useSyncExternalStore(noopSubscribe, hasDecided, () => true);

  function decide(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // 저장이 막혀 있어도 배너는 닫힌다.
    }
    setDismissed(true);
  }

  if (!ADS_ENABLED || decided || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookie.title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t("cookie.body")}
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
          >
            {t("cookie.reject")}
          </button>
          <button
            type="button"
            onClick={() => decide("accepted")}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
