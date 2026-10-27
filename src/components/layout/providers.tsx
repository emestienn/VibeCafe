"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { Toaster } from "sonner";

import { VibeAiProvider } from "@/components/ai/vibe-ai-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <VibeAiProvider>
            {children}
            <Toaster position="bottom-center" richColors closeButton theme="system" />
          </VibeAiProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
