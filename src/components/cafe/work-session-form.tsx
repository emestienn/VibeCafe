"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INTERESTS, WORK_SESSION_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function WorkSessionForm({ cafeId }: { cafeId: string }) {
  const t = useTranslations("cafe");
  const tCommon = useTranslations("common");
  const { status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(WORK_SESSION_CATEGORIES[0]);
  const [topics, setTopics] = useState<string[]>([]);
  const [hours, setHours] = useState(2);
  const [submitting, setSubmitting] = useState(false);

  const toggleTopic = (topic: string) => {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : prev.length < 3 ? [...prev, topic] : prev));
  };

  const submit = async () => {
    if (!title.trim()) {
      toast.error(t("giveTitleError"));
      return;
    }
    setSubmitting(true);
    try {
      const untilTime = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
      const res = await fetch("/api/work-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cafeId, title, category, topics, untilTime }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("postedWorkSession"));
      setOpen(false);
      setTitle("");
      setTopics([]);
      router.refresh();
    } catch {
      toast.error(t("postFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      if (next && status !== "authenticated") {
        router.push("/signin");
        return;
      }
      setOpen(next);
    }}>
      <DialogTrigger asChild>
        <Button size="sm">{t("postWorkingOn")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("workingWithMe")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("titlePlaceholder")} />

          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORK_SESSION_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <div>
            <p className="mb-2 text-sm text-muted-foreground">{t("interestedInUpTo3")}</p>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.slice(0, 14).map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    topics.includes(topic) ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
                  )}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("hereFor")}</span>
            <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 6].map((h) => <SelectItem key={h} value={String(h)}>{h} {h > 1 ? tCommon("hours") : tCommon("hour")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? tCommon("posting") : tCommon("post")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
