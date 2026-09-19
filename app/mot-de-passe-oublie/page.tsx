import type { Metadata } from "next";
import AuthShell from "@/components/auth-shell";
import ForgotForm from "./forgot-form";

export const metadata: Metadata = { title: "Mot de passe oublié — Meshiker" };

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const { expired } = await searchParams;

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Saisissez l'adresse de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe."
    >
      <ForgotForm expired={!!expired} />
    </AuthShell>
  );
}
