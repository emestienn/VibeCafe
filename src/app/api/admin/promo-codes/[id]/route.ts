import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({ isActive: z.boolean() });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { id } = await params;
  const promo = await prisma.promoCode.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!promo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(promo);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { id } = await params;
  await prisma.promoCode.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
