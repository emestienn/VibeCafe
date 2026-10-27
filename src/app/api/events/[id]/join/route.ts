import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.eventParticipant.upsert({
    where: { eventId_userId: { eventId: id, userId: session.user.id } },
    update: {},
    create: { eventId: id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.eventParticipant
    .delete({ where: { eventId_userId: { eventId: id, userId: session.user.id } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
