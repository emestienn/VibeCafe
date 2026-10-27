import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const cafe = await prisma.cafe.findUnique({ where: { id }, select: { featured: true } });
  if (!cafe) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.cafe.update({ where: { id }, data: { featured: !cafe.featured } });
  return NextResponse.json(updated);
}
