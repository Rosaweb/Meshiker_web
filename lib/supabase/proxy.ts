import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit le token Supabase à chaque requête et recopie les cookies mis à
// jour sur la requête (pour les Server Components) et sur la réponse (pour le
// navigateur). Aucune décision d'autorisation ici : elle se fait près des
// données, avec getClaims()/getUser() côté serveur et le RLS en base.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Ne rien insérer entre createServerClient et getClaims() : c'est cet appel
  // qui déclenche le rafraîchissement de la session.
  await supabase.auth.getClaims();

  return response;
}
