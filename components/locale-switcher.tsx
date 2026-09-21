"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Sélecteur de langue : garde la page courante, change seulement la langue.
export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav aria-label={t("label")} className="flex justify-center gap-4 text-sm">
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-current={code === locale ? "true" : undefined}
          onClick={() => router.replace(pathname, { locale: code })}
          className={
            code === locale
              ? "font-semibold text-zinc-900 dark:text-zinc-50"
              : "text-zinc-500 hover:underline"
          }
        >
          {t(code)}
        </button>
      ))}
    </nav>
  );
}
