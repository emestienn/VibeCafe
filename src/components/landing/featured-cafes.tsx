import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { CafeCard } from "@/components/cafe/cafe-card";
import { Button } from "@/components/ui/button";
import type { CafeCard as CafeCardType } from "@/lib/data/cafes";

export function FeaturedCafes({ cafes }: { cafes: CafeCardType[] }) {
  const t = useTranslations("home");

  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("featuredEyebrow")}</span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">{t("featuredTitle")}</h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/discover">
              {t("browseAll")} <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cafes.map((cafe, i) => (
            <CafeCard key={cafe.id} cafe={cafe} priority={i < 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
