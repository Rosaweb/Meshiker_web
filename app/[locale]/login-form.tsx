"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { authCallbackUrl } from "@/lib/auth-urls";
import { createClient } from "@/lib/supabase/client";
import GoogleButton from "@/components/google-button";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

export default function LoginForm({ initialError }: { initialError?: string }) {
  const t = useTranslations("Login");
  const tf = useTranslations("Fields");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [info, setInfo] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  // Quand Supabase refuse un lien d'email (expiré, déjà utilisé...), il
  // redirige avec l'erreur dans le fragment de l'URL (#error_code=...), que
  // le serveur ne voit jamais : on la lit côté navigateur pour l'expliquer.
  const hashErrorCode = useSyncExternalStore(
    subscribeToHash,
    () => new URLSearchParams(window.location.hash.slice(1)).get("error_code"),
    () => null,
  );
  const [hashDismissed, setHashDismissed] = useState(false);
  const showHashError = !!hashErrorCode && !hashDismissed;
  const hashError = !showHashError
    ? null
    : hashErrorCode === "otp_expired"
      ? t("linkExpired")
      : t("failed");
  const resendVisible =
    canResend || (showHashError && hashErrorCode === "otp_expired");

  function messageFor(code: string | undefined) {
    switch (code) {
      case "invalid_credentials":
        return t("errors.invalid_credentials");
      case "email_not_confirmed":
        return t("errors.email_not_confirmed");
      case "over_request_rate_limit":
      case "over_email_send_rate_limit":
        return t("errors.rate_limited");
      default:
        return t("errors.generic");
    }
  }

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setHashDismissed(true);
    setError(null);
    setInfo(null);
    setCanResend(false);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(messageFor(error.code));
      setCanResend(error.code === "email_not_confirmed");
      setLoading(false);
      return;
    }

    // Re-rend la page serveur avec la nouvelle session (cookies).
    router.refresh();
  }

  async function handleResend() {
    setHashDismissed(true);
    setError(null);
    setInfo(null);
    if (!email) {
      setError(t("resendEnterEmail"));
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: authCallbackUrl(window.location.origin, locale),
      },
    });
    setLoading(false);

    if (error) {
      setError(
        error.code?.startsWith("over_") ? t("errors.rate_limited") : t("resendFailed"),
      );
      return;
    }
    setCanResend(false);
    setInfo(t("resendDone"));
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
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
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {tf("password")}
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        </label>

        {(hashError ?? error) && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {hashError ?? error}
          </p>
        )}
        {info && (
          <p role="status" className="text-sm text-emerald-700 dark:text-emerald-400">
            {info}
          </p>
        )}
        {resendVisible && (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className={`${linkClass} self-start text-sm`}
          >
            {t("resend")}
          </button>
        )}

        <button type="submit" disabled={loading} className={primaryButtonClass}>
          {loading ? t("submitting") : t("submit")}
        </button>

        <Link
          href="/forgot-password"
          className={`${linkClass} self-center text-sm`}
        >
          {t("forgot")}
        </Link>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
        {tf("or")}
        <span className="h-px flex-1 bg-zinc-300 dark:bg-zinc-700" />
      </div>

      <GoogleButton
        disabled={loading}
        onStart={() => {
          setError(null);
          setLoading(true);
        }}
        onError={(message) => {
          setError(message);
          setLoading(false);
        }}
      />

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {t("noAccount")}{" "}
        <Link href="/signup" className={linkClass}>
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
