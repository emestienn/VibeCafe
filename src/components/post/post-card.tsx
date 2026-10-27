"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Heart, MapPin, MessageCircle, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VIBE_MOODS } from "@/lib/constants";
import { cn, formatRelativeTime, initials } from "@/lib/utils";

export type PostCardData = {
  id: string;
  type: "CAFE_POST" | "VIBE_POST";
  caption: string;
  vibeTags: string[];
  mood: string | null;
  energy: number | null;
  workingHours: number | null;
  music: string | null;
  drink: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: Date | string;
  images: { id: string; url: string }[];
  user: { id: string; name: string | null; image: string | null };
  cafe: { id: string; name: string; slug: string } | null;
  initialLiked?: boolean;
  initialSaved?: boolean;
};

type CommentData = {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
};

export function PostCard({ post }: { post: PostCardData }) {
  const t = useTranslations("post");
  const tCommon = useTranslations("common");
  const { status } = useSession();
  const router = useRouter();

  const [liked, setLiked] = useState(Boolean(post.initialLiked));
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [saved, setSaved] = useState(Boolean(post.initialSaved));
  const [burstKey, setBurstKey] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[] | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const lastTap = useRef(0);

  const requireAuth = () => {
    if (status !== "authenticated") {
      router.push("/signin");
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth()) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  };

  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked) {
        toggleLike();
        setBurstKey((k) => k + 1);
      }
    }
    lastTap.current = now;
  };

  const toggleSave = async () => {
    if (!requireAuth()) return;
    const next = !saved;
    setSaved(next);
    try {
      await fetch(`/api/posts/${post.id}/save`, { method: "POST" });
      toast.success(next ? t("saved") : t("unsaved"));
    } catch {
      setSaved(!next);
    }
  };

  const loadComments = async () => {
    setShowComments((s) => !s);
    if (comments === null) {
      const res = await fetch(`/api/posts/${post.id}/comments`).catch(() => null);
      if (res?.ok) setComments(await res.json());
      else setComments([]);
    }
  };

  const submitComment = async () => {
    if (!requireAuth() || !commentInput.trim()) return;
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentInput }),
      });
      if (!res.ok) throw new Error();
      const comment = await res.json();
      setComments((prev) => [...(prev ?? []), comment]);
      setCommentInput("");
    } catch {
      toast.error("Something went wrong.");
    }
  };

  const moodMeta = VIBE_MOODS.find((m) => m.key === post.mood);

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="flex items-center gap-2.5 p-4">
        <Link href={`/profile/${post.user.id}`}>
          <Avatar className="size-9">
            <AvatarImage src={post.user.image ?? undefined} alt={post.user.name ?? "Member"} />
            <AvatarFallback>{initials(post.user.name ?? "U")}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/profile/${post.user.id}`} className="text-sm font-semibold hover:underline">
            {post.user.name}
          </Link>
          {post.cafe && (
            <Link href={`/cafe/${post.cafe.slug}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <MapPin className="size-3" /> {post.cafe.name}
            </Link>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
      </div>

      {post.images.length > 0 && (
        <div onClick={handleImageTap} className="relative aspect-[4/3] w-full cursor-pointer select-none overflow-hidden bg-surface-muted">
          <Image src={post.images[0].url} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 500px" />
          {post.images.length > 1 && (
            <div className="absolute right-2 top-2 rounded-full bg-background/80 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
              1/{post.images.length}
            </div>
          )}
          <AnimatePresence>
            <motion.div
              key={burstKey}
              initial={{ opacity: burstKey === 0 ? 0 : 1, scale: 0.6 }}
              animate={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              {burstKey > 0 && <Heart className="size-24 fill-white text-white drop-shadow-lg" />}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {post.type === "VIBE_POST" && (
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
            {moodMeta && <span className="font-medium text-foreground">{moodMeta.emoji} {post.mood}</span>}
            {post.energy != null && <span>⚡ {post.energy}/10</span>}
            {post.workingHours != null && <span>⏱ {post.workingHours}{t("hoursShort")}</span>}
            {post.music && <span>🎵 {post.music}</span>}
            {post.drink && <span>☕ {post.drink}</span>}
          </div>
        )}

        <p className="text-sm leading-relaxed text-foreground/90">{post.caption}</p>

        {post.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.vibeTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="font-normal">#{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className="flex items-center gap-1.5 text-sm">
            <Heart className={cn("size-5 transition-colors", liked ? "fill-accent text-accent" : "text-foreground")} />
            {likeCount > 0 && <span className="text-muted-foreground">{likeCount}</span>}
          </button>
          <button onClick={loadComments} className="flex items-center gap-1.5 text-sm text-foreground">
            <MessageCircle className="size-5" />
            {post.commentCount > 0 && <span className="text-muted-foreground">{post.commentCount}</span>}
          </button>
          <button className="text-foreground">
            <Send className="size-5" />
          </button>
          <button onClick={toggleSave} className="ml-auto text-foreground">
            <Bookmark className={cn("size-5 transition-colors", saved ? "fill-foreground" : "")} />
          </button>
        </div>

        {showComments && (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            {comments === null ? (
              <p className="text-xs text-muted-foreground">{tCommon("loading")}</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("noComments")}</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={c.user.image ?? undefined} alt={c.user.name ?? "User"} />
                    <AvatarFallback className="text-[10px]">{initials(c.user.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-xs font-semibold">{c.user.name}</span>{" "}
                    <span className="text-xs text-foreground/90">{c.body}</span>
                  </div>
                </div>
              ))
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitComment();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={t("writeComment")}
                className="flex-1 rounded-full border border-border bg-surface px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="text-xs font-semibold text-accent">{t("send")}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
