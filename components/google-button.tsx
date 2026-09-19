"use client";

import { createClient } from "@/lib/supabase/client";
import { secondaryButtonClass } from "./form-styles";

// Flux OAuth par redirection (le web ne passe pas par le SDK natif de l'app).
export default function GoogleButton({
  disabled,
  onStart,
  onError,
}: {
  disabled?: boolean;
  onStart?: () => void;
  onError: (message: string) => void;
}) {
  async function handleClick() {
    onStart?.();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    // En cas de succès le navigateur est redirigé vers Google.
    if (error) {
      onError("Connexion avec Google impossible. Réessayez dans un instant.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={secondaryButtonClass}
    >
      Continuer avec Google
    </button>
  );
}
