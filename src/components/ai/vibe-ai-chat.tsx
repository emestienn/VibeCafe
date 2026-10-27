"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Send, Sparkles, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initials, priceLevelLabel } from "@/lib/utils";

import { useVibeAi } from "./vibe-ai-context";

type ChatCafe = {
  id: string;
  slug: string;
  name: string;
  heroImageUrl: string;
  vibeScore: number;
  priceLevel: number;
};

type ChatPerson = {
  userId: string;
  name: string;
  image: string | null;
  profession: string | null;
  matchPercent?: number;
};

type Breakdown = { overall: number; mood: number; work: number; wifi: number; atmosphere: number; price: number };

type Message = {
  role: "user" | "assistant";
  text: string;
  cafes?: ChatCafe[];
  breakdown?: Breakdown | null;
  connections?: ChatPerson[];
};

export function VibeAiChat() {
  const { open, setOpen, pendingMessage, consumePending } = useVibeAi();
  const t = useTranslations("vibeAi");
  const locale = useLocale();

  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: t("greeting") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [t("suggestion1"), t("suggestion2"), t("suggestion3"), t("suggestion4")];

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/vibe-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, locale }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, cafes: data.cafes, breakdown: data.breakdown, connections: data.connections },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: t("errorReply") }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
    }
  };

  useEffect(() => {
    if (open && pendingMessage) {
      const text = consumePending();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: auto-send a message handed off from elsewhere in the app when the panel opens
      if (text) send(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingMessage]);

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
        aria-label={t("title")}
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-40 right-4 z-40 flex h-128 w-88 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl lg:bottom-24 lg:right-6"
          >
            <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
              <Sparkles className="size-4" />
              <div>
                <p className="text-sm font-semibold">{t("title")}</p>
                <p className="text-[11px] text-primary-foreground/70">{t("subtitle")}</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "self-end" : "self-start"}>
                    <div
                      className={
                        m.role === "user"
                          ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                          : "max-w-[90%] rounded-2xl rounded-bl-sm bg-surface-muted px-3.5 py-2.5 text-sm"
                      }
                    >
                      {m.text}
                    </div>

                    {m.breakdown && (
                      <div className="mt-2 rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-accent-foreground">{t("whyThisPlace")}</span>
                          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-foreground">
                            {m.breakdown.overall}% {t("vibeMatch")}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-col gap-1.5">
                          {[
                            { label: t("breakdownMood"), value: m.breakdown.mood },
                            { label: t("breakdownWork"), value: m.breakdown.work },
                            { label: t("breakdownWifi"), value: m.breakdown.wifi },
                            { label: t("breakdownAtmosphere"), value: m.breakdown.atmosphere },
                            { label: t("breakdownPrice"), value: m.breakdown.price },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center gap-2">
                              <span className="w-20 shrink-0 text-[11px] text-muted-foreground">{row.label}</span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                                <div className="h-full rounded-full bg-accent" style={{ width: `${row.value}%` }} />
                              </div>
                              <span className="w-8 shrink-0 text-right text-[11px] font-medium">{row.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {m.cafes && m.cafes.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {m.cafes.map((cafe) => (
                          <Link
                            key={cafe.id}
                            href={`/cafe/${cafe.slug}`}
                            className="flex items-center gap-2.5 rounded-xl border border-border bg-card p-2 transition-colors hover:bg-surface-muted"
                          >
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
                              <Image src={cafe.heroImageUrl} alt={cafe.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold">{cafe.name}</p>
                              <p className="text-[11px] text-muted-foreground">Vibe {cafe.vibeScore} · {priceLevelLabel(cafe.priceLevel)}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {m.connections && m.connections.length > 0 && (
                      <div className="mt-2">
                        <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{t("potentialConnections")}</p>
                        <div className="flex flex-col gap-1.5">
                          {m.connections.map((person) => (
                            <Link
                              key={person.userId}
                              href={`/profile/${person.userId}`}
                              className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 transition-colors hover:bg-surface-muted"
                            >
                              <Avatar className="size-7">
                                <AvatarImage src={person.image ?? undefined} alt={person.name} />
                                <AvatarFallback className="text-[10px]">{initials(person.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">{person.name}</p>
                                {person.profession && <p className="text-[10px] text-muted-foreground">{person.profession}</p>}
                              </div>
                              {typeof person.matchPercent === "number" && (
                                <span className="text-[10px] font-semibold text-accent">{person.matchPercent}%</span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="self-start rounded-2xl rounded-bl-sm bg-surface-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                    {t("thinking")}
                  </div>
                )}
              </div>
            </div>

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-surface-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                className="h-10"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={loading}>
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
