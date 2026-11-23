"use client";

import "leaflet/dist/leaflet.css";

import type { Map as LeafletMap, Marker } from "leaflet";
import { useEffect, useRef } from "react";

import { priceLevelLabel } from "@/lib/utils";
import { cn } from "@/lib/utils";

type MapCafe = {
  id: string;
  slug: string;
  name: string;
  lat: number;
  lng: number;
  vibeScore: number;
  heroImageUrl: string;
  priceLevel: number;
  rating: number;
};

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

function pinHtml(cafe: MapCafe, active: boolean) {
  return `<div class="vc-pin${active ? " vc-pin--active" : ""}">
    <span class="vc-pin__label">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/></svg>
      ${cafe.vibeScore}
    </span>
    <span class="vc-pin__tip"></span>
  </div>`;
}

function popupHtml(cafe: MapCafe) {
  const name = escapeHtml(cafe.name);
  return `<a href="/cafe/${encodeURIComponent(cafe.slug)}" class="vc-popup">
    <img src="${escapeHtml(cafe.heroImageUrl)}" alt="${name}" class="vc-popup__img" />
    <span class="vc-popup__body">
      <span class="vc-popup__name">${name}</span>
      <span class="vc-popup__meta">★ ${cafe.rating.toFixed(1)} · ${escapeHtml(priceLevelLabel(cafe.priceLevel))} · Vibe ${cafe.vibeScore}</span>
    </span>
  </a>`;
}

// Groups points that lie within ~50 km of each other and returns the biggest group.
function largestCluster<T extends { lat: number; lng: number }>(points: T[]): T[] {
  const groups: T[][] = [];
  for (const p of points) {
    const g = groups.find((grp) => Math.abs(grp[0].lat - p.lat) < 0.45 && Math.abs(grp[0].lng - p.lng) < 0.6);
    if (g) g.push(p);
    else groups.push([p]);
  }
  return groups.sort((a, b) => b.length - a.length)[0] ?? [];
}

// Real interactive map (Leaflet + OpenStreetMap/CARTO tiles). The name is kept
// from the earlier stylized placeholder so existing imports keep working.
export function StylizedMap({
  cafes,
  activeId,
  onActiveChange,
  className,
}: {
  cafes: MapCafe[];
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; cafe: MapCafe }>>(new Map());
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current || mapRef.current) return;
      leafletRef.current = L;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([41.3111, 69.2797], 12);
      L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION, maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      // Containers inside sticky/sheet layouts can report 0 size on first paint.
      setTimeout(() => map.invalidateSize(), 200);
      syncMarkers();
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncMarkers() {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const valid = cafes.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
    for (const cafe of valid) {
      const icon = L.divIcon({ html: pinHtml(cafe, false), className: "vc-pin-wrap", iconSize: [56, 34], iconAnchor: [28, 34], popupAnchor: [0, -34] });
      const marker = L.marker([cafe.lat, cafe.lng], { icon, riseOnHover: true })
        .bindPopup(popupHtml(cafe), { closeButton: false, className: "vc-popup-wrap", offset: [0, -2] })
        .addTo(map);
      marker.on("mouseover", () => onActiveChangeRef.current?.(cafe.id));
      marker.on("mouseout", () => onActiveChangeRef.current?.(null));
      marker.on("click", () => onActiveChangeRef.current?.(cafe.id));
      markersRef.current.set(cafe.id, { marker, cafe });
    }

    // Cafés can span several cities (hundreds of km apart). Frame the cluster
    // with the most cafés so pins stay readable; pan/zoom reaches the rest.
    const focus = largestCluster(valid);
    if (focus.length > 1) {
      map.fitBounds(L.latLngBounds(focus.map((c) => [c.lat, c.lng] as [number, number])), { padding: [40, 40], maxZoom: 14 });
    } else if (focus.length === 1) {
      map.setView([focus[0].lat, focus[0].lng], 14);
    }
  }

  // Re-draw markers when the filtered café list changes.
  useEffect(() => {
    syncMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafes.map((c) => c.id).join(",")]);

  // Highlight the active pin (e.g. when hovering a card in the list).
  useEffect(() => {
    const L = leafletRef.current;
    if (!L) return;
    markersRef.current.forEach(({ marker, cafe }, id) => {
      const active = id === activeId;
      marker.setIcon(L.divIcon({ html: pinHtml(cafe, active), className: "vc-pin-wrap", iconSize: [56, 34], iconAnchor: [28, 34], popupAnchor: [0, -34] }));
      marker.setZIndexOffset(active ? 1000 : 0);
    });
  }, [activeId]);

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-3xl border border-border", className)}>
      <div ref={containerRef} className="vc-map h-full w-full" />
    </div>
  );
}
