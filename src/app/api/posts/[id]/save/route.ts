import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.postSave.findUnique({
    where: { postId_userId: { postId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.postSave.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.postSave.create({ data: { postId: id, userId: session.user.id } });
  return NextResponse.json({ saved: true });
}
