"use client";

import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1400, bounce: 0 });

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) ref.current.textContent = `${Math.round(latest)}${suffix}`;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function StatsCounter() {
  const t = useTranslations("home");

  const stats = [
    { value: 20, suffix: "+", label: t("statCafes") },
    { value: 30, suffix: "+", label: t("statMembers") },
    { value: 10, suffix: "", label: t("statEvents") },
    { value: 3, suffix: "", label: t("statCities") },
  ];

  return (
    <section className="border-y border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="text-center"
          >
            <div className="font-display text-4xl font-medium">
              <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            </div>
            <p className="mt-1 text-sm text-primary-foreground/70">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
