import { prisma } from "@/lib/prisma";

export async function getFullProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: { include: { interests: true, currentCafe: { select: { id: true, name: true, slug: true } } } },
      subscription: true,
      reviews: {
        include: { cafe: { select: { id: true, name: true, slug: true, heroImageUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      favorites: {
        include: { cafe: true, collection: true },
        orderBy: { createdAt: "desc" },
      },
      collections: { include: { favorites: { include: { cafe: true } } } },
      eventParticipations: {
        include: { event: { include: { cafe: { select: { name: true, slug: true } } } } },
        orderBy: { event: { startAt: "asc" } },
      },
      connectionsSent: { where: { status: "ACCEPTED" }, include: { recipient: { select: { id: true, name: true, image: true } } } },
      connectionsReceived: { where: { status: "ACCEPTED" }, include: { requester: { select: { id: true, name: true, image: true } } } },
      posts: {
        include: {
          images: { orderBy: { position: "asc" } },
          user: { select: { id: true, name: true, image: true } },
          cafe: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 24,
      },
      _count: {
        select: { reviews: true, favorites: true, cafeVisits: true, posts: true, followedBy: true, following: true },
      },
    },
  });
}

export async function getFollowState(viewerId: string, profileUserId: string) {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: profileUserId } },
  });
  return Boolean(follow);
}
