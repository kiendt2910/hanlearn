"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            className: "font-sans text-sm",
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
