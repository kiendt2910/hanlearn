import type { NextAuthConfig } from "next-auth";
import type { AppRole } from "@/lib/permissions/rbac";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.roles = (user.roles ?? ["LEARNER"]) as AppRole[];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        session.user.roles = (token.roles ?? ["LEARNER"]) as AppRole[];
      }
      return session;
    },
  },
};
