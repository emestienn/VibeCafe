import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connectionRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = connectionRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  if (parsed.data.recipientId === session.user.id) {
    return NextResponse.json({ error: "You can't connect with yourself" }, { status: 400 });
  }

  const connection = await prisma.connection.upsert({
    where: {
      requesterId_recipientId: {
        requesterId: session.user.id,
        recipientId: parsed.data.recipientId,
      },
    },
    update: {},
    create: {
      requesterId: session.user.id,
      recipientId: parsed.data.recipientId,
      message: parsed.data.message,
      status: "PENDING",
    },
  });

  await prisma.notification.create({
    data: {
      userId: parsed.data.recipientId,
      type: "CONNECTION_REQUEST",
      title: "New connection request",
      body: `${session.user.name ?? "Someone"} wants to connect with you.`,
      link: "/networking",
    },
  }).catch(() => null);

  return NextResponse.json(connection, { status: 201 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { connectionId?: string; status?: "ACCEPTED" | "DECLINED" } | null;
  if (!body?.connectionId || !body.status) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const connection = await prisma.connection.findUnique({ where: { id: body.connectionId } });
  if (!connection || connection.recipientId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.connection.update({
    where: { id: body.connectionId },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
