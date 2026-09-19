import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Point d'arrivée unique des retours d'authentification :
// - `code` : flux PKCE (OAuth Google, liens email du template par défaut) ;
// - `token_hash` + `type` : liens email du template personnalisé, qui
//   fonctionnent même si le lien est ouvert sur un autre appareil que celui
//   où la demande a été faite (le flux PKCE, lui, exige le même navigateur).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  // Uniquement un chemin relatif interne, sinon redirection ouverte possible.
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

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
  const failurePath = next.startsWith("/reinitialiser-mot-de-passe")
    ? "/mot-de-passe-oublie?expired=1"
    : "/?auth_error=1";
  return NextResponse.redirect(`${origin}${failurePath}`);
}
