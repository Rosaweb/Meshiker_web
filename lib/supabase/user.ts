import { createClient } from "@/lib/supabase/server";

// Renvoie les claims vérifiés (signature du JWT) de l'utilisateur connecté,
// ou null. L'app mobile ouvre une session anonyme par défaut : côté web, une
// session anonyme équivaut à "non connecté".
export async function getSignedInClaims() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  return claims && !claims.is_anonymous ? claims : null;
}
