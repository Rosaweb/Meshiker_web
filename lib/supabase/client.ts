import { createBrowserClient } from "@supabase/ssr";

// Client Supabase côté navigateur (composants "use client").
// La clé anon est publique par conception : la sécurité repose sur le RLS.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
