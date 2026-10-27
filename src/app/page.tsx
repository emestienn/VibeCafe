import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { FeaturedCafes } from "@/components/landing/featured-cafes";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { StatsCounter } from "@/components/landing/stats-counter";
import { VibeFinder } from "@/components/landing/vibe-finder";
import { Button } from "@/components/ui/button";
import { getCafes, getFeaturedCafes } from "@/lib/data/cafes";

export default async function Home() {
  const [featured, allCafes, t] = await Promise.all([
    getFeaturedCafes(6),
    getCafes(),
    getTranslations("home"),
  ]);

  return (
    <>
      <Hero />
      <VibeFinder cafes={allCafes} />
      <FeaturedCafes cafes={featured} />
      <HowItWorks />
      <StatsCounter />

      <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-balance font-display text-3xl sm:text-4xl">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("ctaSubtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              {t("createProfileCta")} <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/discover">{t("exploreWithoutAccount")}</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
