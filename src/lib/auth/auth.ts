import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { authConfig } from "@/lib/auth/auth.config";
import type { AppRole } from "@/lib/permissions/rbac";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Email & Mật khẩu",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            profile: { select: { displayName: true, avatarUrl: true } },
            userRoles: { include: { role: { select: { code: true } } } },
          },
        });

        if (!user || !user.isActive || !user.passwordHash) {
          return null;
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
          return null;
        }

        await prisma.user
          .update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          })
          .catch(() => {
            // Non-blocking audit timestamp update
          });

        const roles = user.userRoles.map((ur) => ur.role.code as AppRole);

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName ?? user.email.split("@")[0],
          image: user.profile?.avatarUrl ?? null,
          roles: roles.length > 0 ? roles : ["LEARNER"],
        };
      },
    }),
  ],
});
