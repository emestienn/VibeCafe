"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function JoinEventButton({ eventId, initialJoined = false }: { eventId: string; initialJoined?: boolean }) {
  const t = useTranslations("events");
  const { status } = useSession();
  const router = useRouter();
  const [joined, setJoined] = useState(initialJoined);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    setLoading(true);
    const next = !joined;
    try {
      const res = await fetch(`/api/events/${eventId}/join`, { method: next ? "POST" : "DELETE" });
      if (!res.ok) throw new Error();
      setJoined(next);
      toast.success(next ? t("joined") : t("left"));
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={toggle} disabled={loading} variant={joined ? "secondary" : "default"}>
      {joined ? t("youreGoing") : t("joinEvent")}
    </Button>
  );
}
