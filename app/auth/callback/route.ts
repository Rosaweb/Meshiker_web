import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { routing } from "@/i18n/routing";
import { toSupportedLocale } from "@/lib/negotiate-locale";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivée unique des retours d'authentification :
// - `code` : flux PKCE (OAuth Google, liens email du template par défaut) ;
// - `token_hash` + `type` : liens des emails envoyés par le hook
//   send-auth-email, qui fonctionnent même si le lien est ouvert sur un autre
//   appareil que celui où la demande a été faite (le flux PKCE, lui, exige le
//   même navigateur).
// Cette route n'est volontairement pas préfixée par la langue : `lang` (posé
// par le site dans l'URL de retour) indique la langue de redirection.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const lang = toSupportedLocale(searchParams.get("lang")) ?? routing.defaultLocale;

  // Uniquement un chemin relatif interne, sinon redirection ouverte possible.
  const nextParam = searchParams.get("next") ?? `/${lang}`;
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : `/${lang}`;

  const supabase = await createClient();
  let succeeded = false;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    succeeded = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    succeeded = !error;
  }

  if (succeeded) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Lien de réinitialisation expiré : on renvoie vers une nouvelle demande.
  const failurePath = next.endsWith("/reset-password")
    ? `/${lang}/forgot-password?expired=1`
    : `/${lang}?auth_error=1`;
  return NextResponse.redirect(`${origin}${failurePath}`);
}
