"use client";

import { Check, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ConnectButton({
  recipientId,
  initialState = "none",
  size = "sm",
}: {
  recipientId: string;
  initialState?: "none" | "pending" | "connected";
  size?: "sm" | "default";
}) {
  const t = useTranslations("common");
  const { status } = useSession();
  const router = useRouter();
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      if (!res.ok) throw new Error();
      setState("pending");
      toast.success(t("requestSent"));
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (state === "connected") {
    return (
      <Button size={size} variant="secondary" disabled>
        <Check className="size-3.5" /> {t("connected")}
      </Button>
    );
  }

  if (state === "pending") {
    return (
      <Button size={size} variant="outline" disabled>
        {t("requestSent")}
      </Button>
    );
  }

  return (
    <Button size={size} onClick={connect} disabled={loading}>
      <UserPlus className="size-3.5" /> {t("connect")}
    </Button>
  );
}
