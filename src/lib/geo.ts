export const CITY_CENTER: Record<string, { lat: number; lng: number }> = {
  Tashkent: { lat: 41.2995, lng: 69.2401 },
  Samarkand: { lat: 39.627, lng: 66.9749 },
  Bukhara: { lat: 39.7747, lng: 64.4286 },
};

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function distanceLabel(cafe: { lat: number; lng: number; city: string }) {
  const center = CITY_CENTER[cafe.city] ?? CITY_CENTER.Tashkent;
  const km = distanceKm(center, cafe);
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
