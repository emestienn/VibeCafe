"use client";

import { Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERROR_KEYS: Record<string, string> = {
  NOT_FOUND: "redeemNotFound",
  EXPIRED: "redeemExpired",
  SOLD_OUT: "redeemSoldOut",
  ALREADY_REDEEMED: "redeemAlready",
  PLAN_REQUIRED: "redeemPlanRequired",
};

export function RedeemPromoCode() {
  const t = useTranslations("profile");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/promo-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(t(ERROR_KEYS[data.error] ?? "redeemError"));
        return;
      }
      toast.success(t("redeemSuccess"));
      setCode("");
    } catch {
      toast.error(t("redeemError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-surface p-3">
      <Ticket className="size-4 shrink-0 text-muted-foreground" />
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder={t("redeemPlaceholder")}
        className="h-9 flex-1"
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <Button size="sm" onClick={submit} disabled={submitting || !code.trim()}>
        {t("redeemButton")}
      </Button>
    </div>
  );
}
