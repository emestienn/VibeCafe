"use client";

import { MapPinCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function CheckInButton({ cafeId, initialCheckedIn = false }: { cafeId: string; initialCheckedIn?: boolean }) {
  const t = useTranslations("cafe");
  const { status } = useSession();
  const router = useRouter();
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    setLoading(true);
    const next = !checkedIn;
    try {
      const res = await fetch("/api/profile/networking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentCafeId: next ? cafeId : null }),
      });
      if (!res.ok) throw new Error();
      setCheckedIn(next);
      toast.success(next ? t("youreHere") : t("checkIn"));
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant={checkedIn ? "secondary" : "outline"} size="sm" onClick={toggle} disabled={loading}>
      <MapPinCheck className="size-3.5" /> {checkedIn ? t("youreHere") : t("checkIn")}
    </Button>
  );
}
