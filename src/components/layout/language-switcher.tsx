"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LOCALE_COOKIE, locales, localeFullNames, localeNames, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = (next: Locale) => {
    // eslint-disable-next-line react-hooks/immutability -- direct browser API, not component state
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="flex h-9 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
        aria-label="Change language"
      >
        {localeNames[locale]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onSelect={() => setLocale(l)}
            className={cn("justify-between", l === locale && "font-semibold text-accent")}
          >
            {localeFullNames[l]}
            <span className="text-xs text-muted-foreground">{localeNames[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
