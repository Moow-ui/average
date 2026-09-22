"use client";

const STORAGE_KEY = "theme";

/**
 * 밝은/어두운 화면 전환 버튼. 선택은 이 브라우저에만 저장된다.
 *
 * 아이콘은 상태(state) 없이 CSS로만 바꾼다. 그래야 서버에서 만든 HTML과
 * 브라우저 화면이 어긋나지 않고, 깜빡임도 생기지 않는다.
 */
export default function ThemeToggle({ label }: { label: string }) {
  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      window.localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    } catch {
      // 브라우저가 저장을 막아둔 경우에도 전환 자체는 동작해야 한다.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <span aria-hidden="true" className="dark:hidden">
        ☾
      </span>
      <span aria-hidden="true" className="hidden dark:inline">
        ☀
      </span>
    </button>
  );
}
