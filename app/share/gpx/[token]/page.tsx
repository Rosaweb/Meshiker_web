import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/auth-shell";
import { linkClass, primaryButtonClass } from "@/components/form-styles";
import { getTraceSharePreview } from "@/lib/trace-share";

// Page de repli des liens de partage `https://meshiker.com/share/gpx/{token}`
// (QR code) : l'application installée intercepte normalement le lien (App
// Links) ; sinon on arrive ici. Le jeton est un secret d'accès : pas
// d'indexation, pas de Referer sortant.
export const metadata: Metadata = {
  title: "Trace partagée — Meshiker",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeZone: "Europe/Paris",
});

export default async function ShareGpxPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const share = await getTraceSharePreview(token);

  if (!share) {
    return (
      <AuthShell title="Lien indisponible">
        <p className="max-w-sm text-center text-zinc-600 dark:text-zinc-400">
          Ce lien de partage est invalide, a expiré ou a été révoqué. Demandez à
          la personne qui vous l&apos;a envoyé de le générer à nouveau.
        </p>
        <Link href="/" className={linkClass}>
          Aller sur meshiker.com
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Une trace a été partagée avec vous"
      subtitle={
        share.owner_pseudo
          ? `Partagée par ${share.owner_pseudo}`
          : undefined
      }
    >
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="rounded-xl border border-zinc-200 p-5 text-center dark:border-zinc-800">
          <p className="text-xl font-semibold">{share.trace_name}</p>
          <p className="mt-1 text-sm text-zinc-500">
            Lien valable jusqu&apos;au {dateFormat.format(new Date(share.expires_at))}
          </p>
        </div>

        <a
          href={`/share/gpx/${token}/download`}
          className={primaryButtonClass}
        >
          Télécharger le fichier GPX
        </a>

        <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <strong>Vous avez l&apos;application Meshiker ?</strong> Ouvrez ce
            lien depuis votre téléphone, ou, dans l&apos;application, importez la
            trace en collant ce lien ou en scannant le QR code depuis la liste
            des traces.
          </p>
          <p>
            Le fichier GPX est aussi compatible avec la plupart des applications
            de randonnée et GPS.
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
