import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import LocaleSwitcher from "@/components/locale-switcher";
import RootShell from "@/components/root-shell";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });

  return {
    // Base des URL relatives (canonical, hreflang) dans les balises générées.
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://meshiker.com"),
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <RootShell locale={locale}>
      <NextIntlClientProvider>
        {children}
        <footer className="px-6 pb-8">
          <LocaleSwitcher />
        </footer>
      </NextIntlClientProvider>
    </RootShell>
  );
}
