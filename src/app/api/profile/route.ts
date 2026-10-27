import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = profileSchema.partial().safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { interests, ...rest } = parsed.data;

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      ...rest,
      ...(interests
        ? {
            interests: {
              set: [],
              connectOrCreate: interests.map((name) => ({
                where: { name },
                create: { name },
              })),
            },
          }
        : {}),
    },
    include: { interests: true },
  });

  return NextResponse.json(profile);
}
