import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth-shell";
import { getSignedInClaims } from "@/lib/supabase/user";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Créer un compte — Meshiker" };

export default async function InscriptionPage() {
  if (await getSignedInClaims()) redirect("/");

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Le même compte fonctionne sur le site et dans l'application."
    >
      <SignupForm />
    </AuthShell>
  );
}
