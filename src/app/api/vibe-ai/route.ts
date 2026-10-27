import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { getCafes } from "@/lib/data/cafes";
import { getCommunityProfiles } from "@/lib/data/community";
import { canUseAiQuery } from "@/lib/monetization";
import { prisma } from "@/lib/prisma";
import { buildReply, matchBreakdown, parseVibeQuery, type AiLocale } from "@/lib/vibe-ai";

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  locale: z.enum(["uz", "ru", "en"]).default("uz"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const session = await auth();

  if (session?.user) {
    const quota = await canUseAiQuery(session.user.id);
    if (!quota.allowed) {
      return NextResponse.json({ error: "AI_QUOTA_EXCEEDED", plan: quota.plan }, { status: 429 });
    }
  }

  const { message, locale } = parsed.data;
  const filters = parseVibeQuery(message);
  const cafes = await getCafes(filters);
  const top = cafes.slice(0, 5);

  const reply = buildReply(locale as AiLocale, top);
  const breakdown = top.length > 0 ? matchBreakdown(top[0], filters) : null;

  let connections: Awaited<ReturnType<typeof getCommunityProfiles>> = [];

  if (top.length > 0 && (filters.moods.includes("NETWORKING") || filters.meetings)) {
    const viewerProfile = session?.user
      ? await prisma.profile.findUnique({ where: { userId: session.user.id }, include: { interests: true } })
      : null;

    connections = await getCommunityProfiles({
      viewerId: session?.user?.id,
      viewerInterests: viewerProfile?.interests.map((i) => i.name) ?? [],
      onlyOpenToNetworking: true,
    });
    connections = connections.slice(0, 3);
  }

  return NextResponse.json({ reply, cafes: top, breakdown, connections });
}
