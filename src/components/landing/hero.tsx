"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CITIES } from "@/lib/constants";

export function Hero() {
  const t = useTranslations("home");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string>(CITIES[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/discover?${params.toString()}`);
  };

  return (
    <section className="editorial-grain relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=1800&h=1200&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-espresso-deep/55 via-espresso-deep/55 to-background" />
      </div>

      <div className="mx-auto flex max-w-5xl flex-col items-center px-4 pb-28 pt-28 text-center sm:px-6 sm:pt-36 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/10 px-4 py-1.5 text-xs font-medium text-cream backdrop-blur"
        >
          <Sparkles className="size-3.5" /> {t("heroEyebrow")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-balance font-display text-4xl font-medium leading-[1.05] text-cream sm:text-6xl"
        >
          {t("heroTitle")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 max-w-xl text-balance text-base text-cream/80 sm:text-lg"
        >
          {t("heroSubtitle")}
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          onSubmit={handleSearch}
          className="mt-10 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-cream/20 bg-background/95 p-2 shadow-2xl sm:flex-row sm:items-center sm:rounded-full"
        >
          <div className="flex flex-1 items-center gap-2.5 px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <div className="hidden h-6 w-px bg-border sm:block" />
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-10 w-full rounded-full border-none bg-transparent shadow-none sm:w-36">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            {t("exploreCafesCta")} <ArrowRight className="size-4" />
          </Button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-5"
        >
          <Button asChild variant="ghost" className="text-cream hover:bg-cream/10 hover:text-cream">
            <a href="#vibe">{t("findMyVibeCta")}</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
