"use client";

import { Compass, Home, Plus, Sparkles, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useVibeAi } from "@/components/ai/vibe-ai-context";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");
  const { open, setOpen } = useVibeAi();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5 items-center">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive("/") ? "text-accent" : "text-muted-foreground",
          )}
        >
          <Home className="size-5" strokeWidth={isActive("/") ? 2.4 : 2} />
          {t("home")}
        </Link>

        <Link
          href="/discover"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive("/discover") ? "text-accent" : "text-muted-foreground",
          )}
        >
          <Compass className="size-5" strokeWidth={isActive("/discover") ? 2.4 : 2} />
          {t("discover")}
        </Link>

        <div className="flex items-center justify-center">
          <button
            onClick={() => setOpen(!open)}
            aria-label={t("vibeAI")}
            className="relative -mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform active:scale-95"
          >
            <Sparkles className="size-6" />
          </button>
        </div>

        <Link
          href="/create"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive("/create") ? "text-accent" : "text-muted-foreground",
          )}
        >
          <Plus className="size-5" strokeWidth={isActive("/create") ? 2.4 : 2} />
          {t("create")}
        </Link>

        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
            isActive("/profile") ? "text-accent" : "text-muted-foreground",
          )}
        >
          <UserRound className="size-5" strokeWidth={isActive("/profile") ? 2.4 : 2} />
          {t("profile")}
        </Link>
      </div>
    </nav>
  );
}
