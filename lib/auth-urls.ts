// URL de retour des emails et du flux OAuth. `lang` indique la langue de
// l'utilisateur : lue par /auth/callback (redirection dans la bonne langue) et
// par le hook d'envoi d'emails (langue de l'email).
export function authCallbackUrl(
  origin: string,
  locale: string,
  nextPath = "",
): string {
  const next = `/${locale}${nextPath}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}&lang=${locale}`;
}
