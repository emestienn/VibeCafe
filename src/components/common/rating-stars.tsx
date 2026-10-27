import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating > i && rating < i + 1;
        return (
          <span key={i} className="relative inline-flex" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-accent/25" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: filled ? "100%" : half ? "50%" : "0%" }}
            >
              <Star size={size} className="fill-accent text-accent" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
