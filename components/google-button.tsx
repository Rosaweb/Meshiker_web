"use client";

import { useLocale, useTranslations } from "next-intl";
import { authCallbackUrl } from "@/lib/auth-urls";
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
  const t = useTranslations("Login");
  const locale = useLocale();

  async function handleClick() {
    onStart?.();
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authCallbackUrl(window.location.origin, locale) },
    });

    // En cas de succès le navigateur est redirigé vers Google.
    if (error) {
      onError(t("googleFailed"));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={secondaryButtonClass}
    >
      {t("google")}
    </button>
  );
}
