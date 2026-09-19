"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PSEUDO_MAX, validatePseudo } from "@/lib/pseudo";
import { inputClass, primaryButtonClass } from "@/components/form-styles";

// Édition du pseudo (champ `profiles.pseudo`, partagé avec l'application).
// La policy RLS "profiles update" limite la modification à sa propre ligne.
export default function PseudoForm({
  userId,
  initialPseudo,
}: {
  userId: string;
  initialPseudo: string;
}) {
  const router = useRouter();
  const [pseudo, setPseudo] = useState(initialPseudo);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const checked = validatePseudo(pseudo);
    if (!checked.ok) return setError(checked.error);

    setLoading(true);
    const supabase = createClient();
    // `.single()` échoue si aucune ligne n'est modifiée (RLS silencieux).
    const { error } = await supabase
      .from("profiles")
      .update({ pseudo: checked.value })
      .eq("id", userId)
      .select("pseudo")
      .single();
    setLoading(false);

    if (error) {
      setError("Impossible d'enregistrer le pseudo. Réessayez dans un instant.");
      return;
    }
    setPseudo(checked.value);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Pseudo
        <input
          type="text"
          required
          maxLength={PSEUDO_MAX}
          autoComplete="nickname"
          value={pseudo}
          onChange={(e) => {
            setPseudo(e.target.value);
            setSaved(false);
          }}
          className={inputClass}
        />
        <span className="text-xs font-normal text-zinc-500">
          Visible par les autres randonneurs (partage de position, traces
          partagées).
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
          Pseudo enregistré.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || pseudo.trim() === initialPseudo}
        className={primaryButtonClass}
      >
        {loading ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
