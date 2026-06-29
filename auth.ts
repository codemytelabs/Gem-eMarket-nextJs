import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { rateLimit } from "@/lib/redis";
import { getClientIp } from "@/lib/utils/client-ip";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    // Google/Facebook both verify the email themselves before allowing
    // sign-in, so it's safe to link a new OAuth identity onto an existing
    // password-based account that shares the same email — without this,
    // NextAuth refuses the link and bounces to an error page instead.
    Google({
      clientId: process.env.AUTH_GOOGLE_ID as string,
      clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID as string,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET as string,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const ip = getClientIp(req);
        const { allowed } = await rateLimit(`login:${ip}`, 10, 900);
        if (!allowed) {
          throw new Error("Too many login attempts. Try again later.");
        }

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
          include: { subscription: { include: { plan: true } } },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          shopSlug: user.shopSlug,
          planName: user.subscription?.plan.name ?? "free",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.shopSlug = user.shopSlug;
        // OAuth sign-ins return the adapter's plain User row, which has no
        // synthesized planName (that only exists for Credentials, derived
        // from the subscription relation) — a brand-new user has no
        // subscription row yet either way, so "free" is the correct default.
        token.planName = user.planName ?? "free";
      }
      // Re-read from DB whenever the client calls session.update()
      if (trigger === "update") {
        const fresh = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            shopSlug: true,
            isVerified: true,
            subscription: { include: { plan: true } },
          },
        });
        if (fresh) {
          token.role = fresh.role;
          token.shopSlug = fresh.shopSlug;
          token.isVerified = fresh.isVerified;
          token.planName = fresh.subscription?.plan.name ?? "free";
        }
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.isVerified = token.isVerified as boolean;
      session.user.shopSlug = token.shopSlug as string | null;
      session.user.planName = token.planName as string;
      return session;
    },
  },
});

declare module "next-auth" {
  interface User {
    role: string;
    isVerified: boolean;
    shopSlug: string | null;
    // Optional: OAuth-adapter-created users don't have this synthesized
    // field until the jwt callback defaults it (see callbacks.jwt above).
    planName?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      isVerified: boolean;
      shopSlug: string | null;
      planName: string;
    };
  }
}
