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
    "privacy",
    "pages.privacy.title",
    "pages.privacy.noCollectBody",
  );
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <PageShell title={t("pages.privacy.title")}>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t("pages.privacy.updated")}: 2026-09-22
      </p>
      <Section title={t("pages.privacy.noCollectTitle")}>
        <p>{t("pages.privacy.noCollectBody")}</p>
      </Section>
      <Section title={t("pages.privacy.storageTitle")}>
        <p>{t("pages.privacy.storageBody")}</p>
      </Section>
      <Section title={t("pages.privacy.adsTitle")}>
        <p>{t("pages.privacy.adsBody")}</p>
      </Section>
      <Section title={t("pages.privacy.analyticsTitle")}>
        <p>{t("pages.privacy.analyticsBody")}</p>
      </Section>
      <Section title={t("nav.contact")}>
        <p>{t("pages.privacy.contactBody")}</p>
      </Section>
    </PageShell>
  );
}
