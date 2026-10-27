"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import type { MenuCategory } from "@prisma/client";

const CATEGORY_I18N_KEYS: Record<MenuCategory, string> = {
  COFFEE: "coffee",
  TEA: "tea",
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DESSERTS: "desserts",
  DRINKS: "drinks",
};

type MenuItem = {
  id: string;
  category: MenuCategory;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isPopular: boolean;
};

export function MenuTabs({ items }: { items: MenuItem[] }) {
  const t = useTranslations("cafe");
  const categories = (Object.keys(CATEGORY_I18N_KEYS) as MenuCategory[]).filter((cat) =>
    items.some((i) => i.category === cat),
  );

  if (categories.length === 0) return null;

  return (
    <Tabs defaultValue={categories[0]}>
      <TabsList className="flex-wrap">
        {categories.map((cat) => (
          <TabsTrigger key={cat} value={cat}>{t(`menuCategory.${CATEGORY_I18N_KEYS[cat]}`)}</TabsTrigger>
        ))}
      </TabsList>
      {categories.map((cat) => (
        <TabsContent key={cat} value={cat}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.filter((i) => i.category === cat).map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                {item.imageUrl && (
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display text-base leading-tight">{item.name}</p>
                    {item.isPopular && <Badge variant="accent" className="shrink-0">{t("popular")}</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                  <p className="mt-2 text-sm font-semibold">{formatPrice(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
