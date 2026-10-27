"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/common/rating-stars";
import type { CafeCard as CafeCardType } from "@/lib/data/cafes";
import { deriveHighlightTags } from "@/lib/cafe-score";
import { distanceLabel } from "@/lib/geo";
import { priceLevelLabel } from "@/lib/utils";

import { FavoriteButton } from "./favorite-button";
import { VibeScoreRing } from "./vibe-score-ring";

export function CafeCard({
  cafe,
  favorited = false,
  priority = false,
}: {
  cafe: CafeCardType;
  favorited?: boolean;
  priority?: boolean;
}) {
  const tags = deriveHighlightTags(cafe);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <Link href={`/cafe/${cafe.slug}`} className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-[0_1px_2px_rgba(60,42,30,0.05)] transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={cafe.heroImageUrl}
            alt={cafe.name}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-espresso-deep/60 to-transparent" />
          <FavoriteButton cafeId={cafe.id} initialFavorited={favorited} className="absolute right-3 top-3" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            {priceLevelLabel(cafe.priceLevel)}
          </div>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-cream">
            <MapPin className="size-3.5" /> {cafe.neighborhood} · {distanceLabel(cafe)}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-lg leading-tight">{cafe.name}</h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{cafe.tagline}</p>
            </div>
            <VibeScoreRing score={cafe.vibeScore} size={48} strokeWidth={4} />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <RatingStars rating={cafe.rating} />
            <span className="text-muted-foreground">
              {cafe.rating.toFixed(1)} · {cafe.reviewCount} reviews
            </span>
          </div>

          <div className="mt-auto flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
