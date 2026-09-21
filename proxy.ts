import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18n = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // 1. Langue : redirige "/" vers "/fr" ou "/en" selon le navigateur.
  const response = handleI18n(request);
  // 2. Session Supabase : rafraîchie et cookies ajoutés à cette même réponse.
  return updateSession(request, response);
}

export const config = {
  // Pages du site (préfixées par la langue). Exclus : les routes qui ne
  // doivent PAS être préfixées — retour d'auth (/auth), pages de partage
  // liées aux QR codes et App Links (/share, /track) —, l'API, les fichiers
  // internes de Next et tout chemin contenant un point (fichiers statiques,
  // .well-known, sitemap.xml...).
  matcher: [
    "/((?!api|trpc|auth(?:/|$)|share(?:/|$)|track(?:/|$)|_next|_vercel|.*\\..*).*)",
  ],
};
