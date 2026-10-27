"use client";

import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INTERESTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function EditProfileDialog({
  initial,
}: {
  initial: {
    profession: string | null;
    bio: string | null;
    location: string | null;
    goals: string | null;
    interests: string[];
  };
}) {
  const t = useTranslations("profile");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [profession, setProfession] = useState(initial.profession ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [goals, setGoals] = useState(initial.goals ?? "");
  const [interests, setInterests] = useState<string[]>(initial.interests);
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : prev.length < 10 ? [...prev, interest] : prev,
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profession, bio, location, goals, interests }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("profileUpdated"));
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(t("profileUpdateFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Pencil className="size-3.5" /> {t("editProfile")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editProfile")}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="profession">{t("profession")}</Label>
            <Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="location">{t("location")}</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="bio">{t("bio")}</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" rows={3} />
          </div>
          <div>
            <Label htmlFor="goals">{t("goal")}</Label>
            <Input id="goals" value={goals} onChange={(e) => setGoals(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>{t("interests")}</Label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    interests.includes(interest)
                      ? "border-accent bg-accent-soft text-accent-foreground"
                      : "border-border hover:bg-surface-muted",
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
