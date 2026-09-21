import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import RootShell from "@/components/root-shell";

// Racine des pages SANS préfixe de langue (/share/...) : leurs URL sont
// figées par les QR codes et les App Links. La langue est négociée d'après le
// navigateur (voir i18n/request.ts).
export default async function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <RootShell locale={locale}>
      <NextIntlClientProvider>{children}</NextIntlClientProvider>
    </RootShell>
  );
}
