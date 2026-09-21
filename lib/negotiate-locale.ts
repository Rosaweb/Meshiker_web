import { routing, type Locale } from "@/i18n/routing";

// Choisit la langue d'après l'en-tête Accept-Language (ex. "fr-FR,fr;q=0.9,
// en;q=0.8") : première langue gérée par ordre de préférence, sinon la
// langue par défaut. Sert aux pages sans préfixe de langue (/share/...).
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (acceptLanguage) {
    const ranked = acceptLanguage
      .split(",")
      .map((part) => {
        const [tag, ...params] = part.trim().split(";");
        const q = params.find((p) => p.trim().startsWith("q="));
        const weight = q ? Number.parseFloat(q.trim().slice(2)) : 1;
        return { tag: tag.trim().toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight };
      })
      .filter((entry) => entry.tag && entry.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    for (const { tag } of ranked) {
      const base = tag.split("-")[0];
      const match = routing.locales.find((locale) => locale === base);
      if (match) return match;
    }
  }
  return routing.defaultLocale;
}

// `fr`, `fr-FR`... -> `fr` si géré, sinon null.
export function toSupportedLocale(value: string | null | undefined): Locale | null {
  const base = value?.trim().toLowerCase().split(/[-_]/)[0];
  return routing.locales.find((locale) => locale === base) ?? null;
}
