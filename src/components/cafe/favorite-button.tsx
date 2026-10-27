"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function FavoriteButton({
  cafeId,
  initialFavorited = false,
  className,
}: {
  cafeId: string;
  initialFavorited?: boolean;
  className?: string;
}) {
  const t = useTranslations("saved");
  const { status } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }

    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      try {
        const res = await fetch("/api/favorites", {
          method: next ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cafeId }),
        });
        if (!res.ok) throw new Error();
        toast.success(next ? t("savedToPlaces") : t("removedFromSaved"));
      } catch {
        setFavorited(!next);
        toast.error("Something went wrong, try again.");
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={favorited ? "Remove from saved places" : "Save this café"}
      className={cn(
        "flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-colors", favorited ? "fill-accent text-accent" : "text-foreground")} />
    </button>
  );
}
