import { auth } from "@/lib/auth/auth";
import { AppError } from "@/lib/validation/api";
import { hasPermission, type AppRole, type Permission } from "@/lib/permissions/rbac";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  roles: AppRole[];
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name ?? session.user.email.split("@")[0],
    image: session.user.image ?? null,
    roles: session.user.roles ?? ["LEARNER"],
  };
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AppError("Bạn cần đăng nhập để thực hiện thao tác này.", 401, "UNAUTHORIZED");
  }
  return user;
}

export async function requireUserPermission(permission: Permission): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser();
  if (!hasPermission(user.roles, permission)) {
    throw new AppError("Bạn không có quyền truy cập chức năng này.", 403, "FORBIDDEN");
  }
  return user;
}
