import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

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
        token.planName = user.planName;
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
    planName: string;
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
