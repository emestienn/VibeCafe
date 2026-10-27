import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { awardCoins, touchStreak } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: { ...parsed.data, userId: session.user.id },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  const agg = await prisma.review.aggregate({
    where: { cafeId: parsed.data.cafeId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.cafe.update({
    where: { id: parsed.data.cafeId },
    data: {
      rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : parsed.data.rating,
      reviewCount: agg._count,
    },
  });

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { points: { increment: 15 } },
  }).catch(() => null);
  await touchStreak(session.user.id).catch(() => null);
  await awardCoins(session.user.id, "REVIEW", 12).catch(() => null);

  return NextResponse.json(review, { status: 201 });
}
