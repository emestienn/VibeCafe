import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({ reaction: z.string().default("LIKE") });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { reaction } = bodySchema.parse(await request.json().catch(() => ({})));

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.postLike.delete({ where: { id: existing.id } }),
      prisma.post.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.postLike.create({ data: { postId: id, userId: session.user.id, reaction } }),
    prisma.post.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
  ]);
  return NextResponse.json({ liked: true });
}
