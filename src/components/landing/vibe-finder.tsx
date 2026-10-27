"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";

import { useVibeAi } from "@/components/ai/vibe-ai-context";
import { CafeCard } from "@/components/cafe/cafe-card";
import { MoodPicker } from "@/components/cafe/mood-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { rankByMood } from "@/lib/cafe-score";
import { VIBE_MOODS, VIBE_TO_MOOD, type MoodKey, type VibeMoodKey } from "@/lib/constants";
import type { CafeCard as CafeCardType } from "@/lib/data/cafes";

export function VibeFinder({ cafes }: { cafes: CafeCardType[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const { ask } = useVibeAi();
  const [selected, setSelected] = useState<VibeMoodKey[]>([]);
  const [description, setDescription] = useState("");

  const toggle = (mood: VibeMoodKey) => {
    setSelected((prev) => (prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]));
  };

  const moodKeys = useMemo(
    () => [...new Set(selected.flatMap((m) => VIBE_TO_MOOD[m]))] as MoodKey[],
    [selected],
  );

  const results = useMemo(() => {
    if (moodKeys.length === 0) return [];
    return rankByMood(cafes, moodKeys).slice(0, 4);
  }, [cafes, moodKeys]);

  const askAi = () => {
    if (!description.trim()) return;
    ask(description);
    setDescription("");
  };

  return (
    <section id="vibe" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent">{locale === "uz" ? "Mening vibem" : locale === "ru" ? "Мой vibe" : "My Vibe"}</span>
        <h2 className="mt-3 text-balance font-display text-3xl sm:text-4xl">{t("moodQuestion")}</h2>
        <p className="mt-3 text-muted-foreground">{t("moodSubtitle")}</p>
      </div>

      <MoodPicker items={VIBE_MOODS} namespace="vibeMoods" selected={selected} onToggle={toggle} className="mx-auto mt-10 max-w-4xl" />

      <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 sm:flex-row">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("moodDescribePlaceholder")}
          rows={1}
          className="min-h-11 flex-1 resize-none py-2.5"
        />
        <Button onClick={askAi} className="shrink-0">
          <Sparkles className="size-4" /> Vibe AI
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {selected.length > 0 && (
          <motion.div
            key={selected.join(",")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-12"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-display text-xl">{t("perfectPlaces")}</h3>
              <Button asChild variant="link" size="sm">
                <Link href={`/discover?moods=${moodKeys.join(",")}`}>
                  {t("seeAllMatches")} <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
