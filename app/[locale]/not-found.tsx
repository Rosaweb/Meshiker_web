import { getTranslations } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import { linkClass } from "@/components/form-styles";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <AuthShell title={t("title")}>
      <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
        {t("body")}
      </p>
      <Link href="/" className={linkClass}>
        {t("home")}
      </Link>
    </AuthShell>
  );
}
