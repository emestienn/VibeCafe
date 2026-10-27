import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getUserPlan, planMeetsRequirement } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ code: z.string().min(1).max(40) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: parsed.data.code.trim().toUpperCase() },
    include: { cafe: { select: { name: true, slug: true } }, _count: { select: { redemptions: true } } },
  });

  if (!promo || !promo.isActive) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "EXPIRED" }, { status: 400 });
  }
  if (promo.maxRedemptions !== null && promo._count.redemptions >= promo.maxRedemptions) {
    return NextResponse.json({ error: "SOLD_OUT" }, { status: 400 });
  }

  const plan = await getUserPlan(session.user.id);
  if (!planMeetsRequirement(plan, promo.requiredPlan)) {
    return NextResponse.json({ error: "PLAN_REQUIRED", requiredPlan: promo.requiredPlan }, { status: 403 });
  }

  const existing = await prisma.promoCodeRedemption.findUnique({
    where: { promoCodeId_userId: { promoCodeId: promo.id, userId: session.user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "ALREADY_REDEEMED" }, { status: 400 });
  }

  const redemption = await prisma.promoCodeRedemption.create({
    data: { promoCodeId: promo.id, userId: session.user.id },
  });

  return NextResponse.json({
    redemption,
    title: promo.title,
    description: promo.description,
    discountPercent: promo.discountPercent,
    cafe: promo.cafe,
  }, { status: 201 });
}
