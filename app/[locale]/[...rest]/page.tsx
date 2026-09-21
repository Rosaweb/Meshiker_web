import { notFound } from "next/navigation";

// Toute URL inconnue sous /fr, /en... déclenche la page 404 traduite
// (app/[locale]/not-found.tsx).
export default function CatchAllPage() {
  notFound();
}
