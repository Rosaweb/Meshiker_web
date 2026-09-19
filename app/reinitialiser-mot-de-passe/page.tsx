import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { linkClass } from "@/components/form-styles";
import { getSignedInClaims } from "@/lib/supabase/user";
import ResetForm from "./reset-form";

export const metadata: Metadata = { title: "Nouveau mot de passe — Meshiker" };

export default async function ReinitialiserMotDePassePage() {
  // On n'arrive ici que via le lien de l'email (/auth/callback ouvre une
  // session de récupération) ; sans session il n'y a rien à modifier.
  const claims = await getSignedInClaims();

  if (!claims) {
    return (
      <AuthShell title="Lien invalide">
        <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
          Ce lien a expiré ou n&apos;est plus valable.{" "}
          <Link href="/mot-de-passe-oublie" className={linkClass}>
            Demander un nouveau lien
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un nouveau mot de passe pour votre compte."
    >
      <ResetForm />
    </AuthShell>
  );
}
