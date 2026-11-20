import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, settings] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId: user.id } }),
    prisma.userSetting.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-xl font-bold text-foreground">Hồ sơ & Cài đặt học tập</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tài khoản: {user.email} • Vai trò: {user.roles.join(", ")}
        </p>
      </div>

      <SettingsForm
        initial={{
          displayName: profile?.displayName ?? user.name,
          dailyGoalMinutes: profile?.dailyGoalMinutes ?? 30,
          showPinyinByDefault: settings?.showPinyinByDefault ?? true,
          showTranslationDefault: settings?.showTranslationDefault ?? true,
          audioPlaybackSpeed: settings?.audioPlaybackSpeed ?? 1.0,
          dailyFlashcardLimit: settings?.dailyFlashcardLimit ?? 40,
          autoGenerateFlashcards: settings?.autoGenerateFlashcards ?? true,
          offlineAutoSync: settings?.offlineAutoSync ?? true,
        }}
      />
    </div>
  );
}
