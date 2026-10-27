import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { awardCoins, touchStreak } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = postSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { images, ...data } = parsed.data;

  const post = await prisma.post.create({
    data: {
      ...data,
      userId: session.user.id,
      images: { create: images.map((url, position) => ({ url, position })) },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      cafe: { select: { id: true, name: true, slug: true } },
      images: true,
    },
  });

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { points: { increment: 10 } },
  }).catch(() => null);
  await touchStreak(session.user.id).catch(() => null);
  await awardCoins(session.user.id, "POST", 8).catch(() => null);

  return NextResponse.json(post, { status: 201 });
}
