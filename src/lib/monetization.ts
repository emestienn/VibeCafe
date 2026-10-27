import { prisma } from "@/lib/prisma";
import type { PlanTier } from "@prisma/client";

export const PLAN_LIMITS: Record<PlanTier, { aiQueriesPerDay: number; coinMultiplier: number; streakFreezesPerMonth: number }> = {
  FREE: { aiQueriesPerDay: 5, coinMultiplier: 1, streakFreezesPerMonth: 0 },
  PLUS: { aiQueriesPerDay: Infinity, coinMultiplier: 2, streakFreezesPerMonth: 1 },
  PRO: { aiQueriesPerDay: Infinity, coinMultiplier: 3, streakFreezesPerMonth: 3 },
};

// Monthly price in UZS ("so'm").
export const PLAN_PRICES: Record<PlanTier, number> = {
  FREE: 0,
  PLUS: 15000,
  PRO: 39000,
};

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function daysBetween(a: Date, b: Date) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / 86_400_000);
}

export async function getUserPlan(userId: string): Promise<PlanTier> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.plan ?? "FREE";
}

export async function awardCoins(userId: string, reason: string, baseAmount: number) {
  const plan = await getUserPlan(userId);
  const amount = Math.round(baseAmount * PLAN_LIMITS[plan].coinMultiplier);

  await prisma.$transaction([
    prisma.profile.update({ where: { userId }, data: { coins: { increment: amount } } }),
    prisma.coinTransaction.create({ data: { userId, amount, reason } }),
  ]);

  return amount;
}

export async function touchStreak(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return;

  const now = new Date();

  if (!profile.lastActiveDate) {
    await prisma.profile.update({
      where: { userId },
      data: { currentStreak: 1, longestStreak: Math.max(1, profile.longestStreak), lastActiveDate: now },
    });
    return;
  }

  if (isSameDay(profile.lastActiveDate, now)) return;

  const gap = daysBetween(profile.lastActiveDate, now);

  if (gap === 1) {
    const streak = profile.currentStreak + 1;
    await prisma.profile.update({
      where: { userId },
      data: { currentStreak: streak, longestStreak: Math.max(streak, profile.longestStreak), lastActiveDate: now },
    });
    await awardCoins(userId, "STREAK_BONUS", streak % 7 === 0 ? 50 : 5);
    return;
  }

  if (gap > 1 && profile.streakFreezes > 0) {
    const streak = profile.currentStreak + 1;
    await prisma.profile.update({
      where: { userId },
      data: {
        currentStreak: streak,
        longestStreak: Math.max(streak, profile.longestStreak),
        lastActiveDate: now,
        streakFreezes: { decrement: 1 },
      },
    });
    return;
  }

  await prisma.profile.update({
    where: { userId },
    data: { currentStreak: 1, lastActiveDate: now },
  });
}

export async function canUseAiQuery(userId: string): Promise<{ allowed: boolean; remaining: number; plan: PlanTier }> {
  const [plan, profile] = await Promise.all([
    getUserPlan(userId),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const limit = PLAN_LIMITS[plan].aiQueriesPerDay;
  if (!profile || limit === Infinity) return { allowed: true, remaining: Infinity, plan };

  const now = new Date();
  const usedToday = profile.aiQueriesDate && isSameDay(profile.aiQueriesDate, now) ? profile.aiQueriesToday : 0;

  if (usedToday >= limit) return { allowed: false, remaining: 0, plan };

  await prisma.profile.update({
    where: { userId },
    data: { aiQueriesToday: usedToday + 1, aiQueriesDate: now },
  });

  return { allowed: true, remaining: limit - usedToday - 1, plan };
}

export function grantMonthlyStreakFreezes(plan: PlanTier) {
  return PLAN_LIMITS[plan].streakFreezesPerMonth;
}

const PLAN_RANK: Record<PlanTier, number> = { FREE: 0, PLUS: 1, PRO: 2 };

export function planMeetsRequirement(userPlan: PlanTier, requiredPlan: PlanTier) {
  return PLAN_RANK[userPlan] >= PLAN_RANK[requiredPlan];
}
