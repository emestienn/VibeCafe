import { interestMatchPercent, interestOverlap } from "@/lib/cafe-score";
import { prisma } from "@/lib/prisma";

export async function getCommunityProfiles({
  viewerId,
  viewerInterests = [],
  interestFilter,
  onlyOpenToNetworking = false,
}: {
  viewerId?: string;
  viewerInterests?: string[];
  interestFilter?: string;
  onlyOpenToNetworking?: boolean;
}) {
  const profiles = await prisma.profile.findMany({
    where: {
      ...(viewerId ? { userId: { not: viewerId } } : {}),
      ...(onlyOpenToNetworking ? { isOpenToNetworking: true, isVisibleForNetworking: true } : {}),
      ...(interestFilter ? { interests: { some: { name: interestFilter } } } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      interests: true,
      currentCafe: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { points: "desc" },
    take: 60,
  });

  let connectionStates = new Map<string, "none" | "pending" | "connected">();
  if (viewerId) {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: viewerId }, { recipientId: viewerId }],
      },
    });
    connectionStates = new Map(
      connections.map((c) => {
        const otherId = c.requesterId === viewerId ? c.recipientId : c.requesterId;
        const state = c.status === "ACCEPTED" ? "connected" : "pending";
        return [otherId, state];
      }),
    );
  }

  return profiles.map((p) => {
    const interestNames = p.interests.map((i) => i.name);
    return {
      userId: p.user.id,
      name: p.user.name ?? "VIBECAFE member",
      image: p.user.image,
      profession: p.profession,
      bio: p.bio,
      interests: interestNames,
      isOpenToNetworking: p.isOpenToNetworking,
      networkingMessage: p.networkingMessage,
      currentCafe: p.currentCafe,
      matchPercent: viewerInterests.length ? interestMatchPercent(viewerInterests, interestNames) : undefined,
      sharedInterests: viewerInterests.length ? interestOverlap(viewerInterests, interestNames) : [],
      connectionState: connectionStates.get(p.user.id) ?? "none",
    };
  });
}

export async function getActiveWorkSessions(cafeId?: string) {
  return prisma.workSession.findMany({
    where: { isActive: true, ...(cafeId ? { cafeId } : {}) },
    include: {
      user: { select: { id: true, name: true, image: true } },
      cafe: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function getPendingConnectionsForUser(userId: string) {
  return prisma.connection.findMany({
    where: { recipientId: userId, status: "PENDING" },
    include: { requester: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });
}
