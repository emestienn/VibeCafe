import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  const cafes = await prisma.cafe.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    select: { id: true, name: true, slug: true, heroImageUrl: true, neighborhood: true },
    orderBy: { vibeScore: "desc" },
    take: 20,
  });

  return NextResponse.json(cafes);
}
