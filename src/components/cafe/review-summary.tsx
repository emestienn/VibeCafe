"use client";

import { useTranslations } from "next-intl";

import { Progress } from "@/components/ui/progress";

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function ReviewSummary({
  reviews,
}: {
  reviews: { coffeeRating: number | null; wifiRating: number | null; quietnessRating: number | null; workRating: number | null; aestheticRating: number | null }[];
}) {
  const t = useTranslations("reviews");
  const tCafe = useTranslations("cafe");

  const metrics = [
    { label: t("coffee"), emoji: "☕", value: avg(reviews.map((r) => r.coffeeRating).filter((n): n is number => n != null)) },
    { label: t("wifiRating"), emoji: "📶", value: avg(reviews.map((r) => r.wifiRating).filter((n): n is number => n != null)) },
    { label: t("quietness"), emoji: "🔇", value: avg(reviews.map((r) => r.quietnessRating).filter((n): n is number => n != null)) },
    { label: t("workFriendliness"), emoji: "💻", value: avg(reviews.map((r) => r.workRating).filter((n): n is number => n != null)) },
    { label: t("aesthetic"), emoji: "🎨", value: avg(reviews.map((r) => r.aestheticRating).filter((n): n is number => n != null)) },
  ];

  if (reviews.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="font-display text-lg">{tCafe("communitySays")}</h3>
      <div className="mt-4 flex flex-col gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-muted-foreground">{m.emoji} {m.label}</span>
            <Progress value={(m.value / 5) * 100} className="flex-1" />
            <span className="w-8 shrink-0 text-right text-sm font-semibold">{m.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
