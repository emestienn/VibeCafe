import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { awardCoins, touchStreak } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";
import { networkingStatusSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = networkingStatusSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const previous = await prisma.profile.findUnique({ where: { userId: session.user.id } });

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: parsed.data,
  });

  const isNewCheckIn = parsed.data.currentCafeId && parsed.data.currentCafeId !== previous?.currentCafeId;
  if (isNewCheckIn) {
    await touchStreak(session.user.id);
    await awardCoins(session.user.id, "CHECK_IN", 5);
  }

  return NextResponse.json(profile);
}
