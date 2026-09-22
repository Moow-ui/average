/**
 * 사이트 주소. canonical, hreflang, sitemap, OG 이미지 주소를 만들 때 쓴다.
 *
 * Cloudflare Workers 로 배포하면 주소가 다음 둘 중 하나가 된다.
 *   https://average.<내계정이름>.workers.dev
 *   https://내도메인.com  (사용자 지정 도메인을 연결한 경우)
 *
 * 실제 주소를 Cloudflare 대시보드의 빌드 변수
 * NEXT_PUBLIC_SITE_URL 에 넣어 주세요.
 * 넣지 않으면 아래 임시 주소가 쓰이고, 검색엔진에 잘못된 주소가 올라갑니다.
 */
export const FALLBACK_SITE_URL = "https://average.example.workers.dev";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL
).replace(/\/$/, "");

/** 실제 주소가 설정됐는지. 빌드할 때 알려주기 위해 쓴다. */
export const isSiteUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

/** 사이트 안 경로를 전체 주소로 바꾼다. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
