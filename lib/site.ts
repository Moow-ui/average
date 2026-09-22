/**
 * 사이트 주소. canonical, hreflang, OG 이미지 주소를 만들 때 쓴다.
 *
 * 배포 주소가 정해지면 환경변수 NEXT_PUBLIC_SITE_URL 로 바꿀 수 있다.
 * (Cloudflare 대시보드 → Settings → Variables 에서 설정)
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://average.pages.dev"
).replace(/\/$/, "");

/** 사이트 안 경로를 전체 주소로 바꾼다. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
