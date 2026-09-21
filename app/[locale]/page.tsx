import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getSignedInClaims } from "@/lib/supabase/user";
import LocaleSync from "./locale-sync";
import LoginForm from "./login-form";
import PseudoForm from "./pseudo-form";
import SignOutButton from "./sign-out-button";

// Référencement multilingue : la page d'accueil déclare ses équivalents dans
// chaque langue (hreflang). À faire page par page : un `alternates` posé dans
// le layout serait hérité, à tort, par toutes les pages.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((code) => [code, `/${code}`]),
      ),
    },
  };
}

export default async function Home({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { auth_error } = await searchParams;
  const t = await getTranslations("Home");
  const claims = await getSignedInClaims();

  let pseudo = "";
  if (claims) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("id", claims.sub)
      .maybeSingle();
    pseudo = profile?.pseudo ?? "";
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Meshiker</h1>
        <p className="text-zinc-600 dark:text-zinc-400">{t("tagline")}</p>
      </div>

      {claims ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <LocaleSync current={claims.user_metadata?.locale as string | undefined} />
          <div>
            <p className="text-lg">
              {t.rich("greeting", {
                name: pseudo || claims.email || "",
                strong: (chunks) => <span className="font-semibold">{chunks}</span>,
              })}
            </p>
            {claims.email && pseudo && (
              <p className="text-sm text-zinc-500">{claims.email}</p>
            )}
          </div>
          <div className="w-full text-left">
            <PseudoForm userId={claims.sub} initialPseudo={pseudo} />
          </div>
          <SignOutButton />
        </div>
      ) : (
        <LoginForm
          initialError={auth_error ? t("autoSessionFailed") : undefined}
        />
      )}
    </main>
  );
}
