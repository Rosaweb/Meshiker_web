"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { inputClass, primaryButtonClass } from "@/components/form-styles";

const MIN_PASSWORD_LENGTH = 8;

const ERROR_MESSAGES: Record<string, string> = {
  weak_password: "Ce mot de passe est trop faible. Choisissez-en un plus long ou plus varié.",
  same_password: "Le nouveau mot de passe doit être différent de l'ancien.",
};

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

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
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        ERROR_MESSAGES[error.code ?? ""] ??
          "Modification impossible. Demandez un nouveau lien et réessayez.",
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Nouveau mot de passe
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
        {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
