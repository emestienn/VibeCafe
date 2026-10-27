"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Input } from "@/components/ui/input";

export function AdminSearch({ initialValue = "", paramName = "q" }: { initialValue?: string; paramName?: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams(window.location.search);
        if (value) params.set(paramName, value);
        else params.delete(paramName);
        router.push(`${window.location.pathname}?${params.toString()}`);
      }}
      className="relative max-w-xs flex-1"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("search")} className="pl-10" />
    </form>
  );
}
