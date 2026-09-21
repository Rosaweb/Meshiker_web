export const PSEUDO_MIN = 2;
export const PSEUDO_MAX = 30;

// Règles identiques à celles de l'application mobile et à la contrainte
// `profiles_pseudo_length` en base : 2 à 30 caractères, espaces normalisés.
// Renvoie un code d'erreur (traduit par l'appelant, voir messages "Pseudo").
export function validatePseudo(
  raw: string,
):
  | { ok: true; value: string }
  | { ok: false; error: "errorLength" | "errorChars" } {
  const value = raw.trim().replace(/\s+/g, " ");
  const length = [...value].length;

  if (length < PSEUDO_MIN || length > PSEUDO_MAX) {
    return { ok: false, error: "errorLength" };
  }
  // Pas de caractères de contrôle (retours à la ligne, etc.).
  if (/\p{Cc}/u.test(value)) {
    return { ok: false, error: "errorChars" };
  }
  return { ok: true, value };
}
