import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslator, isLocale, locales } from "@/lib/i18n";
import { PageShell, Section, staticPageMetadata } from "@/lib/static-page";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMetadata(
    locale,
    "terms",
    "pages.terms.title",
    "pages.terms.purposeBody",
  );
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <PageShell title={t("pages.terms.title")}>
      <Section title={t("pages.terms.purposeTitle")}>
        <p>{t("pages.terms.purposeBody")}</p>
      </Section>
      <Section title={t("pages.terms.accuracyTitle")}>
        <p>{t("pages.terms.accuracyBody")}</p>
      </Section>
      <Section title={t("pages.terms.contentTitle")}>
        <p>{t("pages.terms.contentBody")}</p>
      </Section>
      <Section title={t("pages.terms.changeTitle")}>
        <p>{t("pages.terms.changeBody")}</p>
      </Section>
    </PageShell>
  );
}
