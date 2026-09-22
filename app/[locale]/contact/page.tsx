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
    "contact",
    "pages.contact.title",
    "pages.contact.intro",
  );
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getTranslator(locale);

  return (
    <PageShell title={t("pages.contact.title")} intro={t("pages.contact.intro")}>
      <Section title={t("pages.contact.emailLabel")}>
        {/* 메일 주소가 정해지면 여기만 바꾸면 된다. */}
        <p>{t("pages.contact.emailPending")}</p>
      </Section>
      <Section title={t("pages.contact.dataFixTitle")}>
        <p>{t("pages.contact.dataFixBody")}</p>
      </Section>
    </PageShell>
  );
}
