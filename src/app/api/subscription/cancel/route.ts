import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, plan: "FREE", cancelledAt: new Date() },
    update: { plan: "FREE", cancelledAt: new Date(), renewsAt: null },
  });

  return NextResponse.json(sub);
}
