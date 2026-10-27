"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type CafeOption = { id: string; name: string; slug: string; heroImageUrl: string; neighborhood: string };

export function CafeCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: CafeOption | null;
  onChange: (cafe: CafeOption) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<CafeOption[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`/api/cafes?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then(setOptions)
        .catch(() => setOptions([]));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value ? value.name : query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="h-11 w-full rounded-xl border border-input bg-surface pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      {open && options.length > 0 && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {options.map((cafe) => (
            <button
              key={cafe.id}
              type="button"
              onClick={() => {
                onChange(cafe);
                setQuery("");
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted",
                value?.id === cafe.id && "bg-accent-soft",
              )}
            >
              <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
                <Image src={cafe.heroImageUrl} alt={cafe.name} fill className="object-cover" sizes="32px" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{cafe.name}</p>
                <p className="truncate text-xs text-muted-foreground">{cafe.neighborhood}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
