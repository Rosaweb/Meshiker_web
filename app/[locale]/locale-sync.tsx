"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Enregistre la langue courante du site dans les métadonnées du compte
// (`user_metadata.locale`) : c'est elle qui choisit la langue des emails
// d'authentification (mot de passe oublié, etc.), y compris pour un compte
// créé dans l'app ou via Google. Best-effort, sans rendu.
export default function LocaleSync({ current }: { current?: string }) {
  const locale = useLocale();

  useEffect(() => {
    if (current === locale) return;
    void createClient().auth.updateUser({ data: { locale } });
  }, [current, locale]);

  return null;
}
