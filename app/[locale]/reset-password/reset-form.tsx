"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import PasswordInput from "@/components/password-input";
import { primaryButtonClass } from "@/components/form-styles";

const MIN_PASSWORD_LENGTH = 8;

export default function ResetForm() {
  const t = useTranslations("Reset");
  const tf = useTranslations("Fields");
  const tw = useTranslations("Password");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      return setError(tw("tooShort", { min: MIN_PASSWORD_LENGTH }));
    }
    if (password !== confirm) {
      return setError(tw("mismatch"));
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        error.code === "weak_password"
          ? t("errors.weak_password")
          : error.code === "same_password"
            ? t("errors.same_password")
            : t("errors.generic"),
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {tf("newPassword")}
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
  );
}
