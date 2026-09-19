import { createClient } from "@/lib/supabase/server";

// Jeton produit par create_trace_share : 16 octets aléatoires en base64
// URL-safe (22 caractères). On accepte une plage large mais on refuse tout ce
// qui ne ressemble pas à un jeton avant de toucher au réseau.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

export type TraceSharePreview = {
  trace_name: string;
  owner_pseudo: string | null;
  expires_at: string;
};

export function isValidShareToken(token: string): boolean {
  return TOKEN_PATTERN.test(token);
}

// Métadonnées d'un partage encore actif, via la fonction SQL
// `get_trace_share_preview` (SECURITY DEFINER, exécutable par anon) : la
// table `trace_shares` elle-même n'est pas lisible publiquement. Renvoie null
// si le jeton est inconnu, expiré ou révoqué — sans distinguer les cas.
export async function getTraceSharePreview(
  token: string,
): Promise<TraceSharePreview | null> {
  if (!isValidShareToken(token)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_trace_share_preview", {
    p_token: token,
  });

  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as TraceSharePreview;
}

// URL publique du fichier GPX dans le bucket Storage "trace-shares".
export function gpxObjectUrl(token: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/trace-shares/${token}.gpx`;
}
