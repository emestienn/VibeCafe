"use client";

import { Power } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function PromoCodeActiveToggle({ promoId, initialActive }: { promoId: string; initialActive: boolean }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/promo-codes/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      if (!res.ok) throw new Error();
      setActive((a) => !a);
      toast.success(t("updated"));
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant={active ? "secondary" : "outline"} onClick={toggle} disabled={loading}>
      <Power className="size-3.5" /> {active ? t("deactivate") : t("activate")}
    </Button>
  );
}
