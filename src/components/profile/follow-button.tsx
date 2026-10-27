"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function FollowButton({
  userId,
  initialFollowing = false,
  size = "sm",
}: {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "default";
}) {
  const t = useTranslations("common");
  const { status } = useSession();
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    setLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      await fetch("/api/follow", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      router.refresh();
    } catch {
      setFollowing(!next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size={size} variant={following ? "secondary" : "default"} onClick={toggle} disabled={loading}>
      {following ? t("following") : t("follow")}
    </Button>
  );
}
