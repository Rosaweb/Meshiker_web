"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { authCallbackUrl } from "@/lib/auth-urls";
import { createClient } from "@/lib/supabase/client";
import { PSEUDO_MAX, PSEUDO_MIN, validatePseudo } from "@/lib/pseudo";
import PasswordInput from "@/components/password-input";
import GoogleButton from "@/components/google-button";
import {
  inputClass,
  linkClass,
  primaryButtonClass,
} from "@/components/form-styles";

const MIN_PASSWORD_LENGTH = 8;

export default function SignupForm() {
  const t = useTranslations("Signup");
  const tf = useTranslations("Fields");
  const tp = useTranslations("Pseudo");
  const tw = useTranslations("Password");
  const locale = useLocale();
  const router = useRouter();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  function messageFor(code: string | undefined) {
    switch (code) {
      case "weak_password":
        return t("errors.weak_password");
      case "user_already_exists":
      case "email_exists":
        return t("errors.already_exists");
      case "email_address_invalid":
        return t("errors.email_address_invalid");
      case "signup_disabled":
        return t("errors.signup_disabled");
      case "over_request_rate_limit":
      case "over_email_send_rate_limit":
        return t("errors.rate_limited");
      default:
        return t("errors.generic");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const checked = validatePseudo(pseudo);
    if (!checked.ok) {
      return setError(tp(checked.error, { min: PSEUDO_MIN, max: PSEUDO_MAX }));
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(tw("tooShort", { min: MIN_PASSWORD_LENGTH }));
    }
    if (password !== confirm) {
      return setError(tw("mismatch"));
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Le trigger handle_new_user lit `pseudo` dans les métadonnées ;
        // `locale` choisit la langue des emails (hook send-auth-email).
        data: { pseudo: checked.value, locale },
        emailRedirectTo: authCallbackUrl(window.location.origin, locale),
      },
    });

    if (error) {
      setError(messageFor(error.code));
      setLoading(false);
      return;
    }

    // Confirmation d'email désactivée côté Supabase : session immédiate.
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    // Message volontairement neutre : Supabase ne révèle pas si l'adresse
    // possède déjà un compte (protection contre l'énumération).
    setSentTo(email);
    setLoading(false);
  }

  if (sentTo) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-4 text-center">
        <p className="text-lg font-medium">{t("checkTitle")}</p>
        <p className="text-zinc-600 dark:text-zinc-400">
          {t.rich("checkBody", {
            email: sentTo,
            strong: (chunks) => <strong>{chunks}</strong>,
          })}
        </p>
        <p className="text-sm text-zinc-500">
          {t("checkHelp")}{" "}
          <Link href="/forgot-password" className={linkClass}>
            {t("resetLink")}
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {tf("pseudo")}
          <input
            type="text"
            required
            maxLength={PSEUDO_MAX}
            autoComplete="nickname"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className={inputClass}
          />
          <span className="text-xs font-normal text-zinc-500">
            {tf("pseudoHint")}
          </span>
        </label>
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
          <PasswordInput
            minLength={MIN_PASSWORD_LENGTH}
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {tf("confirmPassword")}
          <PasswordInput
            autoComplete="new-password"
            value={confirm}
            onChange={setConfirm}
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
        {t("haveAccount")}{" "}
        <Link href="/" className={linkClass}>
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
