import { CalendarDays, Coffee, Sparkles, Star, TrendingUp, Users2 } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/common/empty-state";
import { PostCard } from "@/components/post/post-card";
import { auth } from "@/lib/auth";
import { getPersonalizedFeed, type FeedItem } from "@/lib/data/feed";
import { getFeedPosts } from "@/lib/data/posts";
import { formatRelativeTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Your feed" };

const ICONS: Record<FeedItem["type"], React.ElementType> = {
  review: Star,
  connection: Users2,
  event: CalendarDays,
  "new-cafe": Sparkles,
  trending: TrendingUp,
  "work-session": Coffee,
};

export default async function FeedPage() {
  const session = await auth();
  const [posts, items, t, tPost] = await Promise.all([
    getFeedPosts(session?.user?.id),
    getPersonalizedFeed(),
    getTranslations("feed"),
    getTranslations("post"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <span className="text-sm font-semibold uppercase tracking-wider text-accent">{t("eyebrow")}</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">{t("title")}</h1>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList>
          <TabsTrigger value="posts">{t("postsTab")}</TabsTrigger>
          <TabsTrigger value="activity">{t("activityTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <div className="flex flex-col gap-4">
            {posts.length === 0 ? (
              <EmptyState icon={Sparkles} title={tPost("noPostsYet")} description={tPost("beFirstToPost")} />
            ) : (
              posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="flex flex-col gap-3">
            {items.length === 0 ? (
              <EmptyState icon={Sparkles} title={t("emptyTitle")} description={t("emptyDesc")} />
            ) : (
              items.map((item) => {
                const Icon = ICONS[item.type];
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-surface-muted"
                  >
                    {item.actorImage !== undefined ? (
                      <Avatar className="size-10 shrink-0">
                        <AvatarImage src={item.actorImage ?? undefined} alt={item.actorName ?? "Member"} />
                        <AvatarFallback>{initials(item.actorName ?? "U")}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-foreground">
                        <Icon className="size-4" />
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                    {item.cafeImage && (
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl">
                        <Image src={item.cafeImage} alt="" fill className="object-cover" sizes="56px" />
                      </div>
                    )}
                  </Link>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
