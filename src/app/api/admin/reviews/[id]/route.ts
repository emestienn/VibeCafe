import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id }, select: { cafeId: true } });
  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.review.delete({ where: { id } });

  const agg = await prisma.review.aggregate({ where: { cafeId: review.cafeId }, _avg: { rating: true }, _count: true });
  await prisma.cafe.update({
    where: { id: review.cafeId },
    data: { rating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0, reviewCount: agg._count },
  });

  return NextResponse.json({ ok: true });
}
