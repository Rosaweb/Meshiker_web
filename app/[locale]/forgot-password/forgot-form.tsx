"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";
import { authCallbackUrl } from "@/lib/auth-urls";
import { createClient } from "@/lib/supabase/client";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

export default function ForgotForm({ expired }: { expired?: boolean }) {
  const t = useTranslations("Forgot");
  const tf = useTranslations("Fields");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(expired ? t("expired") : null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl(window.location.origin, locale, "/reset-password"),
    });

    setLoading(false);
    if (error) {
      setError(error.code?.startsWith("over_") ? t("rateLimited") : t("failed"));
      return;
    }
    // Réponse neutre : on ne révèle pas si l'adresse possède un compte.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <p className="text-lg font-medium">{t("sentTitle")}</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t.rich("sentBody", {
            email,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <Link href="/" className={`${linkClass} text-sm`}>
          {t("back")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tf("email")}
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className={primaryButtonClass}>
        {loading ? t("submitting") : t("submit")}
      </button>

      <Link href="/" className={`${linkClass} self-center text-sm`}>
        {t("back")}
      </Link>
    </form>
  );
}
