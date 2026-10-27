import { Crown, Sparkles } from "lucide-react";

type PlanTier = "FREE" | "PLUS" | "PRO";

const STYLES: Record<PlanTier, string> = {
  FREE: "bg-surface-muted text-muted-foreground",
  PLUS: "bg-accent/15 text-accent",
  PRO: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export function PlanBadge({ plan }: { plan: PlanTier }) {
  if (plan === "FREE") return null;
  const Icon = plan === "PRO" ? Crown : Sparkles;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[plan]}`}>
      <Icon className="size-3" /> {plan}
    </span>
  );
}
