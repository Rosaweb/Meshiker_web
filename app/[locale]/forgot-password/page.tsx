import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import ForgotForm from "./forgot-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Forgot" });
  return { title: t("metaTitle") };
}

export default async function ForgotPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ expired?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { expired } = await searchParams;
  const t = await getTranslations("Forgot");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <ForgotForm expired={!!expired} />
    </AuthShell>
  );
}
