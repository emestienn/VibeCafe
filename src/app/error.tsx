"use client";

import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-3xl">{t("errorTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("errorDesc")}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => reset()}>{t("tryAgain")}</Button>
        <Button asChild><Link href="/">{t("goHome")}</Link></Button>
      </div>
    </div>
  );
}
