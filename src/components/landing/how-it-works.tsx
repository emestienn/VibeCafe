"use client";

import { motion } from "framer-motion";
import { Coffee, SearchCheck, Sparkles, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const STEP_ICONS = [Sparkles, SearchCheck, Coffee, Users];

export function HowItWorks() {
  const t = useTranslations("home");

  const steps = [1, 2, 3, 4].map((n) => ({
    icon: STEP_ICONS[n - 1],
    title: t(`step${n}Title`),
    description: t(`step${n}Desc`),
  }));

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("howItWorksEyebrow")}</span>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("howItWorksTitle")}</h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="relative"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-foreground">
              <step.icon className="size-5" />
            </div>
            <span className="absolute right-0 top-0 font-display text-4xl text-border">0{i + 1}</span>
            <h3 className="mt-5 font-display text-lg">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
