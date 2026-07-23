import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";

const { auth } = NextAuth(authConfig);
const handleI18nRouting = createMiddleware(routing);

const SELLER_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];
const BUYER_ONLY_ROUTES = ["/seller-registration"];

// Route-protection below is written against locale-free paths (e.g.
// "/dashboard"), so strip the "/en" | "/ta" | "/si" prefix next-intl adds
// before matching, and re-add it whenever we build a redirect URL.
function splitLocale(pathname: string) {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (match && (routing.locales as readonly string[]).includes(match[1])) {
    return { locale: match[1], pathname: match[2] ?? "/" };
  }
  return { locale: routing.defaultLocale, pathname };
}

export default auth((req) => {
  // Resolves/redirects to add a locale prefix when it's missing. When it's
  // already present this just returns NextResponse.next() (plus whatever
  // locale-detection cookie/headers next-intl needs) — nothing to override.
  const intlResponse = handleI18nRouting(req);
  const isRedirect = intlResponse.status >= 300 && intlResponse.status < 400;
  if (isRedirect) {
    return intlResponse;
  }

  const { locale, pathname } = splitLocale(req.nextUrl.pathname);
  const session = req.auth;
  const role = session?.user?.role;

  const isSellerRoute = SELLER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isBuyerOnlyRoute = BUYER_ONLY_ROUTES.some((r) =>
    pathname.startsWith(r),
  );

  const withLocale = (path: string) => new URL(`/${locale}${path}`, req.url);

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    const to = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(withLocale(to));
  }

  // Seller registration: guests → login, existing sellers → dashboard
  if (isBuyerOnlyRoute) {
    if (!session) {
      return NextResponse.redirect(
        withLocale(`/login?next=/seller-registration`),
      );
    }
    if (role !== "BUYER") {
      return NextResponse.redirect(withLocale("/dashboard"));
    }
  }

  // Protect dashboard — sellers only
  if (isSellerRoute && !session) {
    return NextResponse.redirect(withLocale(`/login?callbackUrl=${pathname}`));
  }
  if (isSellerRoute && role === "BUYER") {
    return NextResponse.redirect(withLocale("/"));
  }

  // Protect admin — admins only
  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(withLocale("/"));
  }

  return intlResponse;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico)$).*)",
  ],
};
