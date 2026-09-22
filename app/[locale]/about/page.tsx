import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdSlot from "@/components/AdSlot";
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
  return staticPageMetadata(locale, "about", "pages.about.title", "pages.about.intro");
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <>
      <PageShell title={t("pages.about.title")} intro={t("pages.about.intro")}>
        <Section title={t("pages.about.dataTitle")}>
          <p>{t("pages.about.dataBody")}</p>
        </Section>
        <Section title={t("pages.about.privacyTitle")}>
          <p>{t("pages.about.privacyBody")}</p>
        </Section>
        <Section title={t("pages.about.toneTitle")}>
          <p>{t("pages.about.toneBody")}</p>
        </Section>
        <Section title={t("home.howItWorks")}>
          <p>{t("home.howItWorksBody")}</p>
        </Section>
      </PageShell>
      <div className="mt-10">
        <AdSlot id="about-bottom" label={t("ad.label")} />
      </div>
    </>
  );
}
