"use client";

import { useSession } from "next-auth/react";
import { USER_ROLES } from "@/types/enums/role.enum";
import { getSellerCta } from "@/lib/seller-cta";

// Single source of truth for "become a seller / go to my dashboard" links —
// previously duplicated (with slightly different variable names) across
// Navigation, Footer, and the About page.
export function useSellerCta() {
  const { data: session } = useSession();
  const isSeller = session?.user?.role === USER_ROLES.SELLER;
  return { isSeller, ...getSellerCta(isSeller) };
}
