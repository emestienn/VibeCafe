"use client";

import { ListFilter, Map as MapIcon, Search, SlidersHorizontal, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CafeCard } from "@/components/cafe/cafe-card";
import { StylizedMap } from "@/components/cafe/stylized-map";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { CITIES, MOODS, type MoodKey } from "@/lib/constants";
import type { CafeCard as CafeCardType, DiscoverFilters } from "@/lib/data/cafes";

const TOGGLE_FILTERS: { key: keyof DiscoverFilters; i18nKey: string; param: string }[] = [
  { key: "openNow", i18nKey: "openNow", param: "openNow" },
  { key: "quiet", i18nKey: "quiet", param: "quiet" },
  { key: "wifi", i18nKey: "fastWifi", param: "wifi" },
  { key: "outlets", i18nKey: "outlets", param: "outlets" },
  { key: "outdoor", i18nKey: "outdoorSeating", param: "outdoor" },
  { key: "petFriendly", i18nKey: "petFriendly", param: "pet" },
  { key: "meetings", i18nKey: "goodForMeetings", param: "meetings" },
  { key: "groups", i18nKey: "goodForGroups", param: "groups" },
];

export function DiscoverView({
  cafes,
  favoritedIds,
  initialFilters,
  initialView,
}: {
  cafes: CafeCardType[];
  favoritedIds: string[];
  initialFilters: DiscoverFilters;
  initialView: "list" | "map";
}) {
  const t = useTranslations("discover");
  const tMoods = useTranslations("moods");
  const router = useRouter();
  const [query, setQuery] = useState(initialFilters.query ?? "");
  const [mapOpen, setMapOpen] = useState(initialView === "map");
  const [activePin, setActivePin] = useState<string | null>(null);
  const favSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    router.push(`/discover?${params.toString()}`, { scroll: false });
  };

  const toggleMood = (mood: MoodKey) => {
    const current = initialFilters.moods ?? [];
    const next = current.includes(mood) ? current.filter((m) => m !== mood) : [...current, mood];
    pushParams({ moods: next.length ? next.join(",") : null });
  };

  const toggleFlag = (param: string, active: boolean) => {
    pushParams({ [param]: active ? null : "1" });
  };

  const activeToggleCount = TOGGLE_FILTERS.filter((f) => initialFilters[f.key]).length;

  const mapCafes = cafes.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    lat: c.lat,
    lng: c.lng,
    vibeScore: c.vibeScore,
    heroImageUrl: c.heroImageUrl,
    priceLevel: c.priceLevel,
    rating: c.rating,
  }));

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("resultsCount", { count: cafes.length })}</p>
      </div>

      {/* Search + sort + filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            pushParams({ q: query || null });
          }}
          className="relative flex-1"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-10"
          />
        </form>

        <Select value={initialFilters.city ?? "all"} onValueChange={(v) => pushParams({ city: v === "all" ? null : v })}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t("allCities")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCities")}</SelectItem>
            {CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={initialFilters.sort ?? "vibe"} onValueChange={(v) => pushParams({ sort: v })}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="vibe">{t("sortVibe")}</SelectItem>
            <SelectItem value="rating">{t("sortRating")}</SelectItem>
            <SelectItem value="price-low">{t("sortPriceLow")}</SelectItem>
            <SelectItem value="price-high">{t("sortPriceHigh")}</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0">
              <SlidersHorizontal className="size-4" /> {t("filters")}
              {activeToggleCount > 0 && <Badge className="ml-1 px-1.5">{activeToggleCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>{t("filters")}</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-8">
              <div>
                <p className="mb-2 text-sm font-medium">{t("maxPrice")}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((level) => (
                    <button
                      key={level}
                      onClick={() => pushParams({ price: initialFilters.maxPrice === level ? null : String(level) })}
                      className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                        initialFilters.maxPrice === level
                          ? "border-accent bg-accent-soft text-accent-foreground"
                          : "border-border hover:bg-surface-muted"
                      }`}
                    >
                      {"$".repeat(level)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {TOGGLE_FILTERS.map((f) => (
                  <div key={f.param} className="flex items-center justify-between">
                    <span className="text-sm">{t(f.i18nKey)}</span>
                    <Switch
                      checked={Boolean(initialFilters[f.key])}
                      onCheckedChange={() => toggleFlag(f.param, Boolean(initialFilters[f.key]))}
                    />
                  </div>
                ))}
              </div>

              <Button variant="ghost" onClick={() => router.push("/discover")}>
                <X className="size-4" /> {t("clearFilters")}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Mood chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {MOODS.map((mood) => {
          const active = (initialFilters.moods ?? []).includes(mood.key);
          return (
            <button
              key={mood.key}
              onClick={() => toggleMood(mood.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-accent bg-accent-soft text-accent-foreground"
                  : "border-border bg-card hover:bg-surface-muted"
              }`}
            >
              <span>{mood.emoji}</span> {tMoods(`${mood.i18nKey}.label`)}
            </button>
          );
        })}
      </div>

      {/* Main layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="sticky top-20 h-[calc(100vh-7rem)]">
            <StylizedMap cafes={mapCafes} activeId={activePin} onActiveChange={setActivePin} />
          </div>
        </div>

        <div>
          {cafes.length === 0 ? (
            <EmptyState
              icon={ListFilter}
              title={t("emptyTitle")}
              description={t("emptyDescription")}
              action={
                <Button variant="outline" onClick={() => router.push("/discover")}>
                  {t("clearFilters")}
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {cafes.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} favorited={favSet.has(cafe.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile floating map button + sheet */}
      <Sheet open={mapOpen} onOpenChange={setMapOpen}>
        <SheetTrigger asChild>
          <Button
            onClick={() => setMapOpen(true)}
            className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 shadow-xl lg:hidden"
          >
            <MapIcon className="size-4" /> {t("map")}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>{t("map")}</SheetTitle>
          </SheetHeader>
          <div className="h-[calc(85vh-5rem)] px-4 pb-4">
            <StylizedMap cafes={mapCafes} activeId={activePin} onActiveChange={setActivePin} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
