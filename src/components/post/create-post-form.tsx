"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { VIBE_MOODS, VIBE_POST_DRINKS, VIBE_POST_MUSIC } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { CafeCombobox } from "./cafe-combobox";
import { PhotoUploader } from "./photo-uploader";

const VIBE_TAGS = ["Cozy", "Work", "Study", "Creative", "Social", "Calm", "Aesthetic"];

type CafeOption = { id: string; name: string; slug: string; heroImageUrl: string; neighborhood: string };

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)}>
          <Star className={cn("size-5", n <= value ? "fill-accent text-accent" : "text-border")} />
        </button>
      ))}
    </div>
  );
}

export function CreatePostForm() {
  const t = useTranslations("post");
  const router = useRouter();

  const [type, setType] = useState<"CAFE_POST" | "VIBE_POST">("CAFE_POST");
  const [images, setImages] = useState<string[]>([]);
  const [cafe, setCafe] = useState<CafeOption | null>(null);
  const [caption, setCaption] = useState("");
  const [vibeTags, setVibeTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [coffeeRating, setCoffeeRating] = useState(5);
  const [atmosphereRating, setAtmosphereRating] = useState(5);
  const [workRating, setWorkRating] = useState(5);
  const [wifiRating, setWifiRating] = useState(5);

  const [mood, setMood] = useState<string>(VIBE_MOODS[0].key);
  const [energy, setEnergy] = useState(7);
  const [workingHours, setWorkingHours] = useState(2);
  const [music, setMusic] = useState<string>(VIBE_POST_MUSIC[0]);
  const [drink, setDrink] = useState<string>(VIBE_POST_DRINKS[0]);

  const toggleTag = (tag: string) => {
    setVibeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 6 ? [...prev, tag] : prev));
  };

  const submit = async () => {
    if (!cafe) {
      toast.error(t("chooseCafeError"));
      return;
    }
    if (!caption.trim()) {
      toast.error(t("captionError"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          cafeId: cafe.id,
          caption,
          images,
          vibeTags,
          ...(type === "CAFE_POST"
            ? { coffeeRating, atmosphereRating, workRating, wifiRating }
            : { mood, energy, workingHours, music, drink }),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("published"));
      router.push("/feed");
      router.refresh();
    } catch {
      toast.error(t("publishFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("chooseType")}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setType("CAFE_POST")}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
              type === "CAFE_POST" ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
            )}
          >
            ☕ {t("cafePostLabel")}
          </button>
          <button
            type="button"
            onClick={() => setType("VIBE_POST")}
            className={cn(
              "rounded-xl border px-4 py-3 text-sm font-medium transition-colors",
              type === "VIBE_POST" ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
            )}
          >
            ✨ {t("vibePostLabel")}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("step1Title")}</p>
        <PhotoUploader images={images} onChange={setImages} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("step2Title")}</p>
        <CafeCombobox value={cafe} onChange={setCafe} placeholder={t("selectCafePlaceholder")} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("step3Title")}</p>
        <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t("bodyPlaceholder")} rows={4} />
      </div>

      {type === "CAFE_POST" ? (
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">{t("step4Title")}</p>
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border p-4">
            <RatingRow label="Coffee" value={coffeeRating} onChange={setCoffeeRating} />
            <RatingRow label="Atmosphere" value={atmosphereRating} onChange={setAtmosphereRating} />
            <RatingRow label="Work" value={workRating} onChange={setWorkRating} />
            <RatingRow label="Wi-Fi" value={wifiRating} onChange={setWifiRating} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border p-4">
          <div>
            <p className="mb-2 text-xs text-muted-foreground">{t("mood")}</p>
            <div className="flex flex-wrap gap-1.5">
              {VIBE_MOODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMood(m.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    mood === m.key ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
                  )}
                >
                  {m.emoji} {m.key}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("energy")}</span>
              <span>{energy}/10</span>
            </div>
            <Slider min={1} max={10} step={1} value={[energy]} onValueChange={(v) => setEnergy(v[0])} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">{t("working")}</p>
              <Select value={String(workingHours)} onValueChange={(v) => setWorkingHours(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 6, 8].map((h) => <SelectItem key={h} value={String(h)}>{h}h</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="mb-1.5 text-xs text-muted-foreground">{t("music")}</p>
              <Select value={music} onValueChange={setMusic}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VIBE_POST_MUSIC.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">{t("drink")}</p>
            <Select value={drink} onValueChange={setDrink}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VIBE_POST_DRINKS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">{t("step5Title")}</p>
        <div className="flex flex-wrap gap-1.5">
          {VIBE_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                vibeTags.includes(tag) ? "border-accent bg-accent-soft text-accent-foreground" : "border-border hover:bg-surface-muted",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <Button size="lg" onClick={submit} disabled={submitting}>
        {submitting ? t("publishing") : t("publish")}
      </Button>
    </div>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <StarInput value={value} onChange={onChange} />
    </div>
  );
}
