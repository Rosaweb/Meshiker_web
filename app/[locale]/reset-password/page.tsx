import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import { linkClass } from "@/components/form-styles";
import { Link } from "@/i18n/navigation";
import { getSignedInClaims } from "@/lib/supabase/user";
import ResetForm from "./reset-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Reset" });
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Reset");

  // On n'arrive ici que via le lien de l'email (/auth/callback ouvre une
  // session de récupération) ; sans session il n'y a rien à modifier.
  const claims = await getSignedInClaims();

  if (!claims) {
    return (
      <AuthShell title={t("invalidTitle")}>
        <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
          {t("invalidBody")}{" "}
          <Link href="/forgot-password" className={linkClass}>
            {t("requestNew")}
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <ResetForm />
    </AuthShell>
  );
}
