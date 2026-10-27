import { Coffee } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const t = useTranslations("errors");
  const tNav = useTranslations("nav");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent-foreground">
        <Coffee className="size-6" />
      </span>
      <h1 className="mt-5 font-display text-3xl">{t("notFoundTitle")}</h1>
      <p className="mt-2 text-muted-foreground">{t("notFoundDesc")}</p>
      <Button asChild className="mt-6">
        <Link href="/discover">{tNav("exploreCafes")}</Link>
      </Button>
    </div>
  );
}
