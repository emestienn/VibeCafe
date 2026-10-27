import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.commentLike.findUnique({
    where: { commentId_userId: { commentId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.commentLike.delete({ where: { id: existing.id } }),
      prisma.comment.update({ where: { id }, data: { likeCount: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.commentLike.create({ data: { commentId: id, userId: session.user.id } }),
    prisma.comment.update({ where: { id }, data: { likeCount: { increment: 1 } } }),
  ]);
  return NextResponse.json({ liked: true });
}
