import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getUserPlan, planMeetsRequirement } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  const codes = await prisma.promoCode.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      cafe: { select: { id: true, name: true, slug: true, heroImageUrl: true } },
      _count: { select: { redemptions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const plan = session?.user ? await getUserPlan(session.user.id) : "FREE";

  const redeemedIds = session?.user
    ? new Set(
        (
          await prisma.promoCodeRedemption.findMany({
            where: { userId: session.user.id },
            select: { promoCodeId: true },
          })
        ).map((r) => r.promoCodeId),
      )
    : new Set<string>();

  const result = codes
    .filter((c) => c.maxRedemptions === null || c._count.redemptions < c.maxRedemptions)
    .map((c) => ({
      ...c,
      locked: !planMeetsRequirement(plan, c.requiredPlan),
      redeemed: redeemedIds.has(c.id),
    }));

  return NextResponse.json(result);
}
