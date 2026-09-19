import { createClient } from "@/lib/supabase/server";
import { getSignedInClaims } from "@/lib/supabase/user";
import LoginForm from "./login-form";
import PseudoForm from "./pseudo-form";
import SignOutButton from "./sign-out-button";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const { auth_error } = await searchParams;
  const claims = await getSignedInClaims();

  let pseudo = "";
  if (claims) {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("id", claims.sub)
      .maybeSingle();
    pseudo = profile?.pseudo ?? "";
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Meshiker</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Navigation et randonnée, en ligne comme hors ligne.
        </p>
      </div>

      {claims ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <div>
            <p className="text-lg">
              Bonjour{" "}
              <span className="font-semibold">{pseudo || claims.email}</span>
            </p>
            {claims.email && pseudo && (
              <p className="text-sm text-zinc-500">{claims.email}</p>
            )}
          </div>
          <div className="w-full text-left">
            <PseudoForm userId={claims.sub} initialPseudo={pseudo} />
          </div>
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
