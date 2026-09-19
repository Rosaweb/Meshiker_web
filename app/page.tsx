import { createClient } from "@/lib/supabase/server";
import LoginForm from "./login-form";
import SignOutButton from "./sign-out-button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const { auth_error } = await searchParams;
  const supabase = await createClient();

  // getClaims() vérifie la signature du JWT (contrairement à getSession()
  // dont les cookies ne sont pas fiables côté serveur).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // L'app mobile ouvre une session anonyme par défaut : côté web, une session
  // anonyme équivaut à "non connecté".
  const isSignedIn = !!claims && !claims.is_anonymous;

  let pseudo: string | null = null;
  if (isSignedIn) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("id", claims.sub)
      .maybeSingle();
    pseudo = profile?.pseudo ?? null;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Meshiker</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Navigation et randonnée, en ligne comme hors ligne.
        </p>
      </div>

      {isSignedIn ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg">
            Bonjour <span className="font-semibold">{pseudo ?? claims.email}</span>
          </p>
          <SignOutButton />
        </div>
      ) : (
        <LoginForm
          initialError={
            auth_error ? "La connexion a échoué. Veuillez réessayer." : undefined
          }
        />
      )}
    </main>
  );
}
