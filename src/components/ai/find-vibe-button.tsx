"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useVibeAi } from "./vibe-ai-context";

export function FindVibeButton({ className, variant = "default", size = "sm" }: {
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
}) {
  const { setOpen } = useVibeAi();
  const t = useTranslations("nav");

  return (
    <Button variant={variant} size={size} onClick={() => setOpen(true)} className={cn(className)}>
      <Sparkles className="size-4" /> {t("findMyVibe")}
    </Button>
  );
}
