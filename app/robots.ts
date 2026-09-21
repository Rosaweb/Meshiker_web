import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://meshiker.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Jetons d'accès secrets et retours d'authentification.
      disallow: ["/share/", "/track/", "/auth/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
