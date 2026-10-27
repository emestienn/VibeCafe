import type { Metadata } from "next";

import { DiscoverView } from "@/components/cafe/discover-view";
import { auth } from "@/lib/auth";
import { CITIES, type MoodKey } from "@/lib/constants";
import { getCafes, type DiscoverFilters } from "@/lib/data/cafes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Discover" };

const MOOD_KEYS = new Set([
  "DEEP_WORK", "STUDY", "CODING", "CREATIVE", "NETWORKING",
  "QUIET_FOCUS", "SOCIAL", "AESTHETIC", "LATE_NIGHT", "RELAX",
]);

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const moods = (first(sp.moods)?.split(",").filter((m) => MOOD_KEYS.has(m)) ?? []) as MoodKey[];

  const filters: DiscoverFilters = {
    query: first(sp.q) || undefined,
    city: first(sp.city) && CITIES.includes(first(sp.city) as (typeof CITIES)[number]) ? first(sp.city) : undefined,
    moods,
    maxPrice: first(sp.price) ? Number(first(sp.price)) : undefined,
    openNow: first(sp.openNow) === "1",
    quiet: first(sp.quiet) === "1",
    wifi: first(sp.wifi) === "1",
    outlets: first(sp.outlets) === "1",
    outdoor: first(sp.outdoor) === "1",
    petFriendly: first(sp.pet) === "1",
    meetings: first(sp.meetings) === "1",
    groups: first(sp.groups) === "1",
    sort: (first(sp.sort) as DiscoverFilters["sort"]) || "vibe",
  };

  const session = await auth();
  const [cafes, favorites] = await Promise.all([
    getCafes(filters),
    session?.user
      ? prisma.favorite.findMany({ where: { userId: session.user.id }, select: { cafeId: true } })
      : Promise.resolve([]),
  ]);

  const favoritedIds = new Set(favorites.map((f) => f.cafeId));

  return (
    <DiscoverView
      cafes={cafes}
      favoritedIds={[...favoritedIds]}
      initialFilters={filters}
      initialView={first(sp.view) === "map" ? "map" : "list"}
    />
  );
}
