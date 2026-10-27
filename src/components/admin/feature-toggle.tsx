"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function FeatureToggle({ cafeId, initialFeatured }: { cafeId: string; initialFeatured: boolean }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [featured, setFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cafes/${cafeId}/feature`, { method: "POST" });
      if (!res.ok) throw new Error();
      setFeatured((f) => !f);
      toast.success(t(featured ? "feature" : "featured"));
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant={featured ? "secondary" : "outline"} onClick={toggle} disabled={loading}>
      <Star className={featured ? "size-3.5 fill-accent text-accent" : "size-3.5"} /> {featured ? t("featured") : t("feature")}
    </Button>
  );
}
