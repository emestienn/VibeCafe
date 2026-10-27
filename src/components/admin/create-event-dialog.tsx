"use client";

import { Plus } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { WORK_SESSION_CATEGORIES } from "@/lib/constants";
import { CafeCombobox } from "@/components/post/cafe-combobox";

type CafeOption = { id: string; name: string; slug: string; heroImageUrl: string; neighborhood: string };

function toLocalInputValue(d: Date) {
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function CreateEventDialog() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(WORK_SESSION_CATEGORIES[0]);
  const [cafe, setCafe] = useState<CafeOption | null>(null);
  const [startAt, setStartAt] = useState(() => toLocalInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)));
  const [capacity, setCapacity] = useState(20);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim() || !description.trim() || !cafe) {
      toast.error(t("selectCafe"));
      return;
    }
    setSubmitting(true);
    try {
      const start = new Date(startAt);
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description, category, cafeId: cafe.id,
          startAt: start.toISOString(), endAt: end.toISOString(), capacity,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("updated"));
      setOpen(false);
      setTitle("");
      setDescription("");
      setCafe(null);
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="size-4" /> {t("createEvent")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newEvent")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>{t("title")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>{t("description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={3} />
          </div>
          <div>
            <Label>{t("category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORK_SESSION_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t("selectCafe")}</Label>
            <div className="mt-1.5">
              <CafeCombobox value={cafe} onChange={setCafe} placeholder={t("selectCafe")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("startDate")}</Label>
              <Input type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label>{t("capacity")}</Label>
              <Input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} className="mt-1.5" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button onClick={submit} disabled={submitting}>{t("create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
