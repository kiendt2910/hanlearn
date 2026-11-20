import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Be_Vietnam_Pro, Noto_Sans_SC } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam",
  display: "swap",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HanLearn — Nền tảng học tiếng Trung cho người Việt",
    template: "%s | HanLearn",
  },
  description:
    "Hệ sinh thái học tiếng Trung chuẩn hóa từ Nền tảng đến HSK 1–6, HSK 3.0 và chuyên ngành với Flashcard FSRS, luyện thi HSK và Gia sư AI.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1D4ED8" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${beVietnamPro.variable} ${notoSansSc.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
