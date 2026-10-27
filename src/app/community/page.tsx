import type { Metadata } from "next";

import { CommunityView } from "@/components/community/community-view";
import { auth } from "@/lib/auth";
import { INTERESTS } from "@/lib/constants";
import { getActiveWorkSessions, getCommunityProfiles } from "@/lib/data/community";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Community" };

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const interestFilter = typeof sp.interest === "string" ? sp.interest : undefined;

  const session = await auth();
  const viewerProfile = session?.user
    ? await prisma.profile.findUnique({
        where: { userId: session.user.id },
        include: { interests: true },
      })
    : null;

  const [profiles, workSessions] = await Promise.all([
    getCommunityProfiles({
      viewerId: session?.user?.id,
      viewerInterests: viewerProfile?.interests.map((i) => i.name) ?? [],
      interestFilter,
    }),
    getActiveWorkSessions(),
  ]);

  return (
    <CommunityView
      profiles={profiles}
      workSessions={workSessions}
      interests={INTERESTS}
      activeInterest={interestFilter}
    />
  );
}
