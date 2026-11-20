import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { canAccessAdminArea } from "@/lib/permissions/rbac";
import { AdminNavBar } from "@/components/navigation/AdminNavBar";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!canAccessAdminArea(user.roles)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavBar user={user} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
