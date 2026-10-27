"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

type MoodItem = { key: string; i18nKey: string; emoji: string };

export function MoodPicker<T extends MoodItem>({
  items,
  namespace,
  selected,
  onToggle,
  className,
}: {
  items: T[];
  namespace: "moods" | "vibeMoods";
  selected: T["key"][];
  onToggle: (key: T["key"]) => void;
  className?: string;
}) {
  const t = useTranslations(namespace);

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5", className)}>
      {items.map((mood, i) => {
        const active = selected.includes(mood.key);
        const hasDescription = namespace === "moods";
        return (
          <motion.button
            key={mood.key}
            type="button"
            onClick={() => onToggle(mood.key)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-2xl border px-4 py-3.5 text-left transition-all",
              active
                ? "border-accent bg-accent-soft text-accent-foreground shadow-sm"
                : "border-border bg-card hover:border-accent/40 hover:bg-surface-muted",
            )}
          >
            <span className="text-2xl leading-none">{mood.emoji}</span>
            <span className="font-display text-sm font-semibold leading-tight">{t(`${mood.i18nKey}.label`)}</span>
            {hasDescription && (
              <span className="text-xs text-muted-foreground">{t(`${mood.i18nKey}.description`)}</span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
