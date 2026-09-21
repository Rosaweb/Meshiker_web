import { defineRouting } from "next-intl/routing";

// Langues du site. Pour en ajouter une : l'ajouter ici, créer
// messages/<code>.json et son libellé dans "LocaleSwitcher" — et ajouter la
// langue à SUPPORTED_LOCALES de l'Edge Function `send-auth-email` (dépôt de
// l'app) pour que les emails d'authentification suivent.
export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];
