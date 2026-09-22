/**
 * 사이트 주소가 설정됐는지 빌드할 때 알려준다.
 *
 * 주소가 없으면 canonical, hreflang, sitemap, OG 이미지에 임시 주소가 들어가서
 * 검색엔진이 엉뚱한 주소를 읽게 된다. 빌드를 멈추지는 않고 눈에 띄게 알려만 준다.
 */
import { FALLBACK_SITE_URL, SITE_URL, isSiteUrlConfigured } from "../lib/site";

if (isSiteUrlConfigured) {
  console.log(`🔗 사이트 주소: ${SITE_URL}`);
} else {
  console.warn(
    [
      "",
      "⚠️  NEXT_PUBLIC_SITE_URL 이 설정되지 않아 임시 주소를 씁니다.",
      `   지금 주소: ${FALLBACK_SITE_URL}`,
      "",
      "   Cloudflare 대시보드 → Workers & Pages → average →",
      "   Settings → Variables and Secrets → Build variables 에",
      "   NEXT_PUBLIC_SITE_URL = https://실제주소  를 넣어 주세요.",
      "   (이 값이 canonical·hreflang·sitemap·공유 이미지 주소에 쓰입니다)",
      "",
    ].join("\n"),
  );
}
