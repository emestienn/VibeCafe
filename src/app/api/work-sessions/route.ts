import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { workSessionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = workSessionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });

  const workSession = await prisma.workSession.create({
    data: {
      userId: session.user.id,
      cafeId: parsed.data.cafeId,
      title: parsed.data.title,
      category: parsed.data.category,
      topics: parsed.data.topics,
      untilTime: parsed.data.untilTime ? new Date(parsed.data.untilTime) : undefined,
    },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(workSession, { status: 201 });
}
