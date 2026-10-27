"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function JoinSessionButton({ sessionId }: { sessionId: string }) {
  const t = useTranslations("cafe");
  const { status } = useSession();
  const router = useRouter();
  const [joined, setJoined] = useState(false);

  const join = async () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    try {
      const res = await fetch(`/api/work-sessions/${sessionId}/join`, { method: "POST" });
      if (!res.ok) throw new Error();
      setJoined(true);
      toast.success(t("joinedToast"));
    } catch {
      toast.error("Something went wrong.");
    }
  };

  return (
    <Button size="sm" variant={joined ? "secondary" : "outline"} onClick={join} disabled={joined}>
      {joined ? t("joined") : t("join")}
    </Button>
  );
}
