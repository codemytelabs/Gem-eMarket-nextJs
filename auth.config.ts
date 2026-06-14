import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.shopSlug = user.shopSlug;
        token.planName = user.planName;
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
};
