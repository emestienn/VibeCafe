import { Tag } from "lucide-react";
import { getTranslations } from "next-intl/server";

type PlanTier = "FREE" | "PLUS" | "PRO";

export async function CafeDiscountBadge({ percent, requiredPlan }: { percent: number; requiredPlan: PlanTier }) {
  const t = await getTranslations("cafe");

  return (
    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
      <Tag className="size-3.5" />
      {t("discountBadge", { percent, plan: requiredPlan })}
    </span>
  );
}
