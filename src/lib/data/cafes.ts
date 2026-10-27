import { prisma } from "@/lib/prisma";
import { moodMatchScore } from "@/lib/cafe-score";
import { isOpenNow } from "@/lib/hours";
import type { MoodKey } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const cafeCardSelect = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  city: true,
  neighborhood: true,
  priceLevel: true,
  heroImageUrl: true,
  rating: true,
  reviewCount: true,
  vibeScore: true,
  workScore: true,
  studyScore: true,
  networkingScore: true,
  aestheticScore: true,
  wifiScore: true,
  coffeeScore: true,
  outletsScore: true,
  noiseLevel: true,
  crowdLevel: true,
  moodTags: true,
  isOpenLate: true,
  hasOutdoorSeating: true,
  isPetFriendly: true,
  isMeetingFriendly: true,
  isGroupFriendly: true,
  isLaptopFriendly: true,
  featured: true,
  lat: true,
  lng: true,
  openingHours: true,
} satisfies Prisma.CafeSelect;

export type CafeCard = Prisma.CafeGetPayload<{ select: typeof cafeCardSelect }>;

export type DiscoverFilters = {
  query?: string;
  city?: string;
  moods?: MoodKey[];
  maxPrice?: number;
  openNow?: boolean;
  quiet?: boolean;
  wifi?: boolean;
  outlets?: boolean;
  outdoor?: boolean;
  petFriendly?: boolean;
  meetings?: boolean;
  groups?: boolean;
  sort?: "vibe" | "rating" | "price-low" | "price-high";
};

export async function getCafes(filters: DiscoverFilters = {}): Promise<CafeCard[]> {
  const where: Prisma.CafeWhereInput = {};

  if (filters.city) where.city = filters.city;
  if (filters.maxPrice) where.priceLevel = { lte: filters.maxPrice };
  if (filters.quiet) where.noiseLevel = { in: ["SILENT", "QUIET"] };
  if (filters.wifi) where.wifiScore = { gte: 85 };
  if (filters.outlets) where.outletsScore = { gte: 80 };
  if (filters.outdoor) where.hasOutdoorSeating = true;
  if (filters.petFriendly) where.isPetFriendly = true;
  if (filters.meetings) where.isMeetingFriendly = true;
  if (filters.groups) where.isGroupFriendly = true;
  if (filters.query) {
    where.OR = [
      { name: { contains: filters.query, mode: "insensitive" } },
      { tagline: { contains: filters.query, mode: "insensitive" } },
      { description: { contains: filters.query, mode: "insensitive" } },
      { neighborhood: { contains: filters.query, mode: "insensitive" } },
      { moodTags: { has: filters.query.toUpperCase().replace(/\s+/g, "_") } },
    ];
  }

  const orderBy: Prisma.CafeOrderByWithRelationInput =
    filters.sort === "rating"
      ? { rating: "desc" }
      : filters.sort === "price-low"
        ? { priceLevel: "asc" }
        : filters.sort === "price-high"
          ? { priceLevel: "desc" }
          : { vibeScore: "desc" };

  let cafes = await prisma.cafe.findMany({ where, select: cafeCardSelect, orderBy });

  if (filters.openNow) {
    cafes = cafes.filter((c) => isOpenNow(c.openingHours));
  }

  if (filters.moods && filters.moods.length > 0) {
    return [...cafes].sort(
      (a, b) => moodMatchScore(b, filters.moods!) - moodMatchScore(a, filters.moods!),
    );
  }

  return cafes;
}

export async function getFeaturedCafes(limit = 6) {
  return prisma.cafe.findMany({
    where: { featured: true },
    select: cafeCardSelect,
    orderBy: { vibeScore: "desc" },
    take: limit,
  });
}

export async function getCafeBySlug(slug: string) {
  return prisma.cafe.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      amenities: true,
      menu: { include: { items: true } },
      reviews: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          images: true,
          _count: { select: { likes: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      checkedInProfiles: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          interests: true,
        },
        take: 12,
      },
      events: {
        where: { startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: 3,
      },
      workSessions: {
        where: { isActive: true },
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "desc" },
      },
      promoCodes: {
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { discountPercent: "desc" },
        take: 1,
      },
    },
  });
}

export async function getAllCafeSlugs() {
  const cafes = await prisma.cafe.findMany({ select: { slug: true } });
  return cafes.map((c) => c.slug);
}

export async function getCafesForMap() {
  return prisma.cafe.findMany({
    select: { id: true, slug: true, name: true, lat: true, lng: true, vibeScore: true, heroImageUrl: true, priceLevel: true, rating: true },
  });
}
