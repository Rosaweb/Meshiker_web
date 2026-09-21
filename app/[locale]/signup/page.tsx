import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import { redirect } from "@/i18n/navigation";
import { getSignedInClaims } from "@/lib/supabase/user";
import SignupForm from "./signup-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Signup" });
  return { title: t("metaTitle") };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getSignedInClaims()) redirect({ href: "/", locale });

  const t = await getTranslations("Signup");
  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <SignupForm />
    </AuthShell>
  );
}
