import {
  getTraceSharePreview,
  gpxObjectUrl,
  isValidShareToken,
} from "@/lib/trace-share";

// Téléchargement du GPX avec un nom de fichier lisible : un lien direct vers
// le Storage Supabase (autre origine) ignorerait l'attribut `download`.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!isValidShareToken(token)) {
    return new Response("Not found", { status: 404 });
  }

  const share = await getTraceSharePreview(token);
  if (!share) return new Response("Not found", { status: 404 });

  // Le Storage renvoie parfois 400 (et non 404) pour un objet absent : tout
  // statut non-OK est traité comme "introuvable".
  const upstream = await fetch(gpxObjectUrl(token), { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  const safeName =
    share.trace_name.replace(/[^\p{L}\p{N} _-]/gu, "_").trim() || "trace";
  const asciiName = safeName.replace(/[^\x20-\x7E]/g, "_");

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/gpx+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${asciiName}.gpx"; filename*=UTF-8''${encodeURIComponent(safeName)}.gpx`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}
