import { Compass, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FindVibeButton } from "@/components/ai/find-vibe-button";
import { auth } from "@/lib/auth";

import { SignInButton, UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";

export async function Navbar() {
  const [session, t] = await Promise.all([auth(), getTranslations("nav")]);

  const NAV_LINKS = [
    { href: "/discover", label: t("discover") },
    { href: "/community", label: t("community") },
    { href: "/events", label: t("events") },
    { href: "/feed", label: t("feed") },
    { href: "/pricing", label: t("pricing") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">VIBECAFE</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button asChild variant="ghost" size="sm" className="hidden lg:inline-flex">
            <Link href="/discover"><Compass className="size-4" /> {t("exploreCafes")}</Link>
          </Button>
          <FindVibeButton className="hidden sm:inline-flex" />
          <LanguageSwitcher />
          <ThemeToggle />
          {session?.user ? <UserMenu user={session.user} /> : <SignInButton />}
        </div>
      </div>
    </header>
  );
}
