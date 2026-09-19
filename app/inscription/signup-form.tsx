"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PSEUDO_MAX, validatePseudo } from "@/lib/pseudo";
import GoogleButton from "@/components/google-button";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<string, string> = {
  weak_password: "Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.",
  user_already_exists: "Un compte existe déjà avec cette adresse. Essayez de vous connecter.",
  email_exists: "Un compte existe déjà avec cette adresse. Essayez de vous connecter.",
  email_address_invalid: "Cette adresse email n'est pas valide.",
  signup_disabled: "Les inscriptions sont momentanément fermées.",
  over_request_rate_limit: "Trop de tentatives. Réessayez dans quelques minutes.",
  over_email_send_rate_limit: "Trop d'emails envoyés. Réessayez dans quelques minutes.",
};

export default function SignupForm() {
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const checked = validatePseudo(pseudo);
    if (!checked.ok) return setError(checked.error);
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
      );
    }
    if (password !== confirm) {
      return setError("Les deux mots de passe ne sont pas identiques.");
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Le trigger handle_new_user lit `pseudo` dans les métadonnées.
        data: { pseudo: checked.value },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      setError(
        ERROR_MESSAGES[error.code ?? ""] ??
          "Inscription impossible. Réessayez dans un instant.",
      );
      setLoading(false);
      return;
    }

    // Confirmation d'email désactivée côté Supabase : session immédiate.
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    // Message volontairement neutre : Supabase ne révèle pas si l'adresse
    // possède déjà un compte (protection contre l'énumération).
    setSentTo(email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <p className="text-lg font-medium">Vérifiez votre boîte mail</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          Si un compte peut être créé avec <strong>{sentTo}</strong>, un email de
          confirmation vient de vous être envoyé. Cliquez sur le lien qu&apos;il
          contient pour activer votre compte.
        </p>
        <p className="text-sm text-zinc-500">
          Rien reçu ? Regardez dans vos courriers indésirables. Vous avez déjà un
          compte ?{" "}
          <Link href="/mot-de-passe-oublie" className={linkClass}>
            Réinitialiser le mot de passe
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Pseudo
          <input
            type="text"
            required
            maxLength={PSEUDO_MAX}
            autoComplete="nickname"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className={inputClass}
          />
          <span className="text-xs font-normal text-zinc-500">
            Visible par les autres randonneurs (partage de position, traces
            partagées).
          </span>
        </label>
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
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Confirmer le mot de passe
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? "Création du compte…" : "Créer mon compte"}
        </button>
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
        Déjà un compte ?{" "}
        <Link href="/" className={linkClass}>
          Se connecter
        </Link>
      </p>
    </div>
  );
}
