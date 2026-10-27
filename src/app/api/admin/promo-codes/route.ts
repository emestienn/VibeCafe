import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  code: z.string().min(3).max(40),
  title: z.string().min(3).max(100),
  description: z.string().min(3).max(500),
  cafeId: z.string().optional(),
  discountPercent: z.number().int().min(1).max(100).optional(),
  requiredPlan: z.enum(["FREE", "PLUS", "PRO"]).default("PLUS"),
  maxRedemptions: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const promo = await prisma.promoCode.create({
    data: {
      ...parsed.data,
      code: parsed.data.code.trim().toUpperCase(),
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    },
  }).catch(() => null);

  if (!promo) return NextResponse.json({ error: "Code already exists" }, { status: 409 });

  return NextResponse.json(promo, { status: 201 });
}
