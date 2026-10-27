import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { DeleteButton } from "@/components/admin/delete-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { formatRelativeTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin · Posts" };

export default async function AdminPostsPage() {
  const [posts, t] = await Promise.all([
    prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        user: { select: { id: true, name: true, image: true } },
        cafe: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    }),
    getTranslations("admin"),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl">{t("postsNav")}</h1>

      <div className="mt-6 flex flex-col gap-3">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">{t("noResults")}</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            {post.images[0] && (
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                <Image src={post.images[0].url} alt="" fill className="object-cover" sizes="56px" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Avatar className="size-5">
                  <AvatarImage src={post.user.image ?? undefined} alt={post.user.name ?? "User"} />
                  <AvatarFallback className="text-[9px]">{initials(post.user.name ?? "U")}</AvatarFallback>
                </Avatar>
                <Link href={`/profile/${post.user.id}`} className="text-sm font-medium hover:underline">{post.user.name}</Link>
                <Badge variant="secondary" className="font-normal">{post.type === "VIBE_POST" ? "Vibe" : "Café"}</Badge>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{post.caption}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {post.cafe?.name} · {formatRelativeTime(post.createdAt)} · ❤ {post.likeCount} · 💬 {post.commentCount}
              </p>
            </div>
            <DeleteButton url={`/api/admin/posts/${post.id}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
