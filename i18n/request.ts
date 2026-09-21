import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { negotiateLocale } from "@/lib/negotiate-locale";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  // Routes préfixées (/fr/...) : langue de l'URL. Routes sans préfixe (/share/...,
  // exclues du proxy de langue) : négociée d'après le navigateur.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : negotiateLocale((await headers()).get("accept-language"));

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
