import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const SELLER_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = session?.user?.role;

  const isSellerRoute = SELLER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const to = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(to, req.url));
  }

  // Protect dashboard — sellers only
  if (isSellerRoute && !session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${pathname}`, req.url),
    );
  }
  if (isSellerRoute && role === "BUYER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect admin — admins only
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
