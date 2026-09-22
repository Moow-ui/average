import type { MetadataRoute } from "next";

// 정적 내보내기(output: export)에서는 이 파일도 빌드할 때 한 번만 만들어진다.
export const dynamic = "force-static";
import { locales } from "@/lib/i18n";
import { metricIds, staticValuesFor } from "@/lib/metrics";
import { absoluteUrl } from "@/lib/site";
import { localizedPaths } from "@/lib/seo";

const staticPages = ["about", "sources", "privacy", "terms", "contact"];
const genders = ["male", "female"] as const;

/** 언어를 뺀 경로 목록을 만든다. */
function allPaths(): string[] {
  const paths = ["/"];
  for (const metric of metricIds) {
    paths.push(`/${metric}`);
    for (const gender of genders) {
      for (const value of staticValuesFor(metric)) {
        paths.push(`/${metric}/${gender}/${value}`);
      }
    }
  }
  paths.push(...staticPages.map((page) => `/${page}`));
  return paths;
}

/**
 * sitemap.xml.
 * 각 주소마다 세 언어를 hreflang 으로 연결한다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return allPaths().flatMap((path) => {
    const paths = localizedPaths(path);
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, absoluteUrl(paths[locale])]),
    );

    return locales.map((locale) => ({
      url: absoluteUrl(paths[locale]),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path.split("/").length > 2 ? 0.5 : 0.8,
      alternates: { languages },
    }));
  });
}
