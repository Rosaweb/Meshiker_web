import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Liens et navigation qui gèrent le préfixe de langue (/fr, /en...).
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
