import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ userId: z.string() });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.userId === session.user.id) {
    return NextResponse.json({ error: "You can't follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId: parsed.data.userId } },
    update: {},
    create: { followerId: session.user.id, followingId: parsed.data.userId },
  });

  await prisma.notification.create({
    data: {
      userId: parsed.data.userId,
      type: "FOLLOW",
      title: "New follower",
      body: `${session.user.name ?? "Someone"} started following you.`,
      link: `/profile/${session.user.id}`,
    },
  }).catch(() => null);

  return NextResponse.json({ following: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.follow
    .delete({ where: { followerId_followingId: { followerId: session.user.id, followingId: parsed.data.userId } } })
    .catch(() => null);

  return NextResponse.json({ following: false });
}
