import type { MetadataRoute } from "next";

// 정적 내보내기(output: export)에서는 이 파일도 빌드할 때 한 번만 만들어진다.
export const dynamic = "force-static";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
