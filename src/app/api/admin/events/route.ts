import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(1000),
  category: z.string().min(1),
  cafeId: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().int().min(1).max(500).optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: Request) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 7)}`;

  const event = await prisma.event.create({
    data: {
      slug,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      cafeId: parsed.data.cafeId,
      startAt: new Date(parsed.data.startAt),
      endAt: new Date(parsed.data.endAt),
      capacity: parsed.data.capacity,
      organizerId: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}
