import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";

export type FeedItem = {
  id: string;
  type: "review" | "connection" | "event" | "new-cafe" | "trending" | "work-session";
  createdAt: Date;
  title: string;
  body: string;
  href: string;
  actorName?: string;
  actorImage?: string | null;
  cafeImage?: string | null;
};

export async function getPersonalizedFeed(): Promise<FeedItem[]> {
  const [recentReviews, upcomingEvents, newCafes, activeWorkSessions, topCafe, t] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true, image: true } }, cafe: { select: { name: true, slug: true, heroImageUrl: true } } },
    }),
    prisma.event.findMany({
      where: { startAt: { gte: new Date() } },
      orderBy: { startAt: "asc" },
      take: 3,
      include: { cafe: { select: { name: true, slug: true } } },
    }),
    prisma.cafe.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { name: true, slug: true, heroImageUrl: true, createdAt: true } }),
    prisma.workSession.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { cafe: { select: { name: true, slug: true } } },
    }),
    prisma.cafe.findFirst({ orderBy: { vibeScore: "desc" }, select: { name: true, slug: true, heroImageUrl: true } }),
    getTranslations("feed"),
  ]);

  const items: FeedItem[] = [];

  for (const review of recentReviews) {
    items.push({
      id: `review-${review.id}`,
      type: "review",
      createdAt: review.createdAt,
      title: t("reviewedTitle", { name: review.user.name ?? "—", cafe: review.cafe.name }),
      body: review.body,
      href: `/cafe/${review.cafe.slug}`,
      actorName: review.user.name ?? undefined,
      actorImage: review.user.image,
      cafeImage: review.cafe.heroImageUrl,
    });
  }

  for (const event of upcomingEvents) {
    items.push({
      id: `event-${event.id}`,
      type: "event",
      createdAt: new Date(),
      title: event.title,
      body: `${event.cafe.name} — ${new Date(event.startAt).toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}`,
      href: `/events/${event.slug}`,
    });
  }

  for (const cafe of newCafes) {
    items.push({
      id: `cafe-${cafe.slug}`,
      type: "new-cafe",
      createdAt: cafe.createdAt,
      title: t("newCafeTitle", { name: cafe.name }),
      body: t("checkItOut"),
      href: `/cafe/${cafe.slug}`,
      cafeImage: cafe.heroImageUrl,
    });
  }

  for (const session of activeWorkSessions) {
    items.push({
      id: `work-${session.id}`,
      type: "work-session",
      createdAt: session.createdAt,
      title: t("workingAt", { category: session.category, cafe: session.cafe.name }),
      body: session.title,
      href: `/cafe/${session.cafe.slug}`,
    });
  }

  if (topCafe) {
    items.push({
      id: `trending-${topCafe.slug}`,
      type: "trending",
      createdAt: new Date(),
      title: t("trendingTitle", { name: topCafe.name }),
      body: t("trendingBody"),
      href: `/cafe/${topCafe.slug}`,
      cafeImage: topCafe.heroImageUrl,
    });
  }

  return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
