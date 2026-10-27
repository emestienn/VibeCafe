"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { reviewSchema, type ReviewInput } from "@/lib/validations";

const TAG_OPTIONS = [
  "Great Wi-Fi", "Very quiet", "Good coffee", "Perfect for coding", "Crowded after 6 PM",
  "Comfy seating", "Lots of outlets", "Friendly staff", "Good for meetings", "Instagrammable",
];

function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
            <Star className={cn("size-4", n <= value ? "fill-accent text-accent" : "text-border")} />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ cafeId }: { cafeId: string }) {
  const t = useTranslations("reviews");
  const tCafe = useTranslations("cafe");
  const { status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [subRatings, setSubRatings] = useState({
    coffeeRating: 4, wifiRating: 4, quietnessRating: 4, workRating: 4, aestheticRating: 4,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { cafeId, rating: 5, body: "", tags: [] },
  });

  const rating = watch("rating");

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      const next = prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag];
      setValue("tags", next);
      return next;
    });
  };

  const onSubmit = async (data: ReviewInput) => {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...subRatings, tags }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("posted"));
      setOpen(false);
      reset();
      setTags([]);
      router.refresh();
    } catch {
      toast.error(t("postFailed"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (next && status !== "authenticated") {
        router.push("/signin");
        return;
      }
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline">{tCafe("writeReview")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("shareExperience")}</DialogTitle>
          <DialogDescription>{t("shareExperienceDesc")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setValue("rating", n)}>
                <Star className={cn("size-8 transition-colors", n <= rating ? "fill-accent text-accent" : "text-border")} />
              </button>
            ))}
          </div>

          <Textarea
            {...register("body")}
            placeholder={t("bodyPlaceholder")}
            rows={4}
          />
          {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}

          <div className="flex flex-col gap-2.5 rounded-xl border border-border p-3">
            <StarInput label={t("coffee")} value={subRatings.coffeeRating} onChange={(v) => setSubRatings((s) => ({ ...s, coffeeRating: v }))} />
            <StarInput label={t("wifiRating")} value={subRatings.wifiRating} onChange={(v) => setSubRatings((s) => ({ ...s, wifiRating: v }))} />
            <StarInput label={t("quietness")} value={subRatings.quietnessRating} onChange={(v) => setSubRatings((s) => ({ ...s, quietnessRating: v }))} />
            <StarInput label={t("workFriendliness")} value={subRatings.workRating} onChange={(v) => setSubRatings((s) => ({ ...s, workRating: v }))} />
            <StarInput label={t("aesthetic")} value={subRatings.aestheticRating} onChange={(v) => setSubRatings((s) => ({ ...s, aestheticRating: v }))} />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {TAG_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  tags.includes(tag) ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
                )}
              >
                {tag}
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("posting") : t("postReview")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
