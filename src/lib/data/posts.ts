import { prisma } from "@/lib/prisma";

const postInclude = {
  user: { select: { id: true, name: true, image: true } },
  cafe: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" } as const },
};

export async function getFeedPosts(viewerId?: string, take = 30) {
  const posts = await prisma.post.findMany({
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take,
  });

  if (!viewerId) return posts.map((p) => ({ ...p, initialLiked: false, initialSaved: false }));

  const [likes, saves] = await Promise.all([
    prisma.postLike.findMany({ where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } }, select: { postId: true } }),
    prisma.postSave.findMany({ where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } }, select: { postId: true } }),
  ]);
  const likedSet = new Set(likes.map((l) => l.postId));
  const savedSet = new Set(saves.map((s) => s.postId));

  return posts.map((p) => ({
    ...p,
    initialLiked: likedSet.has(p.id),
    initialSaved: savedSet.has(p.id),
  }));
}

export async function getCafePosts(cafeId: string, viewerId?: string, take = 12) {
  const posts = await prisma.post.findMany({
    where: { cafeId },
    include: postInclude,
    orderBy: { createdAt: "desc" },
    take,
  });

  if (!viewerId) return posts.map((p) => ({ ...p, initialLiked: false, initialSaved: false }));

  const likes = await prisma.postLike.findMany({
    where: { userId: viewerId, postId: { in: posts.map((p) => p.id) } },
    select: { postId: true },
  });
  const likedSet = new Set(likes.map((l) => l.postId));

  return posts.map((p) => ({ ...p, initialLiked: likedSet.has(p.id), initialSaved: false }));
}
