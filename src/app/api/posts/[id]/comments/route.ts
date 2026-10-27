import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { postId: id, parentId: null },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parsed = commentSchema.safeParse({ ...(await request.json().catch(() => null)), postId: id });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.post.update({ where: { id }, data: { commentCount: { increment: 1 } } }),
  ]);

  return NextResponse.json(comment, { status: 201 });
}
