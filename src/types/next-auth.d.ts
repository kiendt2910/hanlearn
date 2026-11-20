import type { DefaultSession } from "next-auth";
import type { AppRole } from "@/lib/permissions/rbac";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: AppRole[];
    } & DefaultSession["user"];
  }

  interface User {
    roles?: AppRole[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    roles?: AppRole[];
  }
}
