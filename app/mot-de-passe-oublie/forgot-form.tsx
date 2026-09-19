"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

export default function ForgotForm({ expired }: { expired?: boolean }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(
    expired ? "Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau." : null,
  );
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reinitialiser-mot-de-passe`,
    });

    setLoading(false);
    if (error) {
      const limited = error.code?.startsWith("over_");
      setError(
        limited
          ? "Trop de demandes. Réessayez dans quelques minutes."
          : "Envoi impossible pour le moment. Réessayez dans un instant.",
      );
      return;
    }
    // Réponse neutre : on ne révèle pas si l'adresse possède un compte.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <p className="text-lg font-medium">Vérifiez votre boîte mail</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Si un compte existe pour <strong>{email}</strong>, un email contenant un
          lien de réinitialisation vient d&apos;être envoyé. Le lien est valable
          une heure.
        </p>
        <Link href="/" className={`${linkClass} text-sm`}>
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Email
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? "Envoi…" : "Envoyer le lien"}
      </button>

      <Link href="/" className={`${linkClass} self-center text-sm`}>
        Retour à la connexion
      </Link>
    </form>
  );
}
