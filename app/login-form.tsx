"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/google-button";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

// Codes d'erreur Supabase Auth -> messages en français.
const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  email_not_confirmed: "Votre adresse email n'a pas encore été confirmée.",
  over_request_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
  over_email_send_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
};

export default function LoginForm({ initialError }: { initialError?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        ERROR_MESSAGES[error.code ?? ""] ??
          "Connexion impossible. Réessayez dans un instant.",
      );
      setLoading(false);
      return;
    }

    // Re-rend la page serveur avec la nouvelle session (cookies).
    router.refresh();
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
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
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Mot de passe
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Connexion…" : "Se connecter"}
        </button>

        <Link
          href="/mot-de-passe-oublie"
          className={`${linkClass} self-center text-sm`}
        >
          Mot de passe oublié ?
        </Link>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        ou
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
      </div>

      <GoogleButton
        disabled={loading}
        onStart={() => {
          setError(null);
          setLoading(true);
        }}
        onError={(message) => {
          setError(message);
          setLoading(false);
        }}
      />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className={linkClass}>
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
