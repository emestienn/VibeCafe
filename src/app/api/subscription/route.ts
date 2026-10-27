import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { awardCoins, grantMonthlyStreakFreezes, PLAN_PRICES } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";

const upgradeSchema = z.object({
  plan: z.enum(["FREE", "PLUS", "PRO"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  return NextResponse.json(sub ?? { plan: "FREE" });
}

// Mocked checkout: no real payment provider is wired up yet, so an upgrade
// activates immediately. Structured so a real gateway (Click/Payme/Stripe)
// can be dropped in behind this same endpoint later.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = upgradeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { plan } = parsed.data;
  const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const sub = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, plan, renewsAt },
    update: { plan, renewsAt, cancelledAt: null },
  });

  const freezes = grantMonthlyStreakFreezes(plan);
  if (freezes > 0) {
    await prisma.profile.update({ where: { userId: session.user.id }, data: { streakFreezes: freezes } });
  }

  if (plan !== "FREE") {
    await awardCoins(session.user.id, "SUBSCRIPTION_BONUS", 100);
  }

  return NextResponse.json({ subscription: sub, priceUzs: PLAN_PRICES[plan] });
}
