"use client";

import { Check, Coins, Crown, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PlanTier = "FREE" | "PLUS" | "PRO";

const PLAN_ORDER: PlanTier[] = ["FREE", "PLUS", "PRO"];
const PLAN_ICON: Record<PlanTier, React.ElementType> = { FREE: Coins, PLUS: Sparkles, PRO: Crown };

export function PricingPlans({ currentPlan, isSignedIn }: { currentPlan: PlanTier; isSignedIn: boolean }) {
  const t = useTranslations("pricing");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pendingPlan, setPendingPlan] = useState<PlanTier | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const confirm = async () => {
    if (!pendingPlan) return;
    setSubmitting(true);
    try {
      if (pendingPlan === "FREE") {
        const res = await fetch("/api/subscription/cancel", { method: "POST" });
        if (!res.ok) throw new Error();
        toast.success(t("cancelSuccess"));
      } else {
        const res = await fetch("/api/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: pendingPlan }),
        });
        if (!res.ok) throw new Error();
        toast.success(t("upgradeSuccess", { plan: t(`${pendingPlan.toLowerCase()}.name`) }));
      }
      setPendingPlan(null);
      router.refresh();
    } catch {
      toast.error(t("confirmDesc"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const Icon = PLAN_ICON[plan];
          const isCurrent = plan === currentPlan;
          const key = plan.toLowerCase();
          const features = t.raw(`${key}.features`) as string[];

          return (
            <div
              key={plan}
              className={`relative flex flex-col gap-5 rounded-3xl border p-6 ${
                plan === "PLUS" ? "border-accent bg-accent/5 shadow-md" : "border-border bg-card"
              }`}
            >
              {plan === "PLUS" && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {t("mostPopular")}
                </span>
              )}

              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-full bg-surface-muted">
                  <Icon className="size-4" />
                </span>
                <h3 className="font-display text-xl">{t(`${key}.name`)}</h3>
              </div>

              <div>
                <span className="font-display text-3xl">{t(`${key}.price`)}</span>
                <span className="text-sm text-muted-foreground"> {t("perMonth")}</span>
              </div>

              <p className="text-sm text-muted-foreground">{t(`${key}.description`)}</p>

              <ul className="flex flex-1 flex-col gap-2.5">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-olive" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">
                  {t("current")}
                </Button>
              ) : (
                <Button
                  variant={plan === "PLUS" ? "accent" : plan === "FREE" ? "outline" : "default"}
                  className="w-full"
                  disabled={!isSignedIn}
                  onClick={() => setPendingPlan(plan)}
                >
                  {plan === "FREE" ? t("downgrade") : t("upgrade")}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-muted-foreground">{t("mockNote")}</p>

      <Dialog open={Boolean(pendingPlan)} onOpenChange={(open) => !open && setPendingPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingPlan && t("confirmTitle", { plan: t(`${pendingPlan.toLowerCase()}.name`) })}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("confirmDesc")}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingPlan(null)}>{tCommon("cancel")}</Button>
            <Button onClick={confirm} disabled={submitting}>
              {submitting ? t("processing") : t("confirmButton")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
