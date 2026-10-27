import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  cafeId: z.string(),
  collectionId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_cafeId: { userId: session.user.id, cafeId: parsed.data.cafeId } },
    update: { collectionId: parsed.data.collectionId ?? undefined },
    create: {
      userId: session.user.id,
      cafeId: parsed.data.cafeId,
      collectionId: parsed.data.collectionId ?? null,
    },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await prisma.favorite
    .delete({ where: { userId_cafeId: { userId: session.user.id, cafeId: parsed.data.cafeId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
