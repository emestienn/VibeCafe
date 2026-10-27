"use client";

import { useTranslations } from "next-intl";

import { BADGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BadgeDisplay({ earned }: { earned: string[] }) {
  const t = useTranslations("gamification");
  if (earned.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {BADGES.filter((b) => earned.includes(b.key)).map((badge) => (
        <div
          key={badge.key}
          className={cn(
            "flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent-foreground",
          )}
        >
          <span>{badge.emoji}</span> {t(badge.i18nKey)}
        </div>
      ))}
    </div>
  );
}
