"use client";

import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/common/rating-stars";
import { cn, formatRelativeTime, initials } from "@/lib/utils";

export type ReviewCardData = {
  id: string;
  rating: number;
  body: string;
  tags: string[];
  createdAt: string | Date;
  likeCount: number;
  user: { id: string; name: string | null; image: string | null };
  images: { url: string }[];
};

export function ReviewCard({ review, initialLiked = false }: { review: ReviewCardData; initialLiked?: boolean }) {
  const { status } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(review.likeCount);
  const [, startTransition] = useTransition();

  const toggleLike = () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return;
    }
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    startTransition(async () => {
      try {
        await fetch(`/api/reviews/${review.id}/like`, { method: "POST" });
      } catch {
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
      }
    });
  };

  return (
    <div className="border-b border-border py-6 first:pt-0 last:border-none">
      <div className="flex items-start gap-3">
        <Avatar>
          <AvatarImage src={review.user.image ?? undefined} alt={review.user.name ?? "User"} />
          <AvatarFallback>{initials(review.user.name ?? "U")}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{review.user.name}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <RatingStars rating={review.rating} size={12} />
                <span>{formatRelativeTime(review.createdAt)}</span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-foreground/90">{review.body}</p>

          {review.images.length > 0 && (
            <div className="mt-3 flex gap-2">
              {review.images.map((img) => (
                <div key={img.url} className="relative size-20 overflow-hidden rounded-xl">
                  <Image src={img.url} alt="Review photo" fill className="object-cover" sizes="80px" />
                </div>
              ))}
            </div>
          )}

          {review.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {review.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="font-normal">{tag}</Badge>
              ))}
            </div>
          )}

          <button
            onClick={toggleLike}
            className={cn(
              "mt-3 inline-flex items-center gap-1.5 text-xs font-medium transition-colors",
              liked ? "text-accent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Heart className={cn("size-3.5", liked && "fill-accent")} /> {count > 0 ? count : "Like"}
          </button>
        </div>
      </div>
    </div>
  );
}
