/**
 * 검색엔진용 정보(제목, 설명, canonical, hreflang, 공유 이미지)를 만든다.
 */
import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";
import { absoluteUrl, SITE_URL } from "./site";

/**
 * 언어를 뺀 경로로 각 언어 주소를 만든다.
 * 예: "/height" → { ko: "/ko/height", en: "/en/height", ja: "/ja/height" }
 */
export function localizedPaths(pathWithoutLocale: string): Record<Locale, string> {
  const clean = pathWithoutLocale === "/" ? "" : pathWithoutLocale;
  return {
    ko: `/ko${clean}`,
    en: `/en${clean}`,
    ja: `/ja${clean}`,
  };
}

export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
}: {
  locale: Locale;
  /** 언어를 뺀 경로. 예: "/height/male/180" */
  path: string;
  title: string;
  description: string;
  /** public/og 안의 파일 이름. 예: "ko-height.png" */
  ogImage: string;
}): Metadata {
  const paths = localizedPaths(path);
  const canonical = absoluteUrl(paths[locale]);

  const languages: Record<string, string> = {};
  for (const other of locales) {
    languages[other] = absoluteUrl(paths[other]);
  }
  // 어느 언어에도 해당하지 않는 방문자에게 보여줄 기본 주소.
  languages["x-default"] = absoluteUrl(paths.en);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      images: [{ url: `/og/${ogImage}`, width: 1200, height: 630 }],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og/${ogImage}`],
    },
  };
}

/** 검색 결과에 자주 묻는 질문을 보여주기 위한 구조화 데이터. */
export function faqJsonLd(
  t: (key: string) => string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3].map((n) => ({
      "@type": "Question",
      name: t(`faq.q${n}`),
      acceptedAnswer: { "@type": "Answer", text: t(`faq.a${n}`) },
    })),
  };
}

/** 사이트 자체에 대한 구조화 데이터. */
export function webSiteJsonLd(name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: SITE_URL,
  };
}
