import { prisma } from "@/lib/prisma";

export async function getUpcomingEvents() {
  return prisma.event.findMany({
    where: { startAt: { gte: new Date() } },
    include: {
      cafe: { select: { id: true, name: true, slug: true, neighborhood: true, city: true } },
      organizer: { select: { id: true, name: true, image: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { startAt: "asc" },
  });
}

export async function getEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      cafe: { select: { id: true, name: true, slug: true, neighborhood: true, city: true, heroImageUrl: true } },
      organizer: { select: { id: true, name: true, image: true } },
      participants: {
        include: { user: { select: { id: true, name: true, image: true } } },
        take: 24,
      },
      _count: { select: { participants: true } },
    },
  });
}
