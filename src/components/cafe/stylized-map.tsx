"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Coffee, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { projectPins } from "@/lib/map-layout";
import { priceLevelLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MapCafe = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  vibeScore: number;
  heroImageUrl: string;
  priceLevel: number;
  rating: number;
};

export function StylizedMap({
  cafes,
  activeId,
  onActiveChange,
  className,
}: {
  cafes: MapCafe[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  className?: string;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);
  const pins = useMemo(() => projectPins(cafes), [cafes]);
  const openId = activeId ?? hoverId;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border border-border",
        className,
      )}
      style={{
        backgroundColor: "var(--color-cream-deep)",
        backgroundImage:
          "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }}
    >
      {/* decorative "blocks" to suggest a city map without real tiles */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-md bg-surface/70"
            style={{
              left: `${(i * 37) % 90}%`,
              top: `${(i * 53) % 85}%`,
              width: `${10 + ((i * 17) % 10)}%`,
              height: `${6 + ((i * 11) % 8)}%`,
            }}
          />
        ))}
      </div>

      {pins.map((cafe) => {
        const isOpen = openId === cafe.id;
        return (
          <div
            key={cafe.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${cafe.xPct}%`, top: `${cafe.yPct}%` }}
          >
            <button
              onMouseEnter={() => {
                setHoverId(cafe.id);
                onActiveChange?.(cafe.id);
              }}
              onMouseLeave={() => {
                setHoverId(null);
                onActiveChange?.(null);
              }}
              onClick={() => onActiveChange?.(cafe.id)}
              className="group relative z-10 flex flex-col items-center"
            >
              <span
                className={cn(
                  "flex items-center gap-1 rounded-full border-2 border-background px-2.5 py-1 text-xs font-semibold shadow-md transition-all",
                  isOpen ? "scale-110 bg-accent text-accent-foreground" : "bg-primary text-primary-foreground",
                )}
              >
                <Coffee className="size-3" /> {cafe.vibeScore}
              </span>
              <span
                className={cn(
                  "-mt-[1px] size-2 rotate-45 border-b-2 border-r-2 border-background",
                  isOpen ? "bg-accent" : "bg-primary",
                )}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2"
                >
                  <Link
                    href={`/cafe/${cafe.slug}`}
                    className="flex gap-2.5 rounded-2xl border border-border bg-card p-2.5 shadow-xl"
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                      <Image src={cafe.heroImageUrl} alt={cafe.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{cafe.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="size-3 fill-accent text-accent" /> {cafe.rating.toFixed(1)} · {priceLevelLabel(cafe.priceLevel)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
