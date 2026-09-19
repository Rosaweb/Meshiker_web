import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Retour du flux OAuth (Google) et des liens email (confirmation, etc.) :
// échange le code PKCE contre une session, puis redirige.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Uniquement un chemin relatif interne, sinon redirection ouverte possible.
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
