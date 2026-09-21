import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

// Cadre commun des pages d'authentification : en-tête Meshiker, titre, contenu.
export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-24">
      <div className="flex flex-col items-center gap-2 text-center">
        <Link href="/" className="text-sm font-medium text-zinc-500 hover:underline">
          Meshiker
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="max-w-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        )}
      </div>
      {children}
    </main>
  );
}
