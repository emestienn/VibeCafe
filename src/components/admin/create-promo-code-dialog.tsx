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
import { CafeCombobox } from "@/components/post/cafe-combobox";

type CafeOption = { id: string; name: string; slug: string; heroImageUrl: string; neighborhood: string };
type PlanTier = "FREE" | "PLUS" | "PRO";

export function CreatePromoCodeDialog() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [requiredPlan, setRequiredPlan] = useState<PlanTier>("PLUS");
  const [maxRedemptions, setMaxRedemptions] = useState<number | "">("");
  const [cafe, setCafe] = useState<CafeOption | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!code.trim() || !title.trim() || !description.trim()) {
      toast.error(t("noResults"));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          title,
          description,
          discountPercent,
          requiredPlan,
          cafeId: cafe?.id,
          maxRedemptions: maxRedemptions === "" ? undefined : maxRedemptions,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(t("updated"));
      setOpen(false);
      setCode("");
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
        <Button size="sm"><Plus className="size-4" /> {t("newPromoCode")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("newPromoCode")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div>
            <Label>{t("codeLabel")}</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="mt-1.5 font-mono" />
          </div>
          <div>
            <Label>{t("title")}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>{t("description")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("discountLabel")}</Label>
              <Input type="number" min={1} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="mt-1.5" />
            </div>
            <div>
              <Label>{t("requiredPlanLabel")}</Label>
              <Select value={requiredPlan} onValueChange={(v) => setRequiredPlan(v as PlanTier)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">FREE</SelectItem>
                  <SelectItem value="PLUS">PLUS</SelectItem>
                  <SelectItem value="PRO">PRO</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>{t("optionalCafe")}</Label>
            <div className="mt-1.5">
              <CafeCombobox value={cafe} onChange={setCafe} placeholder={t("anyCafe")} />
            </div>
          </div>
          <div>
            <Label>{t("maxRedemptionsLabel")}</Label>
            <Input
              type="number"
              min={1}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(e.target.value === "" ? "" : Number(e.target.value))}
              className="mt-1.5"
            />
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
