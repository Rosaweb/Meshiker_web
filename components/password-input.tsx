"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { inputClass } from "./form-styles";

// Champ mot de passe avec bouton "œil" pour afficher/masquer les caractères
// (corriger une faute de frappe). À placer dans un <label> qui porte le texte.
export default function PasswordInput({
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const t = useTranslations("Fields");
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative block">
      <input
        type={visible ? "text" : "password"}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        // Évite que les correcteurs/majuscules automatiques touchent au mot de
        // passe une fois affiché en clair.
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        title={visible ? t("hidePassword") : t("showPassword")}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {visible ? (
            <>
              {/* œil barré : masquer */}
              <path d="M3 3l18 18" />
              <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 9.5 7 9.5 7a17 17 0 0 1-3.2 4.1" />
              <path d="M6.6 6.6A16.7 16.7 0 0 0 2.5 12S6 19 12 19a10 10 0 0 0 4.4-1" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </>
          ) : (
            <>
              {/* œil : afficher */}
              <path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </span>
  );
}
