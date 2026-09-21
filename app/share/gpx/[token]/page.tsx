import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import { linkClass, primaryButtonClass } from "@/components/form-styles";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getTraceSharePreview } from "@/lib/trace-share";

// Page de repli des liens de partage `https://meshiker.com/share/gpx/{token}`
// (QR code) : l'application installée intercepte normalement le lien (App
// Links) ; sinon on arrive ici. Le jeton est un secret d'accès : pas
// d'indexation, pas de Referer sortant. Langue négociée d'après le navigateur.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Share");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function ShareGpxPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getLocale();
  const t = await getTranslations("Share");
  const share = await getTraceSharePreview(token);

  if (!share) {
    return (
      <AuthShell title={t("unavailableTitle")}>
        <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
          {t("unavailableBody")}
        </p>
        <Link href="/" locale={locale as Locale} className={linkClass}>
          {t("goHome")}
        </Link>
      </AuthShell>
    );
  }

  const date = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "Europe/Paris",
  }).format(new Date(share.expires_at));

  return (
    <AuthShell
      title={t("title")}
      subtitle={share.owner_pseudo ? t("sharedBy", { name: share.owner_pseudo }) : undefined}
    >
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="rounded-xl border border-zinc-200 p-5 text-center dark:border-zinc-800">
          <p className="text-xl font-semibold">{share.trace_name}</p>
          <p className="mt-1 text-sm text-zinc-500">{t("validUntil", { date })}</p>
        </div>

        <a href={`/share/gpx/${token}/download`} className={primaryButtonClass}>
          {t("download")}
        </a>

        <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>{t("appHelp")}</p>
          <p>{t("gpxHelp")}</p>
        </div>
      </div>
    </AuthShell>
  );
}
