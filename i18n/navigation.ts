import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware drop-in replacements for next/link and next/navigation.
// Use these instead of the plain Next.js ones anywhere a link/route needs
// to stay within the current locale.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
