import { PLAN_PRICES } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";

function bucketByDay(dates: Date[], days: number) {
  const buckets = new Map<string, number>();
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([date, value]) => ({
    name: date.slice(5),
    value,
  }));
}

export async function getAdminStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalCafes,
    totalReviews,
    totalEvents,
    totalConnections,
    activeNetworkers,
    totalPosts,
    bannedUsers,
    popularCafes,
    recentReviews,
    recentUsers,
    recentSignupDates,
    recentPostDates,
    subscriptionsByPlan,
    totalPromoRedemptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.cafe.count(),
    prisma.review.count(),
    prisma.event.count(),
    prisma.connection.count({ where: { status: "ACCEPTED" } }),
    prisma.profile.count({ where: { isOpenToNetworking: true } }),
    prisma.post.count(),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.cafe.findMany({
      orderBy: { reviewCount: "desc" },
      take: 6,
      select: { id: true, name: true, slug: true, reviewCount: true, rating: true, vibeScore: true, heroImageUrl: true, featured: true },
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { name: true } }, cafe: { select: { name: true } } },
    }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, email: true, createdAt: true, role: true } }),
    prisma.user.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.post.findMany({ where: { createdAt: { gte: thirtyDaysAgo } }, select: { createdAt: true } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { _all: true } }),
    prisma.promoCodeRedemption.count(),
  ]);

  const plusCount = subscriptionsByPlan.find((s) => s.plan === "PLUS")?._count._all ?? 0;
  const proCount = subscriptionsByPlan.find((s) => s.plan === "PRO")?._count._all ?? 0;
  const mrr = plusCount * PLAN_PRICES.PLUS + proCount * PLAN_PRICES.PRO;

  const [visitsByCity, reviewsByRating] = await Promise.all([
    prisma.cafe.groupBy({ by: ["city"], _count: { _all: true } }),
    prisma.review.groupBy({ by: ["rating"], _count: { _all: true } }),
  ]);

  return {
    totals: {
      totalUsers, totalCafes, totalReviews, totalEvents, totalConnections, activeNetworkers, totalPosts, bannedUsers,
      plusCount, proCount, mrr, totalPromoRedemptions,
    },
    popularCafes,
    recentReviews,
    recentUsers,
    citiesChart: visitsByCity.map((c) => ({ name: c.city, value: c._count._all })),
    ratingsChart: [1, 2, 3, 4, 5].map((r) => ({
      name: `${r}★`,
      value: reviewsByRating.find((rr) => rr.rating === r)?._count._all ?? 0,
    })),
    signupsChart: bucketByDay(recentSignupDates.map((u) => u.createdAt), 30),
    postsChart: bucketByDay(recentPostDates.map((p) => p.createdAt), 30),
  };
}
